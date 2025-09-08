// StudentDashboard.tsx - Updated with fixed notification navigation
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
import StatCard from "../../components/StatCard"; // Using your existing StatCard component
import { account, databases } from "../../utils/appwrite-config";

// QuizCard Component
const QuizCard = ({ quiz, onPress }) => (
  <TouchableOpacity
    className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
    onPress={onPress}
  >
    <View className="flex-row items-start justify-between mb-2">
      <View className="flex-1">
        <Text className="font-semibold text-gray-900 mb-1">{quiz.title}</Text>
        <Text className="text-sm text-gray-500">{quiz.course}</Text>
      </View>
      <View className="ml-2">
        {quiz.status === "completed" ? (
          <Icon name="check-circle" size={20} color="#059669" />
        ) : quiz.status === "in_progress" ? (
          <Icon name="play-circle" size={20} color="#3B82F6" />
        ) : (
          <Icon name="alert-circle" size={20} color="#D97706" />
        )}
      </View>
    </View>

    {quiz.status === "completed" ? (
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-gray-500">
          Completed: {new Date(quiz.completedAt).toLocaleDateString()}
        </Text>
        <Text className="font-semibold text-green-600">
          {quiz.score}% ({quiz.correctAnswers}/{quiz.totalQuestions})
        </Text>
      </View>
    ) : (
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-orange-600">
          {quiz.status === "in_progress" ? "In Progress" : "Not Started"}
        </Text>
        <TouchableOpacity
          className={`px-3 py-1 rounded-lg ${
            quiz.status === "in_progress" ? "bg-blue-500" : "bg-green-500"
          }`}
          onPress={onPress}
        >
          <Text className="text-sm text-white font-medium">
            {quiz.status === "in_progress" ? "Continue" : "Start Quiz"}
          </Text>
        </TouchableOpacity>
      </View>
    )}
  </TouchableOpacity>
);

const StudentDashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("U");
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    completedQuizzes: 0,
    averageScore: 0,
    coursesEnrolled: 3, // Keep this as is for now
    pendingQuizzes: 0,
  });

  // Fetch user data and quizzes
  const fetchData = async () => {
    try {
      // Get user info
      const user = await account.get();
      const fullName = user.name || "User";
      setUserName(fullName);
      setUserInitial(fullName.charAt(0).toUpperCase());

      // Fetch all quizzes
      const response = await databases.listDocuments(
        "688fc0cd00083417e772", // Your database ID
        "688fc0ed003716ec278c", // Your collection ID
        [
          Query.orderDesc("$createdAt"), // Show newest first
          Query.limit(50), // Limit to recent quizzes
        ]
      );

      const formattedQuizzes = response.documents.map((quiz) => {
        const questions = JSON.parse(quiz.questions || "[]");
        return {
          id: quiz.$id,
          title: quiz.title,
          course: quiz.course,
          duration: quiz.duration,
          questionCount: questions.length,
          createdAt: quiz.createdAt,
          completedAt: quiz.completedAt,
          status: quiz.status || "pending",
          score: quiz.score || 0,
          correctAnswers: quiz.correctAnswers || 0,
          totalQuestions: quiz.totalQuestions || questions.length,
          questions: questions,
        };
      });

      setQuizzes(formattedQuizzes);

      // Calculate stats from real data
      const completed = formattedQuizzes.filter(
        (q) => q.status === "completed"
      );
      const pending = formattedQuizzes.filter((q) => q.status === "pending");
      const inProgress = formattedQuizzes.filter(
        (q) => q.status === "in_progress"
      );

      // Calculate average score from completed quizzes
      const avgScore =
        completed.length > 0
          ? Math.round(
              completed.reduce((sum, quiz) => sum + quiz.score, 0) /
                completed.length
            )
          : 0;

      setStats({
        completedQuizzes: completed.length,
        averageScore: avgScore,
        coursesEnrolled: 3, // Keep static for now
        pendingQuizzes: pending.length + inProgress.length,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use useFocusEffect to refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleQuizPress = (quiz) => {
    // Navigate to the quiz taking screen
    router.push({
      pathname: "/quiz/WriteQuiz",
      params: {
        quizId: quiz.id,
        quizData: JSON.stringify(quiz),
      },
    });
  };

  // Get recent quizzes (last 5)
  const recentQuizzes = quizzes.slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 mb-4">
          <View className="flex-row items-center flex-1">
            {/* User Initial Circle */}
            <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
              <Text className="text-white text-xl font-bold">
                {userInitial}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                Welcome back, {userName.split(" ")[0]}!
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="bg-blue-500 rounded-full p-2 ml-2"
            onPress={() => router.push("/notification/NotificationsScreen")}
          >
            <Icon name="bell" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View className="flex-row flex-wrap p-4 gap-3">
          <StatCard
            iconName="file-text"
            title="Completed Quizzes"
            value={isLoading ? "..." : stats.completedQuizzes.toString()}
            change={`${
              stats.completedQuizzes > 0
                ? "+" + Math.min(stats.completedQuizzes, 2) + " recent"
                : "Start taking quizzes"
            }`}
            iconColor="bg-blue-500"
          />
          <StatCard
            iconName="award"
            title="Average Score"
            value={isLoading ? "..." : `${stats.averageScore}%`}
            change={
              stats.averageScore >= 80
                ? "Great!"
                : stats.averageScore >= 60
                ? "Good"
                : "Keep improving"
            }
            changeColor={
              stats.averageScore >= 80
                ? "text-green-500"
                : stats.averageScore >= 60
                ? "text-blue-500"
                : "text-orange-500"
            }
            iconColor="bg-green-500"
          />
          <StatCard
            iconName="book"
            title="Courses"
            value={isLoading ? "..." : stats.coursesEnrolled.toString()}
            change="Active"
            changeColor="text-blue-500"
            iconColor="bg-purple-500"
          />
          <StatCard
            iconName="clock"
            title="Pending Quizzes"
            value={isLoading ? "..." : stats.pendingQuizzes.toString()}
            change={stats.pendingQuizzes > 0 ? "Awaiting" : "All caught up!"}
            changeColor={
              stats.pendingQuizzes > 0 ? "text-orange-500" : "text-green-500"
            }
            iconColor="bg-orange-500"
          />
        </View>

        {/* Recent Quizzes */}
        <View className="p-4 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900">
              Recent Quizzes
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/QuizScreen")}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="bg-white rounded-xl p-6 items-center">
              <Text className="text-gray-500">Loading quizzes...</Text>
            </View>
          ) : recentQuizzes.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center">
              <Icon name="file-text" size={48} color="#9CA3AF" />
              <Text className="text-lg font-medium text-gray-500 mt-4">
                No quizzes available
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Check back later for new quizzes
              </Text>
            </View>
          ) : (
            recentQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onPress={() => handleQuizPress(quiz)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentDashboard;
