// WriteQuiz.tsx - Updated to store user ID on completion
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { account, DATABASE_ID, databases, QUIZ_COLLECTION_ID } from "../../utils/appwrite-config";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

type QuizType = {
  id: string;
  title: string;
  course: string;
  duration: number;
  questions: QuizQuestion[];
  status?: string;
};

const StudentQuizScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [currentView, setCurrentView] = useState("taking");
  type AnswerType = { questionId: string; selectedOption: number };
  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [answers, setAnswers] = useState<AnswerType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizLoaded, setQuizLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id as string);
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };
    getCurrentUser();
  }, []);

  // Load quiz data from params or fetch from database
  useEffect(() => {
    if (quizLoaded) return;

    const loadQuiz = async () => {
      try {
        console.log("Loading quiz with params:", params);

        const quizId = Array.isArray(params.quizId) ? params.quizId[0] : params.quizId;
        const quizData = Array.isArray(params.quizData) ? params.quizData[0] : params.quizData;

        if (quizData) {
          // Quiz data passed from QuizScreen
          const quiz = JSON.parse(quizData);
          console.log(
            "Loaded quiz from params:",
            quiz.title,
            "Status:",
            quiz.status
          );

          setSelectedQuiz(quiz);
          setTimeLeft(quiz.duration * 60);
          setQuizLoaded(true);

          // Only update status to in_progress if it's currently pending
          if (quiz.status === "pending") {
            try {
              await databases.updateDocument(
                DATABASE_ID,
                QUIZ_COLLECTION_ID,
                quiz.id,
                {
                  status: "in_progress",
                  startedAt: new Date().toISOString(),
                  startedBy: currentUserId, // Store who started the quiz
                }
              );
              console.log("Updated quiz status from pending to in_progress");
              // Update local state
              setSelectedQuiz((prev) => prev ? { ...prev, status: "in_progress" } : prev);
            } catch (updateError) {
              console.warn("Failed to update quiz status:", updateError);
            }
          } else if (quiz.status === "completed") {
            // If quiz is already completed, don't allow access
            Alert.alert(
              "Quiz Already Completed",
              "This quiz has already been completed.",
              [{ text: "OK", onPress: () => router.back() }]
            );
            return;
          }
        } else if (quizId) {
          // Fetch quiz data from database using ID
          console.log("Fetching quiz by ID:", quizId);

          const response = await databases.getDocument(
            DATABASE_ID,
            QUIZ_COLLECTION_ID,
            quizId
          );

          if (response.status === "completed") {
            Alert.alert(
              "Quiz Already Completed",
              "This quiz has already been completed.",
              [{ text: "OK", onPress: () => router.back() }]
            );
            return;
          }

          const questions = JSON.parse(response.questions || "[]");
          const quiz = {
            id: response.$id,
            title: response.title,
            course: response.course,
            duration: response.duration,
            questions: questions,
            status: response.status,
          };

          console.log(
            "Fetched quiz from database:",
            quiz.title,
            "Status:",
            quiz.status
          );

          setSelectedQuiz(quiz);
          setTimeLeft(quiz.duration * 60);
          setQuizLoaded(true);

          // Only update to in_progress if currently pending
          if (quiz.status === "pending") {
            try {
              await databases.updateDocument(
                DATABASE_ID,
                QUIZ_COLLECTION_ID,
                quiz.id,
                {
                  status: "in_progress",
                  startedAt: new Date().toISOString(),
                  startedBy: currentUserId, // Store who started the quiz
                }
              );
              console.log("Updated quiz status from pending to in_progress");
              setSelectedQuiz((prev) => prev ? { ...prev, status: "in_progress" } : prev);
            } catch (updateError) {
              console.warn("Failed to update quiz status:", updateError);
            }
          }
        } else {
          console.error("No quiz data or ID provided");
          Alert.alert("Error", "No quiz data provided", [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        Alert.alert("Error", "Failed to load quiz data", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [params.quizId, params.quizData, quizLoaded, currentUserId]);

  // Timer effect - separate from quiz loading
  useEffect(() => {
    if (currentView === "taking" && timeLeft > 0 && selectedQuiz) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentView === "taking" && selectedQuiz) {
      submitQuiz();
    }
  }, [timeLeft, currentView, selectedQuiz]);

  const selectAnswer = (questionId: string, optionIndex: number) => {
    const existingAnswerIndex = answers.findIndex(
      (a: AnswerType) => a.questionId === questionId
    );
    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex].selectedOption = optionIndex;
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { questionId, selectedOption: optionIndex }]);
    }
  };

  const nextQuestion = () => {
    if (
      selectedQuiz &&
      currentQuestionIndex < selectedQuiz.questions.length - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    if (!selectedQuiz || !currentUserId) return;
    try {
      let correctAnswers = 0;
      selectedQuiz.questions.forEach((question: QuizQuestion) => {
        const userAnswer = answers.find((a: AnswerType) => a.questionId === question.id);
        if (
          userAnswer &&
          userAnswer.selectedOption === question.correctAnswer
        ) {
          correctAnswers++;
        }
      });

      const percentage = Math.round(
        (correctAnswers / selectedQuiz.questions.length) * 100
      );

      // Get current user info
      const currentUser = await account.get();

      // Update quiz status to completed in database with user info
      try {
        await databases.updateDocument(
          DATABASE_ID,
          QUIZ_COLLECTION_ID,
          selectedQuiz.id,
          {
            status: "completed",
            completedAt: new Date().toISOString(),
            completedBy: currentUserId, // Store who completed the quiz
            completedByName: currentUser.name, // Store the user's name for easy access
            score: percentage,
            totalQuestions: selectedQuiz.questions.length,
            correctAnswers: correctAnswers,
          }
        );
        console.log(
          "Quiz submitted successfully with score:",
          percentage,
          "by user:",
          currentUser.name
        );
      } catch (updateError) {
        console.error("Failed to update quiz completion status:", updateError);
        // Still show the result even if DB update fails
      }

      Alert.alert(
        "Quiz Completed!",
        `You scored ${correctAnswers}/${selectedQuiz.questions.length} (${percentage}%)`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error submitting quiz:", error);
      Alert.alert("Error", "Failed to submit quiz. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCurrentAnswer = (questionId: string) => {
    return answers.find((a: AnswerType) => a.questionId === questionId)?.selectedOption;
  };

  // Show loading screen
  if (loading || !selectedQuiz) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#64748b' }}>Loading quiz...</Text>
      </View>
    );
  }

  // Check if quiz has questions
  if (!selectedQuiz.questions || selectedQuiz.questions.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#ef4444', fontWeight: '600' }}>
          No questions found in this quiz
        </Text>
        <TouchableOpacity
          style={{ marginTop: 24, backgroundColor: '#2563eb', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
  const currentAnswer = getCurrentAnswer(currentQuestion.id);

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      {/* Gradient Header */}
      <View style={{ position: 'relative', marginBottom: 0 }}>
        <View style={{ height: 120, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden', justifyContent: 'flex-end' }}>
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
            <View style={{
              backgroundColor: '#2563eb',
              flex: 1,
              opacity: 0.98,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }} />
            {/* <View style={{
              position: 'absolute',
              bottom: -18,
              left: 0,
              right: 0,
              height: 36,
              backgroundColor: '#f1f5f9',
              borderTopLeftRadius: 36,
              borderTopRightRadius: 36,
              opacity: 0.9,
            }} /> */}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', height: 120, paddingHorizontal: 24, zIndex: 2, justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 }}>{selectedQuiz.title}</Text>
              <Text style={{ color: '#e0e7ef', fontSize: 15, marginTop: 6, opacity: 0.85 }}>Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}</Text>
              {selectedQuiz.status && (
                <Text style={{ color: '#bae6fd', fontSize: 13, marginTop: 2, fontWeight: '500' }}>Status: {selectedQuiz.status}</Text>
              )}
            </View>
            
            <View style={{ backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4 }}>
              <Text style={{ color: timeLeft < 300 ? '#ef4444' : '#1e293b', fontWeight: 'bold', fontSize: 18 }}>{formatTime(timeLeft)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, marginHorizontal: 18, marginTop: 8, marginBottom: 0, overflow: 'hidden' }}>
        <View
          style={{
            height: 6,
            backgroundColor: '#2563eb',
            borderRadius: 3,
            width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%`,
            // transition: 'width 0.3s',
          }}
        />
      </View>

      {/* Question */}
      <ScrollView style={{ flex: 1, padding: 18 }}>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 18, padding: 18, marginBottom: 18, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 12, lineHeight: 26 }}>{currentQuestion.question}</Text>

          {/* Options */}
          <View>
            {currentQuestion.options.map((option: string, index: number) => {
              const selected = currentAnswer === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: selected ? 'rgba(37,99,235,0.08)' : '#fff',
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selected ? '#2563eb' : '#e5e7eb',
                    marginBottom: 12,
                    shadowColor: selected ? '#2563eb' : undefined,
                    shadowOpacity: selected ? 0.10 : 0,
                    shadowRadius: selected ? 8 : 0,
                    shadowOffset: selected ? { width: 0, height: 2 } : undefined,
                    elevation: selected ? 2 : 0,
                  }}
                  onPress={() => selectAnswer(currentQuestion.id, index)}
                  activeOpacity={0.85}
                >
                  <View style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: selected ? '#2563eb' : '#cbd5e1',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}>
                    {selected && (
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563eb' }} />
                    )}
                  </View>
                  <Text style={{ flex: 1, fontSize: 16, color: selected ? '#2563eb' : '#334155', fontWeight: selected ? '600' : '400' }}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={{ backgroundColor: '#fff', padding: 18, borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity
          style={{
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: currentQuestionIndex === 0 ? '#cbd5e1' : '#2563eb',
            backgroundColor: currentQuestionIndex === 0 ? '#f1f5f9' : '#fff',
            opacity: currentQuestionIndex === 0 ? 0.7 : 1,
            shadowColor: '#2563eb',
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
          onPress={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: currentQuestionIndex === 0 ? '#94a3b8' : '#2563eb' }}>Previous</Text>
        </TouchableOpacity>

        {currentQuestionIndex === selectedQuiz.questions.length - 1 ? (
          <TouchableOpacity
            style={{ backgroundColor: '#22c55e', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, shadowColor: '#22c55e', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
            onPress={() => setShowConfirmModal(true)}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Submit Quiz</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ backgroundColor: '#2563eb', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, shadowColor: '#2563eb', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
            onPress={nextQuestion}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Confirm Submit Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.98)', margin: 20, padding: 28, borderRadius: 22, alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#1e293b' }}>
              Submit Quiz?
            </Text>
            <Text style={{ fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 18, lineHeight: 22 }}>
              Are you sure you want to submit? You have answered {answers.length} out of {selectedQuiz.questions.length} questions.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#f1f5f9', marginRight: 4 }}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={{ color: '#64748b', fontSize: 16, fontWeight: '500' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#22c55e', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14, marginLeft: 4, shadowColor: '#22c55e', shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 }}
                onPress={() => {
                  setShowConfirmModal(false);
                  submitQuiz();
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StudentQuizScreen;
