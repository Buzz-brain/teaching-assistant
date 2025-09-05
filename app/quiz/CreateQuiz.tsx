import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { databases, ID } from "../../utils/appwrite-config"; // Import from your config file

const CreateQuizScreen = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [duration, setDuration] = useState("30");
  const [questions, setQuestions] = useState([]);
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

  const deleteQuestion = (id) => {
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
        "688fc0cd00083417e772", // Your actual database ID
        "688fc0ed003716ec278c", // Your actual collection ID
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
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 bg-gray-100">
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3 pr-4"
              onPress={() => router.back()}
            >
              <Text className="text-2xl text-gray-600">
                <Ionicons name="arrow-back-sharp" size={24} />
              </Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Create Quiz</Text>
          </View>
        </View>

        <View className="p-4 space-y-4">
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Quiz Information
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3 text-base"
              placeholder="Enter quiz title..."
              value={quizTitle}
              onChangeText={setQuizTitle}
            />
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Select Course:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              <View className="flex-row space-x-2">
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course}
                    className={`px-4 py-2 rounded-full border ${
                      selectedCourse === course
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => setSelectedCourse(course)}
                  >
                    <Text
                      className={`text-sm ${
                        selectedCourse === course
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {course}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              placeholder="Duration (minutes)"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>

          {questions.length > 0 && (
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Added Questions ({questions.length})
              </Text>
              {questions.map((q, index) => (
                <View
                  key={q.id}
                  className="border-l-4 border-blue-500 bg-blue-50 p-3 mb-3 rounded"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-sm font-bold text-blue-600">
                      Question {index + 1}
                    </Text>
                    <TouchableOpacity
                      className="bg-red-500 px-2 py-1 rounded"
                      onPress={() => deleteQuestion(q.id)}
                    >
                      <Text className="text-white text-xs">Delete</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-sm text-gray-800 mb-2">
                    {q.question}
                  </Text>
                  {q.options.map((option, optIndex) => (
                    <Text
                      key={optIndex}
                      className={`text-xs ml-2 ${
                        optIndex === q.correctAnswer
                          ? "text-green-600 font-bold"
                          : "text-gray-600"
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                      {optIndex === q.correctAnswer && " ✓"}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Add New Question
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3 text-base h-20"
              placeholder="Enter your question here..."
              value={questionText}
              onChangeText={setQuestionText}
              multiline
              textAlignVertical="top"
            />
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Answer Options:
            </Text>
            <View className="flex-row items-center mb-2">
              <TouchableOpacity
                className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                  correctAnswer === 0
                    ? "border-green-500 bg-green-500"
                    : "border-gray-400"
                }`}
                onPress={() => setCorrectAnswer(0)}
              >
                {correctAnswer === 0 && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </TouchableOpacity>
              <Text className="w-6 text-sm font-medium text-gray-700 mr-2">
                A.
              </Text>
              <TextInput
                className="flex-1 border border-gray-300 rounded p-2 text-sm"
                placeholder="Option A"
                value={optionA}
                onChangeText={setOptionA}
              />
            </View>
            <View className="flex-row items-center mb-2">
              <TouchableOpacity
                className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                  correctAnswer === 1
                    ? "border-green-500 bg-green-500"
                    : "border-gray-400"
                }`}
                onPress={() => setCorrectAnswer(1)}
              >
                {correctAnswer === 1 && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </TouchableOpacity>
              <Text className="w-6 text-sm font-medium text-gray-700 mr-2">
                B.
              </Text>
              <TextInput
                className="flex-1 border border-gray-300 rounded p-2 text-sm"
                placeholder="Option B"
                value={optionB}
                onChangeText={setOptionB}
              />
            </View>
            <View className="flex-row items-center mb-2">
              <TouchableOpacity
                className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                  correctAnswer === 2
                    ? "border-green-500 bg-green-500"
                    : "border-gray-400"
                }`}
                onPress={() => setCorrectAnswer(2)}
              >
                {correctAnswer === 2 && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </TouchableOpacity>
              <Text className="w-6 text-sm font-medium text-gray-700 mr-2">
                C.
              </Text>
              <TextInput
                className="flex-1 border border-gray-300 rounded p-2 text-sm"
                placeholder="Option C (optional)"
                value={optionC}
                onChangeText={setOptionC}
              />
            </View>
            <View className="flex-row items-center mb-4">
              <TouchableOpacity
                className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                  correctAnswer === 3
                    ? "border-green-500 bg-green-500"
                    : "border-gray-400"
                }`}
                onPress={() => setCorrectAnswer(3)}
              >
                {correctAnswer === 3 && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </TouchableOpacity>
              <Text className="w-6 text-sm font-medium text-gray-700 mr-2">
                D.
              </Text>
              <TextInput
                className="flex-1 border border-gray-300 rounded p-2 text-sm"
                placeholder="Option D (optional)"
                value={optionD}
                onChangeText={setOptionD}
              />
            </View>
            <TouchableOpacity
              className="bg-blue-500 rounded-lg py-3 items-center"
              onPress={addQuestion}
            >
              <Text className="text-white font-semibold text-base">
                + Add Question
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-green-600 rounded-lg py-4 items-center mb-6"
            onPress={publishQuiz}
          >
            <Text className="text-white font-bold text-lg">
              🚀 Publish Quiz
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateQuizScreen;
