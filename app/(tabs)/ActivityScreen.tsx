// ActivityScreen.tsx - Updated to use real user names from auth
import { Query } from "appwrite";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ActivityItem from "../../components/ActivityItem";
import { databases } from "../../utils/appwrite-config";

const ActivityScreen = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getActivityColor = (index) => {
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

  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0].substring(0, 2).toUpperCase();
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
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
        "688fc0cd00083417e772", // Your database ID
        "688fc0ed003716ec278c", // Your collection ID
        [
          Query.orderDesc("$updatedAt"), // Order by most recent updates
          Query.limit(30), // Get more records to have enough activities
        ]
      );

      const activityList = [];

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
      activityList.sort((a, b) => b.timestamp - a.timestamp);

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
        },
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
    <SafeAreaView className="flex-1">
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-3xl font-bold text-gray-900 px-4 py-5">
          Recent Activity
        </Text>

        {isLoading ? (
          <View className="px-4">
            <Text className="text-gray-500">Loading activities...</Text>
          </View>
        ) : activities.length === 0 ? (
          <View className="px-4 py-8 items-center">
            <Text className="text-lg font-medium text-gray-500">
              No recent activity
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Activity will appear here when students interact with quizzes
            </Text>
          </View>
        ) : (
          <View>
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
            <View className="px-4 py-6 mt-4">
              <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  Activity Summary
                </Text>
                <Text className="text-gray-600">
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
