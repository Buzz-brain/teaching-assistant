// app/schedule/ScheduleScreenTeacher.tsx
import { Feather as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Query } from "appwrite";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DATABASE_ID,
  databases,
  SCHEDULES_COLLECTION_ID,
} from "../../utils/appwrite-config";

const ScheduleScreenTeacher = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedules = async () => {
    try {
      const role = await AsyncStorage.getItem("userRole");
      const userId = await AsyncStorage.getItem("userId");
      console.log("Fetching schedules with userId:", userId);
      setUserRole(role || "student");
      setUserId(userId || null);

      if (role !== "teacher" || !userId) {
        Alert.alert("Error", "Invalid user role or ID. Please log in again.");
        router.replace("/(tabs)");
        return;
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        SCHEDULES_COLLECTION_ID,
        [
          Query.equal("isActive", true),
          Query.equal("teacherId", userId),
          Query.orderDesc("createdAt"),
        ]
      );

      const formattedSchedules = response.documents.map((schedule) => ({
        id: schedule.$id,
        name: schedule.name,
        teacherId: schedule.teacherId,
        isActive: schedule.isActive,
        weekSchedule: JSON.parse(schedule.weekSchedule || "[]"),
        createdAt: schedule.createdAt,
      }));

      setSchedules(formattedSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      Alert.alert("Error", "Failed to load schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userId) fetchSchedules();
    }, [userId])
  );

  useEffect(() => {
    fetchSchedules();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchedules();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-600">Loading schedules...</Text>
      </SafeAreaView>
    );
  }

  if (userRole !== "teacher") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-red-600">
          Access Denied: Teachers Only
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4 mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Your Schedules
            </Text>
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg"
              onPress={() => router.push("/schedule/ScheduleCreateScreen")}
            >
              <Text className="text-white font-semibold">Create Schedule</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600">
            {schedules.length} active schedules
          </Text>
        </View>

        <View className="px-4 pb-8">
          {schedules.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Icon name="calendar" size={48} color="#9CA3AF" />
              <Text className="text-lg font-medium text-gray-500 mt-4">
                No schedules available
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Create a new schedule to get started
              </Text>
            </View>
          ) : (
            schedules.map((schedule) => (
              <View
                key={schedule.id}
                className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100"
              >
                <Text className="text-xl font-semibold text-gray-900 mb-2">
                  {schedule.name}
                </Text>
                <Text className="text-gray-600 mb-2">
                  Created: {new Date(schedule.createdAt).toLocaleDateString()}
                </Text>
                {schedule.weekSchedule.map((cls, index) => (
                  <View
                    key={index}
                    className="border-t border-gray-200 pt-2 mt-2"
                  >
                    <Text className="text-sm font-medium text-gray-800">
                      {cls.day} - {cls.subject}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {cls.time} | {cls.location} | {cls.type}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Students: {cls.students}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleScreenTeacher;
