// studentdashboard.tsx - Renamed for case-sensitive routing
import { Feather as Icon } from "@expo/vector-icons";
import { Query } from "appwrite";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatCard from "../../components/StatCard"; // Using your existing StatCard component
import { account, DATABASE_ID, databases, QUIZ_COLLECTION_ID } from "../../utils/appwrite-config";

type QuizType = {
  id: string;
  title: string;
  course: string;
  duration: string;
  questionCount: number;
  createdAt: string;
  completedAt?: string;
  status: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  questions: any[];
};

type QuizCardProps = {
  quiz: QuizType;
  onPress: () => void;
};

// QuizCard Component with glassmorphism, gradient, and animation
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

const QuizCard = ({ quiz, onPress }: QuizCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ marginBottom: 16 }}
    >
      <Animated.View style={[styles.quizCard, { transform: [{ scale }] }]}> 
        <LinearGradient
          colors={["rgba(96,165,250,0.18)", "rgba(37,99,235,0.10)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '600', color: '#1e293b', marginBottom: 2, fontSize: 16 }}>{quiz.title}</Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>{quiz.course}</Text>
          </View>
          <View style={{ marginLeft: 8 }}>
            {quiz.status === "completed" ? (
              <Icon name="check-circle" size={22} color="#22c55e" />
            ) : quiz.status === "in_progress" ? (
              <Icon name="play-circle" size={22} color="#2563eb" />
            ) : (
              <Icon name="alert-circle" size={22} color="#f59e42" />
            )}
          </View>
        </View>
        {quiz.status === "completed" ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#64748b' }}>
              Completed: {quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : "N/A"}
            </Text>
            <Text style={{ fontWeight: '600', color: '#22c55e' }}>
              {quiz.score}% ({quiz.correctAnswers}/{quiz.totalQuestions})
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: '#f59e42' }}>
              {quiz.status === "in_progress" ? "In Progress" : "Not Started"}
            </Text>
            <View style={{ borderRadius: 8, overflow: 'hidden' }}>
              <Pressable
                onPress={onPress}
                style={({ pressed }) => [{
                  backgroundColor: quiz.status === "in_progress" ? '#2563eb' : '#22c55e',
                  paddingHorizontal: 20,
                  paddingVertical: 5,
                  borderRadius: 8,
                  opacity: pressed ? 0.85 : 1,
                }]}
              >
                <Text style={{ fontSize: 13, color: '#fff', fontWeight: '500' }}>
                  {quiz.status === "in_progress" ? "Continue" : "Start Quiz"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  quizCard: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#2563eb',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.18)',
    marginBottom: 0,
    overflow: 'hidden',
  },
});

const StudentDashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("U");
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
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
        DATABASE_ID,
        QUIZ_COLLECTION_ID,
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

  const handleQuizPress = (quiz: QuizType) => {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Modern Header with Gradient and Wave */}
        <View style={{ position: 'relative', marginBottom: 24 }}>
          <LinearGradient
            colors={["#2563eb", "#60a5fa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 150, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
          >
            {/* Decorative Wave */}
            {/* <View style={{ position: 'absolute', bottom: -24, left: 0, right: 0, height: 48, zIndex: 1 }}>
              <View style={{
                backgroundColor: '#f1f5f9',
                height: 48,
                borderTopLeftRadius: 48,
                borderTopRightRadius: 48,
                opacity: 0.9
              }} />
            </View> */}
            {/* Header Content */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 36 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Avatar with shadow */}
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  shadowColor: '#2563eb',
                  shadowOpacity: 0.18,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6
                }}>
                  <Text style={{ color: '#2563eb', fontSize: 28, fontWeight: 'bold' }}>{userInitial}</Text>
                </View>
                <View>
                  <Text style={{ color: '#fff', fontSize: 18, opacity: 0.9 }}>Welcome back,</Text>
                  <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', letterSpacing: 0.5 }}>{userName.split(' ')[0]}!</Text>
                  <Text style={{ color: '#e0e7ef', fontSize: 15, marginTop: 2, opacity: 0.85 }}>Student Dashboard</Text>
                </View>
              </View>
              <TouchableOpacity
                style={{ backgroundColor: '#fff', borderRadius: 20, padding: 10, shadowColor: '#2563eb', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4, position: 'relative' }}
                onPress={() => router.push("/notification/NotificationsScreen")}
              >
                <Icon name="bell" size={22} color="#2563eb" />
                {/* Notification badge */}
                <View style={{ position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', borderWidth: 1, borderColor: '#fff' }} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 20, gap: 12, justifyContent: 'space-between' }}>
          <StatCard
            iconName="file-text"
            title="Completed Quizzes"
            value={isLoading ? "..." : stats.completedQuizzes.toString()}
            change={
              stats.completedQuizzes > 0
                ? "+" + Math.min(stats.completedQuizzes, 2) + " recent"
                : "Start taking quizzes"
            }
            iconColor="#2563eb"
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
            iconColor="#22c55e"
          />
          <StatCard
            iconName="book"
            title="Courses"
            value={isLoading ? "..." : stats.coursesEnrolled.toString()}
            change="Active"
            changeColor="text-blue-500"
            iconColor="#a21caf"
          />
          <StatCard
            iconName="clock"
            title="Pending Quizzes"
            value={isLoading ? "..." : stats.pendingQuizzes.toString()}
            change={stats.pendingQuizzes > 0 ? "Awaiting" : "All caught up!"}
            changeColor={
              stats.pendingQuizzes > 0 ? "text-orange-500" : "text-green-500"
            }
            iconColor="#f59e42"
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
