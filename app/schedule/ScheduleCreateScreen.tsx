// app/schedule/ScheduleCreateScreen.tsx
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
import {
  DATABASE_ID,
  databases,
  ID,
  Permission,
  Role,
  SCHEDULES_COLLECTION_ID,
} from "../../utils/appwrite-config";

const ScheduleCreateScreen = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [scheduleName, setScheduleName] = useState("");
  const [classes, setClasses] = useState([]); // Local state for UI
  const [classDay, setClassDay] = useState("");
  const [classSubject, setClassSubject] = useState("");
  const [classLocation, setClassLocation] = useState("");
  const [classType, setClassType] = useState("");
  const [classTime, setClassTime] = useState("");
  const [classStudents, setClassStudents] = useState("");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const types = ["Lecture", "Lab", "Tutorial", "Project"];
  const subjects = [
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
        console.log("Checking role:", role, "userId:", userId);
        setUserRole(role || "student");
        setUserId(userId || null);
        if (role !== "teacher" || !userId) {
          Alert.alert("Access Denied", "Only teachers can create schedules.");
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

  const addClass = () => {
    if (
      !classDay ||
      !classSubject ||
      !classLocation ||
      !classType ||
      !classTime ||
      !classStudents
    ) {
      Alert.alert("Error", "Please fill all class fields");
      return;
    }

    const newClass = {
      id: Date.now().toString(),
      day: classDay,
      subject: classSubject,
      location: classLocation,
      type: classType,
      time: classTime,
      students: parseInt(classStudents),
    };

    setClasses([...classes, newClass]);
    setClassDay("");
    setClassSubject("");
    setClassLocation("");
    setClassType("");
    setClassTime("");
    setClassStudents("");
    Alert.alert("Success", "Class added successfully!");
  };

  const deleteClass = (id) => {
    setClasses(classes.filter((c) => c.id !== id));
  };

  const publishSchedule = async () => {
    if (!scheduleName.trim()) {
      Alert.alert("Error", "Please enter schedule name");
      return;
    }
    if (classes.length === 0) {
      Alert.alert("Error", "Please add at least one class");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      router.replace("/(tabs)");
      return;
    }

    try {
      const scheduleData = {
        name: scheduleName,
        teacherId: userId,
        isActive: true,
        weekSchedule: JSON.stringify(classes), // Store all class data here
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Publishing schedule with data:", scheduleData);

      await databases.createDocument(
        DATABASE_ID,
        SCHEDULES_COLLECTION_ID,
        ID.unique(),
        scheduleData,
        [
          Permission.read(Role.users()),
          Permission.write(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );

      Alert.alert(
        "Success",
        `Schedule "${scheduleName}" published successfully!`,
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/ScheduleScreenTeacher"),
          },
        ]
      );
    } catch (error) {
      console.error("Publish schedule error:", error);
      Alert.alert("Error", `Failed to publish schedule: ${error.message}`);
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
            <Text className="text-xl font-bold text-gray-800">
              Create Schedule
            </Text>
          </View>
        </View>

        <View className="p-4 space-y-4">
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Schedule Information
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3 text-base"
              placeholder="Enter schedule name..."
              value={scheduleName}
              onChangeText={setScheduleName}
            />
          </View>

          {classes.length > 0 && (
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Added Classes ({classes.length})
              </Text>
              {classes.map((c, index) => (
                <View
                  key={c.id}
                  className="border-l-4 border-blue-500 bg-blue-50 p-3 mb-3 rounded"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-sm font-bold text-blue-600">
                      Class {index + 1}
                    </Text>
                    <TouchableOpacity
                      className="bg-red-500 px-2 py-1 rounded"
                      onPress={() => deleteClass(c.id)}
                    >
                      <Text className="text-white text-xs">Delete</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-sm text-gray-800">Day: {c.day}</Text>
                  <Text className="text-sm text-gray-800">
                    Subject: {c.subject}
                  </Text>
                  <Text className="text-sm text-gray-800">
                    Location: {c.location}
                  </Text>
                  <Text className="text-sm text-gray-800">Type: {c.type}</Text>
                  <Text className="text-sm text-gray-800">Time: {c.time}</Text>
                  <Text className="text-sm text-gray-800">
                    Students: {c.students}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Add New Class
            </Text>
            <Text className="text-sm font-medium text-gray-700 mb-2">Day:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              <View className="flex-row space-x-2">
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    className={`px-4 py-2 rounded-full border ${
                      classDay === day
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => setClassDay(day)}
                  >
                    <Text
                      className={`text-sm ${
                        classDay === day ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Subject:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              <View className="flex-row space-x-2">
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject}
                    className={`px-4 py-2 rounded-full border ${
                      classSubject === subject
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => setClassSubject(subject)}
                  >
                    <Text
                      className={`text-sm ${
                        classSubject === subject
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3 text-base"
              placeholder="Location (e.g., Room 101)"
              value={classLocation}
              onChangeText={setClassLocation}
            />
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Type:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              <View className="flex-row space-x-2">
                {types.map((type) => (
                  <TouchableOpacity
                    key={type}
                    className={`px-4 py-2 rounded-full border ${
                      classType === type
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => setClassType(type)}
                  >
                    <Text
                      className={`text-sm ${
                        classType === type ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3 text-base"
              placeholder="Time (e.g., 9:00 AM)"
              value={classTime}
              onChangeText={setClassTime}
            />
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-3 text-base"
              placeholder="Number of students"
              value={classStudents}
              onChangeText={setClassStudents}
              keyboardType="numeric"
            />
            <TouchableOpacity
              className="bg-blue-500 rounded-lg py-3 items-center"
              onPress={addClass}
            >
              <Text className="text-white font-semibold text-base">
                + Add Class
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-green-600 rounded-lg py-4 items-center mb-6"
            onPress={publishSchedule}
          >
            <Text className="text-white font-bold text-lg">
              🚀 Publish Schedule
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleCreateScreen;
