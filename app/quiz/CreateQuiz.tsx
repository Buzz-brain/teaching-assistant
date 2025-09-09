import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DATABASE_ID, databases, ID, QUIZ_COLLECTION_ID } from "../../utils/appwrite-config"; // Import from your config file
type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

const CreateQuizScreen = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [duration, setDuration] = useState("30");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const courses = [
    "Advanced Mathematics",
    "Computer Science 101",
    "Data Structures",
    "Algorithm Design",
  ];

  useEffect(() => {
    const checkRole = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole");
        const userId = await AsyncStorage.getItem("userId");
        setUserRole(role || "student");
        setUserId(userId || "anonymous");
        if (role !== "teacher") {
          Alert.alert("Access Denied", "Only teachers can create quizzes.");
          router.replace("/(tabs)");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to verify user role.");
        router.replace("/(tabs)");
      }
    };
    checkRole();
  }, []);

  if (userRole !== "teacher") {
    return null;
  }

  const addQuestion = () => {
    if (!questionText.trim()) {
      Alert.alert("Error", "Please enter a question");
      return;
    }

    if (!optionA.trim() || !optionB.trim()) {
      Alert.alert("Error", "Please provide at least options A and B");
      return;
    }

    const newQuestion = {
      id: Date.now().toString(),
      question: questionText,
      options: [optionA, optionB, optionC, optionD].filter((opt) => opt.trim()),
      correctAnswer: correctAnswer,
    };

    setQuestions([...questions, newQuestion]);
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer(0);
    Alert.alert("Success", "Question added successfully!");
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // In your publishQuiz function, update the quizData object:

  const publishQuiz = async () => {
    if (!quizTitle.trim()) {
      Alert.alert("Error", "Please enter quiz title");
      return;
    }
    if (!selectedCourse) {
      Alert.alert("Error", "Please select a course");
      return;
    }
    if (questions.length === 0) {
      Alert.alert("Error", "Please add at least one question");
      return;
    }

    try {
      const quizData = {
        title: quizTitle,
        course: selectedCourse,
        duration: parseInt(duration),
        questions: JSON.stringify(questions),
        createdBy: userId,
        createdAt: new Date().toISOString(),
        status: "pending", // Add this line - quiz starts as pending
      };

        await databases.createDocument(
          DATABASE_ID,
          QUIZ_COLLECTION_ID,
          ID.unique(),
          quizData,
          [] // No document-level permissions for now
        );

      Alert.alert("Success", `Quiz "${quizTitle}" published successfully!`, [
        { text: "OK", onPress: () => router.push("/(tabs)") },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to publish quiz. Please try again.");
      console.error("Publish quiz error:", error);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Gradient Header */}
        <LinearGradient
          colors={["#2563eb", "#60a5fa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 36, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, marginBottom: 12, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ marginRight: 18, paddingRight: 12 }}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back-sharp" size={28} color="#fff" />
            </TouchableOpacity>
            <Ionicons name="create-outline" size={28} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 }}>Create Quiz</Text>
          </View>
        </LinearGradient>

        <View style={{ padding: 18, gap: 18 }}>
          {/* Quiz Info Card */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: 18, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 10 }}>Quiz Information</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 16, backgroundColor: '#f8fafc', color: '#1e293b' }}
              placeholder="Enter quiz title..."
              value={quizTitle}
              onChangeText={setQuizTitle}
              placeholderTextColor="#94a3b8"
            />
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#334155', marginBottom: 6 }}>Select Course:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 8,
                      borderRadius: 18,
                      borderWidth: 2,
                      borderColor: selectedCourse === course ? '#2563eb' : '#cbd5e1',
                      backgroundColor: selectedCourse === course ? '#2563eb' : '#fff',
                      marginRight: 8,
                      shadowColor: selectedCourse === course ? '#2563eb' : undefined,
                      shadowOpacity: selectedCourse === course ? 0.10 : 0,
                      shadowRadius: selectedCourse === course ? 8 : 0,
                      shadowOffset: selectedCourse === course ? { width: 0, height: 2 } : undefined,
                      elevation: selectedCourse === course ? 2 : 0,
                    }}
                    onPress={() => setSelectedCourse(course)}
                    activeOpacity={0.85}
                  >
                    <Text style={{ fontSize: 15, color: selectedCourse === course ? '#fff' : '#334155', fontWeight: selectedCourse === course ? '700' : '500' }}>{course}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: '#f8fafc', color: '#1e293b' }}
              placeholder="Duration (minutes)"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {questions.length > 0 && (
            <View style={{ backgroundColor: 'rgba(236,245,255,0.95)', borderRadius: 18, padding: 16, shadowColor: '#2563eb', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: '#2563eb', marginBottom: 10 }}>Added Questions ({questions.length})</Text>
              {questions.map((q: Question, index: number) => (
                <View key={q.id} style={{ borderLeftWidth: 4, borderLeftColor: '#2563eb', backgroundColor: '#e0e7ef', padding: 12, marginBottom: 10, borderRadius: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#2563eb' }}>Question {index + 1}</Text>
                    <TouchableOpacity
                      style={{ backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                      onPress={() => deleteQuestion(q.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize: 14, color: '#1e293b', marginBottom: 4 }}>{q.question}</Text>
                  {q.options.map((option: string, optIndex: number) => (
                    <Text
                      key={optIndex}
                      style={{ fontSize: 13, marginLeft: 8, color: optIndex === q.correctAnswer ? '#16a34a' : '#64748b', fontWeight: optIndex === q.correctAnswer ? '700' : '500' }}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                      {optIndex === q.correctAnswer && ' ✓'}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Add New Question Card */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 18, shadowColor: '#2563eb', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 10 }}>Add New Question</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 16, backgroundColor: '#f8fafc', color: '#1e293b', minHeight: 64, textAlignVertical: 'top' }}
              placeholder="Enter your question here..."
              value={questionText}
              onChangeText={setQuestionText}
              multiline
              placeholderTextColor="#94a3b8"
            />
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#334155', marginBottom: 6 }}>Answer Options:</Text>
            {[0, 1, 2, 3].map((idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: idx === 3 ? 16 : 8 }}>
                <TouchableOpacity
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    borderWidth: 2,
                    borderColor: correctAnswer === idx ? '#22c55e' : '#cbd5e1',
                    backgroundColor: correctAnswer === idx ? '#22c55e' : '#fff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                  onPress={() => setCorrectAnswer(idx)}
                  activeOpacity={0.85}
                >
                  {correctAnswer === idx && (
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>✓</Text>
                  )}
                </TouchableOpacity>
                <Text style={{ width: 22, fontSize: 15, fontWeight: '600', color: '#334155', marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</Text>
                <TextInput
                  style={{ flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 8, fontSize: 15, backgroundColor: '#f8fafc', color: '#1e293b' }}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}${idx > 1 ? ' (optional)' : ''}`}
                  value={idx === 0 ? optionA : idx === 1 ? optionB : idx === 2 ? optionC : optionD}
                  onChangeText={
                    idx === 0
                      ? setOptionA
                      : idx === 1
                      ? setOptionB
                      : idx === 2
                      ? setOptionC
                      : setOptionD
                  }
                  placeholderTextColor="#94a3b8"
                />
              </View>
            ))}
            <TouchableOpacity
              style={{ backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 2, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
              onPress={addQuestion}
              activeOpacity={0.85}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>+ Add Question</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ backgroundColor: '#22c55e', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginBottom: 18, shadowColor: '#22c55e', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
            onPress={publishQuiz}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 0.5 }}>🚀 Publish Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateQuizScreen;
