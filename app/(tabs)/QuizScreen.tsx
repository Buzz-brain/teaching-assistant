// QuizScreen.tsx - Fixed version with proper status handling
import { Feather as Icon } from "@expo/vector-icons";
import { Query } from "appwrite";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { databases } from "../../utils/appwrite-config";

// Available Quiz Card Component
const AvailableQuizCard = ({ quiz, onPress }) => {
  const getDifficultyLevel = (questionCount) => {
    if (questionCount <= 10) return { level: "Easy", color: "green" };
    if (questionCount <= 20) return { level: "Medium", color: "yellow" };
    return { level: "Hard", color: "red" };
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return { text: "Not Started", color: "orange", icon: "circle" };
      case "in_progress":
        return { text: "In Progress", color: "blue", icon: "play-circle" };
      case "completed":
        return { text: "Completed", color: "green", icon: "check-circle" };
      default:
        return { text: "Not Started", color: "orange", icon: "circle" };
    }
  };

  const difficulty = getDifficultyLevel(quiz.questionCount);
  const statusDisplay = getStatusDisplay(quiz.status);

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <View className="bg-blue-100 rounded-xl p-3 mr-4">
            <Icon name="file-text" size={24} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-gray-900 mb-1">
              {quiz.title}
            </Text>
            <Text className="text-gray-600">{quiz.course}</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Created: {new Date(quiz.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            difficulty.color === "red"
              ? "bg-red-100"
              : difficulty.color === "yellow"
              ? "bg-yellow-100"
              : "bg-green-100"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              difficulty.color === "red"
                ? "text-red-800"
                : difficulty.color === "yellow"
                ? "text-yellow-800"
                : "text-green-800"
            }`}
          >
            {difficulty.level}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="flex-row items-center">
          <Icon name="file-text" size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-2">
            {quiz.questionCount} Questions
          </Text>
        </View>
        <View className="flex-row items-center">
          <Icon name="clock" size={16} color="#6B7280" />
          <Text className="text-gray-600 ml-2">{quiz.duration} mins</Text>
        </View>
        <View className="flex-row items-center">
          <Icon
            name={statusDisplay.icon}
            size={16}
            color={
              statusDisplay.color === "orange"
                ? "#F59E0B"
                : statusDisplay.color === "blue"
                ? "#3B82F6"
                : "#10B981"
            }
          />
          <Text
            className={`ml-2 text-sm font-medium ${
              statusDisplay.color === "orange"
                ? "text-orange-600"
                : statusDisplay.color === "blue"
                ? "text-blue-600"
                : "text-green-600"
            }`}
          >
            {statusDisplay.text}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className={`py-3 rounded-lg ${
          quiz.status === "completed"
            ? "bg-gray-400"
            : quiz.status === "in_progress"
            ? "bg-blue-500"
            : "bg-blue-500"
        }`}
        onPress={onPress}
        disabled={quiz.status === "completed"}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {quiz.status === "completed"
            ? "Already Completed"
            : quiz.status === "in_progress"
            ? "Continue Quiz"
            : "Start Quiz"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const QuizScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quizzes from database
  const fetchQuizzes = async () => {
    try {
      console.log("Fetching quizzes from database...");
      const response = await databases.listDocuments(
        "688fc0cd00083417e772", // Your database ID
        "688fc0ed003716ec278c", // Your collection ID
        [
          Query.orderDesc("$createdAt"), // Show newest first
        ]
      );

      console.log("Fetched", response.documents.length, "quizzes");

      const formattedQuizzes = response.documents.map((quiz) => {
        const questions = JSON.parse(quiz.questions || "[]");
        console.log(`Quiz "${quiz.title}" status:`, quiz.status);
        return {
          id: quiz.$id,
          title: quiz.title,
          course: quiz.course,
          duration: quiz.duration,
          questionCount: questions.length,
          createdAt: quiz.createdAt,
          status: quiz.status || "pending", // Make sure status is properly set
          questions: questions, // Store questions for later use
        };
      });

      setQuizzes(formattedQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchQuizzes();
    }, [])
  );

  // Also keep the original useEffect for initial load
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuizzes();
    setRefreshing(false);
  };

  const handleStartQuiz = (quiz) => {
    console.log("Starting quiz:", quiz.title, "Status:", quiz.status);

    // Navigate to WriteQuiz screen with quiz data
    router.push({
      pathname: "/quiz/WriteQuiz",
      params: {
        quizId: quiz.id,
        quizData: JSON.stringify(quiz),
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-600">Loading quizzes...</Text>
      </SafeAreaView>
    );
  }

  const pendingQuizzes = quizzes.filter((q) => q.status === "pending");
  const inProgressQuizzes = quizzes.filter((q) => q.status === "in_progress");
  const completedQuizzes = quizzes.filter((q) => q.status === "completed");

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="p-4 mb-4">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Available Quizzes
          </Text>
          <Text className="text-gray-600">
            {pendingQuizzes.length} pending • {inProgressQuizzes.length} in
            progress • {completedQuizzes.length} completed
          </Text>
        </View>

        {/* Filter/Sort Options */}
        <View className="flex-row px-4 mb-6">
          <TouchableOpacity className="bg-white px-4 py-2 rounded-lg mr-3 border border-gray-200">
            <View className="flex-row items-center">
              <Icon name="filter" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2">Filter</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white px-4 py-2 rounded-lg border border-gray-200">
            <View className="flex-row items-center">
              <Icon name="sort-desc" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2">Sort</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Available Quizzes */}
        <View className="px-4 pb-8">
          {quizzes.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Icon name="file-text" size={48} color="#9CA3AF" />
              <Text className="text-lg font-medium text-gray-500 mt-4">
                No quizzes available
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Check back later for new quizzes
              </Text>
            </View>
          ) : (
            quizzes.map((quiz) => (
              <AvailableQuizCard
                key={quiz.id}
                quiz={quiz}
                onPress={() => handleStartQuiz(quiz)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QuizScreen;
