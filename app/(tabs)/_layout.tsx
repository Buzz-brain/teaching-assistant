// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getRole = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole");
        console.log("Retrieved role from storage:", role);
        setUserRole(role || "student");
      } catch (error) {
        console.error("Error getting user role:", error);
        setUserRole("student");
      } finally {
        setIsLoading(false);
      }
    };
    getRole();
  }, []);

  if (isLoading) {
    return null;
  }

  console.log("Current user role:", userRole);

  return (
    <Tabs
      initialRouteName={userRole === "teacher" ? "index" : "StudentDashboard"}
      screenOptions={{
        tabBarActiveTintColor: "#007AFF", // Blue for active
        tabBarInactiveTintColor: "#8E8E93", // Gray for inactive
        tabBarStyle: {
          backgroundColor: "#FFFFFF", // Always white background
          borderTopWidth: 1,
          borderTopColor: "#E5E5EA", // Light gray border
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -3,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard is open
      }}
    >
      {/* Teacher Tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size}
            />
          ),
          href: userRole === "teacher" ? "/(tabs)/" : null,
        }}
      />
      <Tabs.Screen
        name="CoursesScreen"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              color={color}
              size={size}
            />
          ),
          href: userRole === "teacher" ? "/(tabs)/CoursesScreen" : null,
        }}
      />
      <Tabs.Screen
        name="ScheduleScreenTeacher"
        options={{
          title: "Schedules",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              color={color}
              size={size}
            />
          ),
          href: userRole === "teacher" ? "/(tabs)/ScheduleScreenTeacher" : null,
        }}
      />
      <Tabs.Screen
        name="ActivityScreen"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              color={color}
              size={size}
            />
          ),
          href: userRole === "teacher" ? "/(tabs)/ActivityScreen" : null,
        }}
      />

      {/* Student Tabs */}
      <Tabs.Screen
        name="StudentDashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              color={color}
              size={size}
            />
          ),
          href: userRole === "student" ? "/(tabs)/StudentDashboard" : null,
        }}
      />
      <Tabs.Screen
        name="ScheduleScreen"
        options={{
          title: "Schedules",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              color={color}
              size={size}
            />
          ),
          href: userRole === "student" ? "/(tabs)/ScheduleScreen" : null,
        }}
      />
      <Tabs.Screen
        name="QuizScreen"
        options={{
          title: "Quizzes",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              color={color}
              size={size}
            />
          ),
          href: userRole === "student" ? "/(tabs)/QuizScreen" : null,
        }}
      />
      <Tabs.Screen
        name="HelpScreen"
        options={{
          title: "Help",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "help-circle" : "help-circle-outline"}
              color={color}
              size={size}
            />
          ),
          href: userRole === "student" ? "/(tabs)/HelpScreen" : null,
        }}
      />

      {/* Common Tab for Both */}
      <Tabs.Screen
        name="MoreScreen"
        options={{
          title: "More",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "menu" : "menu-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
