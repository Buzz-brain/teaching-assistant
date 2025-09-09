// QuizScreen.tsx - Fixed version with proper status handling
import { Feather as Icon } from "@expo/vector-icons";
import { Query } from "appwrite";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DATABASE_ID, databases, QUIZ_COLLECTION_ID } from "../../utils/appwrite-config";

// Available Quiz Card Component
type Quiz = {
  id: string;
  title: string;
  course: string;
  duration: number;
  questionCount: number;
  createdAt: string;
  status: string;
  questions: any;
};

const AvailableQuizCard = ({ quiz, onPress }: { quiz: Quiz; onPress: (quiz: Quiz) => void }) => {
  const getDifficultyLevel = (questionCount: number) => {
    if (questionCount <= 10) return { level: "Easy", color: "#22c55e", bg: "#dcfce7" };
    if (questionCount <= 20) return { level: "Medium", color: "#eab308", bg: "#fef9c3" };
    return { level: "Hard", color: "#ef4444", bg: "#fee2e2" };
  };
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "Not Started", color: "#f59e42", icon: "circle" };
      case "in_progress":
        return { text: "In Progress", color: "#2563eb", icon: "play-circle" };
      case "completed":
        return { text: "Completed", color: "#22c55e", icon: "check-circle" };
      default:
        return { text: "Not Started", color: "#f59e42", icon: "circle" };
    }
  };
  const difficulty = getDifficultyLevel(quiz.questionCount);
  const statusDisplay = getStatusDisplay(quiz.status);
  return (
    <Pressable
      onPress={() => onPress(quiz)}
      style={({ pressed }) => [
        styles.quizCard,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.96 },
      ]}
      android_ripple={{ color: "#e0e7ff" }}
      disabled={quiz.status === "completed"}
    >
      <LinearGradient
        colors={["#fff", "#f1f5f9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              backgroundColor: "#dbeafe",
              borderRadius: 16,
              padding: 10,
              marginRight: 14,
            }}
          >
            <Icon name="file-text" size={24} color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1e293b",
                marginBottom: 2,
              }}
            >
              {quiz.title}
            </Text>
            <Text style={{ color: "#64748b", fontSize: 15 }}>
              {quiz.course}
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>
              Created: {new Date(quiz.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: difficulty.bg,
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 4,
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{ fontSize: 13, fontWeight: "600", color: difficulty.color }}
          >
            {difficulty.level}
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon name="file-text" size={16} color="#6B7280" />
          <Text style={{ color: "#64748b", marginLeft: 6, fontSize: 14 }}>
            {quiz.questionCount} Questions
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon name="clock" size={16} color="#6B7280" />
          <Text style={{ color: "#64748b", marginLeft: 6, fontSize: 14 }}>
            {quiz.duration} mins
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon
            name={statusDisplay.icon as any}
            size={16}
            color={statusDisplay.color}
          />
          <Text
            style={{
              marginLeft: 6,
              fontSize: 14,
              fontWeight: "600",
              color: statusDisplay.color,
            }}
          >
            {statusDisplay.text}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={() => onPress(quiz)}
        disabled={quiz.status === "completed"}
        style={({ pressed }) => [
          {
            backgroundColor:
              quiz.status === "completed" ? "#d1d5db" : "#2563eb",
            borderRadius: 12,
            paddingVertical: 13,
            marginTop: 2,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text
          style={{
            color: "#fff",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          {quiz.status === "completed"
            ? "Already Completed"
            : quiz.status === "in_progress"
            ? "Continue Quiz"
            : "Start Quiz"}
        </Text>
      </Pressable>
    </Pressable>
  );
};

const QuizScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch quizzes from database
  const fetchQuizzes = async () => {
    try {
      console.log("Fetching quizzes from database...");
      const response = await databases.listDocuments(
        DATABASE_ID,
        QUIZ_COLLECTION_ID,
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

  const handleStartQuiz = (quiz: Quiz) => {
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="file-text" size={40} color="#2563eb" style={{ marginBottom: 12, opacity: 0.7 }} />
        <Text style={{ fontSize: 18, color: '#64748b', fontWeight: '500' }}>Loading quizzes...</Text>
      </SafeAreaView>
    );
  }

  const pendingQuizzes = quizzes.filter((q: Quiz) => q.status === "pending");
  const inProgressQuizzes = quizzes.filter((q: Quiz) => q.status === "in_progress");
  const completedQuizzes = quizzes.filter((q: Quiz) => q.status === "completed");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      {/* Gradient Header */}
      <View style={{ position: 'relative', marginBottom: 18 }}>
        <LinearGradient
          colors={["#2563eb", "#60a5fa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 120, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 18, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Icon name="list" size={28} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 0.5 }}>Available Quizzes</Text>
          </View>
          <Text style={{ color: '#e0e7ef', fontSize: 15, opacity: 0.85 }}>{pendingQuizzes.length} pending • {inProgressQuizzes.length} in progress • {completedQuizzes.length} completed</Text>
        </LinearGradient>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Sleek Filter/Sort */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 18 }}>
          <Pressable
            style={({ pressed }) => [{
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingHorizontal: 18,
              paddingVertical: 10,
              marginRight: 10,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              flexDirection: 'row',
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
              shadowColor: '#2563eb',
              shadowOpacity: 0.06,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }]}
          >
            <Icon name="filter" size={16} color="#6B7280" />
            <Text style={{ color: '#334155', marginLeft: 8, fontWeight: '500', fontSize: 15 }}>Filter</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [{
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              flexDirection: 'row',
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
              shadowColor: '#2563eb',
              shadowOpacity: 0.06,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }]}
          >
            {/* @ts-ignore: sort-desc may not be in Feather types, but is valid in Expo vector icons */}
            <Icon name="sort-desc" size={16} color="#6B7280" />
            <Text style={{ color: '#334155', marginLeft: 8, fontWeight: '500', fontSize: 15 }}>Sort</Text>
          </Pressable>
        </View>
        {/* Available Quizzes */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {quizzes.length === 0 ? (
            <View style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 24, padding: 36, alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
              <Icon name="file-text" size={48} color="#9CA3AF" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#64748b', marginTop: 16 }}>No quizzes available</Text>
              <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>Check back later for new quizzes</Text>
            </View>
          ) : (
            quizzes.map((quiz) => (
              <AvailableQuizCard
                key={quiz.id}
                quiz={quiz}
                onPress={handleStartQuiz}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  quizCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#2563eb',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.13)',
    overflow: 'hidden',
  },
});

export default QuizScreen;
