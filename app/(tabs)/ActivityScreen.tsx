// ActivityScreen.tsx - Updated to use real user names from auth
import { Ionicons } from '@expo/vector-icons';
import { Query } from "appwrite";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ActivityItem from "../../components/ActivityItem";
import { DATABASE_ID, databases, QUIZ_COLLECTION_ID } from "../../utils/appwrite-config";

type Activity = {
  id: string;
  initials: string;
  name: string;
  action: string;
  time: string;
  color: string;
  timestamp?: Date;
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#2563eb',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.13)',
    marginBottom: 0,
    overflow: 'hidden',
  },
});

const ActivityScreen = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getActivityColor = (index: number) => {
    const colors = [
      "bg-indigo-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-blue-500",
      "bg-pink-500",
      "bg-orange-500",
    ];
    return colors[index % colors.length];
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0].substring(0, 2).toUpperCase();
  };

  const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const fetchActivities = async () => {
    try {
      // Fetch recent quiz activities
      const response = await databases.listDocuments(
        DATABASE_ID,
        QUIZ_COLLECTION_ID,
        [
          Query.orderDesc("$updatedAt"), // Order by most recent updates
          Query.limit(30), // Get more records to have enough activities
        ]
      );

  const activityList: Activity[] = [];

      // Process quiz activities
      response.documents.forEach((quiz, index) => {
        // Quiz creation activity
        if (quiz.createdAt) {
          activityList.push({
            id: `created-${quiz.$id}`,
            initials: "T", // Teacher created
            name: "you",
            action: `created "${quiz.title}"`,
            time: formatTimeAgo(quiz.createdAt),
            color: "bg-blue-500",
            timestamp: new Date(quiz.createdAt),
          });
        }

        // Quiz start activities (for in-progress quizzes)
        if (quiz.status === "in_progress" && quiz.startedAt) {
          // Use real user name if available, otherwise fall back to generic name
          const studentName = quiz.startedByName || "Student";

          activityList.push({
            id: `started-${quiz.$id}`,
            initials: getInitials(studentName),
            name: studentName,
            action: `started "${quiz.title}"`,
            time: formatTimeAgo(quiz.startedAt),
            color: getActivityColor(index + 3),
            timestamp: new Date(quiz.startedAt),
          });
        }

        // Quiz completion activities - Now with real user names!
        if (quiz.status === "completed" && quiz.completedAt) {
          // Use the real user name stored in completedByName
          const studentName = quiz.completedByName || "Student";
          const score = quiz.score || 0;

          activityList.push({
            id: `completed-${quiz.$id}`,
            initials: getInitials(studentName),
            name: studentName,
            action: `completed "${quiz.title}" (${score}%)`,
            time: formatTimeAgo(quiz.completedAt),
            color:
              score >= 80
                ? "bg-green-500"
                : score >= 60
                ? "bg-blue-500"
                : "bg-orange-500",
            timestamp: new Date(quiz.completedAt),
          });
        }
      });

      // Sort activities by timestamp (most recent first)
  activityList.sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0));

      // Take the most recent 20 activities
  setActivities(activityList.slice(0, 20));
    } catch (error) {
      console.error("Error fetching activities:", error);
      // Fallback to some mock data
      setActivities([
        {
          id: "fallback-1",
          initials: "NA",
          name: "No Activity",
          action: "No recent quiz activity found",
          time: "N/A",
          color: "bg-gray-500",
        } as Activity,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Use useFocusEffect to refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, [])
  );

  useEffect(() => {
    fetchActivities();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f1f5f9" }}>
      {/* Gradient Header - overlays activity list with floating effect */}
      <View style={{ position: "relative", marginBottom: 18 }}>
        <LinearGradient
          colors={["#2563eb", "#60a5fa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 120,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            justifyContent: "center",
            shadowColor: "#2563eb",
            shadowOpacity: 0.10,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 90,
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                borderRadius: 16,
                padding: 8,
                marginRight: 12,
              }}
            >
              <Ionicons name="time-outline" size={32} color="#fff" />
            </View>
            <Text
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: "bold",
                letterSpacing: 0.5,
              }}
            >
              Recent Activity
            </Text>
          </View>
        </LinearGradient>
      </View>
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ color: "#64748b", fontSize: 16 }}>
              Loading activities...
            </Text>
          </View>
        ) : activities.length === 0 ? (
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 32,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "500", color: "#64748b" }}>
              No recent activity
            </Text>
            <Text
              style={{ color: "#94a3b8", textAlign: "center", marginTop: 8 }}
            >
              Activity will appear here when students interact with quizzes
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, marginTop: 5, zIndex: 1 }}>
            {activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                initials={activity.initials}
                name={activity.name}
                action={activity.action}
                time={activity.time}
                color={activity.color}
              />
            ))}

            {/* Activity Summary */}
            <View style={{ marginTop: 24 }}>
              <View style={styles.summaryCard}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: 6,
                  }}
                >
                  Activity Summary
                </Text>
                <Text style={{ color: "#64748b", fontSize: 15 }}>
                  {
                    activities.filter((a) => a.action.includes("completed"))
                      .length
                  }{" "}
                  quizzes completed •{" "}
                  {
                    activities.filter((a) => a.action.includes("started"))
                      .length
                  }{" "}
                  quizzes started •{" "}
                  {
                    activities.filter((a) => a.action.includes("created"))
                      .length
                  }{" "}
                  quizzes created
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActivityScreen;
