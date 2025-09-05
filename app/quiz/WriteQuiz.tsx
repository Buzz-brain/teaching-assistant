// WriteQuiz.tsx - Updated to store user ID on completion
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { account, databases } from "../../utils/appwrite-config";

const StudentQuizScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [currentView, setCurrentView] = useState("taking");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizLoaded, setQuizLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
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

        if (params.quizData) {
          // Quiz data passed from QuizScreen
          const quiz = JSON.parse(params.quizData);
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
                "688fc0cd00083417e772",
                "688fc0ed003716ec278c",
                quiz.id,
                {
                  status: "in_progress",
                  startedAt: new Date().toISOString(),
                  startedBy: currentUserId, // Store who started the quiz
                }
              );
              console.log("Updated quiz status from pending to in_progress");
              // Update local state
              setSelectedQuiz((prev) => ({ ...prev, status: "in_progress" }));
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
        } else if (params.quizId) {
          // Fetch quiz data from database using ID
          console.log("Fetching quiz by ID:", params.quizId);

          const response = await databases.getDocument(
            "688fc0cd00083417e772",
            "688fc0ed003716ec278c",
            params.quizId
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
                "688fc0cd00083417e772",
                "688fc0ed003716ec278c",
                quiz.id,
                {
                  status: "in_progress",
                  startedAt: new Date().toISOString(),
                  startedBy: currentUserId, // Store who started the quiz
                }
              );
              console.log("Updated quiz status from pending to in_progress");
              setSelectedQuiz((prev) => ({ ...prev, status: "in_progress" }));
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

  const selectAnswer = (questionId, optionIndex) => {
    const existingAnswerIndex = answers.findIndex(
      (a) => a.questionId === questionId
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
      selectedQuiz.questions.forEach((question) => {
        const userAnswer = answers.find((a) => a.questionId === question.id);
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
          "688fc0cd00083417e772",
          "688fc0ed003716ec278c",
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCurrentAnswer = (questionId) => {
    return answers.find((a) => a.questionId === questionId)?.selectedOption;
  };

  // Show loading screen
  if (loading || !selectedQuiz) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-600">Loading quiz...</Text>
      </View>
    );
  }

  // Check if quiz has questions
  if (!selectedQuiz.questions || selectedQuiz.questions.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-red-600">
          No questions found in this quiz
        </Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
  const currentAnswer = getCurrentAnswer(currentQuestion.id);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Quiz Header */}
      <View className="bg-white p-4 border-b border-gray-200 flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold text-gray-900">
            {selectedQuiz.title}
          </Text>
          <Text className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of{" "}
            {selectedQuiz.questions.length}
          </Text>
          {selectedQuiz.status && (
            <Text className="text-xs text-blue-600 mt-1">
              Status: {selectedQuiz.status}
            </Text>
          )}
        </View>
        <View className="bg-gray-100 px-3 py-2 rounded-full">
          <Text
            className={`text-base font-semibold ${
              timeLeft < 300 ? "text-red-500" : "text-gray-800"
            }`}
          >
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-1 bg-gray-200">
        <View
          className="h-full bg-blue-500"
          style={{
            width: `${
              ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100
            }%`,
          }}
        />
      </View>

      {/* Question */}
      <ScrollView className="flex-1 p-4">
        <Text className="text-lg font-medium text-gray-900 mb-6 leading-6">
          {currentQuestion.question}
        </Text>

        {/* Options */}
        <View className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center p-4 bg-white rounded-lg border-2 ${
                currentAnswer === index
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onPress={() => selectAnswer(currentQuestion.id, index)}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                  currentAnswer === index
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
              >
                {currentAnswer === index && (
                  <View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                )}
              </View>
              <Text
                className={`flex-1 text-base ${
                  currentAnswer === index
                    ? "text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
              >
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="bg-white p-4 border-t border-gray-200 flex-row justify-between">
        <TouchableOpacity
          className={`px-6 py-3 rounded-lg border ${
            currentQuestionIndex === 0 ? "border-gray-300" : "border-blue-500"
          }`}
          onPress={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Text
            className={`text-base font-medium ${
              currentQuestionIndex === 0 ? "text-gray-400" : "text-blue-500"
            }`}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === selectedQuiz.questions.length - 1 ? (
          <TouchableOpacity
            className="bg-green-500 px-6 py-3 rounded-lg"
            onPress={() => setShowConfirmModal(true)}
          >
            <Text className="text-white text-base font-semibold">
              Submit Quiz
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={nextQuestion}
          >
            <Text className="text-white text-base font-medium">Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Confirm Submit Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white m-5 p-5 rounded-xl items-center">
            <Text className="text-lg font-semibold mb-2 text-gray-900">
              Submit Quiz?
            </Text>
            <Text className="text-base text-gray-600 text-center mb-5 leading-5">
              Are you sure you want to submit? You have answered{" "}
              {answers.length} out of {selectedQuiz.questions.length} questions.
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="px-5 py-2.5 rounded-lg border border-gray-300"
                onPress={() => setShowConfirmModal(false)}
              >
                <Text className="text-gray-600 text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-500 px-5 py-2.5 rounded-lg"
                onPress={() => {
                  setShowConfirmModal(false);
                  submitQuiz();
                }}
              >
                <Text className="text-white text-base font-medium">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StudentQuizScreen;
