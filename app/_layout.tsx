import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, AppState, View } from "react-native";
import AuthScreen from "../app/auth/AuthScreen";
import { account } from "../utils/appwrite-config";
import "./globals.css";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) {
        try {
          const user = await account.get();
          const role =
            user.prefs?.role ||
            (await AsyncStorage.getItem("userRole")) ||
            "student";

          if (user.prefs?.role) {
            await AsyncStorage.setItem("userRole", user.prefs.role);
          }

          setUserRole(role);
          setIsAuthenticated(true);
        } catch (error) {
          console.log("Session invalid, clearing storage:", error);
          await AsyncStorage.multiRemove(["userEmail", "userRole", "userId"]);
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for app state changes to recheck auth
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        checkAuth();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  // Listen for storage changes (when user logs out from another component)
  useEffect(() => {
    const interval = setInterval(async () => {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email && isAuthenticated) {
        // User logged out, update state
        setIsAuthenticated(false);
        setUserRole(null);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleAuthComplete = async () => {
    try {
      const user = await account.get();
      const role = user.prefs?.role || "student";

      await AsyncStorage.setItem("userRole", role);
      await AsyncStorage.setItem("userId", user.$id);
      setUserRole(role);
      setIsAuthenticated(true);

      // Navigate to appropriate screen based on role
      const redirectPath =
        role === "teacher" ? "/(tabs)/" : "/(tabs)/StudentDashboard";
      router.replace(redirectPath);
    } catch (error) {
      console.error("Auth complete error:", error);
      const storedRole = (await AsyncStorage.getItem("userRole")) || "student";
      setUserRole(storedRole);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      await AsyncStorage.multiRemove(["userEmail", "userRole", "userId"]);
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen onAuthComplete={handleAuthComplete} onLogout={handleLogout} />
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="quiz/CreateQuiz"
        options={{
          title: "Create Quiz",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="messages/SendMessage"
        options={{
          title: "Send Message",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="schedule/ScheduleCreateScreen"
        options={{
          title: "Create Schedule",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notification/NotificationsScreen"
        options={{
          title: "Notifications",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
