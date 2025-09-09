// app/auth/AuthScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { ID } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import { account } from "../../utils/appwrite-config";

const { width } = Dimensions.get("window");

// Move components outside to prevent re-creation
import type { KeyboardTypeOptions } from "react-native";
type InputFieldProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  showToggle?: boolean;
  onToggleShow?: () => void;
  showValue?: boolean;
  keyboardType?: KeyboardTypeOptions;
  icon?: React.ReactNode;
};

const InputField = React.memo(
  React.forwardRef<TextInput, InputFieldProps>(
    (
      {
        placeholder,
        value,
        onChangeText,
        secureTextEntry = false,
        error,
        showToggle = false,
        onToggleShow,
        showValue = false,
        keyboardType = "default",
        icon,
      },
      ref
    ) => {
      const handleChangeText = useCallback(
        (text: string) => {
          onChangeText(text);
        },
        [onChangeText]
      );

      return (
        <View style={{ marginBottom: 18 }}>
          <View style={{ position: "relative" }}>
            <View style={{
              position: "absolute",
              left: 16,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2,
              flexDirection: "row"
            }}>
              {icon}
            </View>
            <TextInput
              ref={ref}
              style={{
                borderWidth: 1,
                borderColor: error ? "#ef4444" : "#d1d5db",
                paddingVertical: 14,
                paddingLeft: 48,
                paddingRight: showToggle ? 70 : 16,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.85)",
                color: "#111827",
                fontSize: 16,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
              }}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              value={value}
              onChangeText={handleChangeText}
              secureTextEntry={secureTextEntry && !showValue}
              keyboardType={keyboardType}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {showToggle && (
              <TouchableOpacity
                style={{ position: "absolute", right: 16, top: 14 }}
                onPress={onToggleShow}
              >
                <Text style={{ color: "#2563eb", fontWeight: "500" }}>
                  {showValue ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {error && (
            <Text style={{ color: "#ef4444", fontSize: 13, marginTop: 4, marginLeft: 4 }}>{error}</Text>
          )}
        </View>
      );
    }
  )
);

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

const CustomButton = React.memo(
  ({ title, onPress, variant = "primary", disabled = false }: CustomButtonProps) => (
    <TouchableOpacity
      className={`py-4 px-6 rounded-xl mb-3 shadow-sm
                 ${
                   variant === "primary"
                     ? disabled
                       ? "bg-gray-400"
                       : "bg-blue-600"
                     : "bg-transparent border border-gray-300"
                 }
                 ${disabled ? "opacity-50" : ""}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-center">
        {disabled && (
          <ActivityIndicator
            color={variant === "primary" ? "white" : "gray"}
            className="mr-2"
          />
        )}
        <Text
          className={`font-semibold text-center
                     ${variant === "primary" ? "text-white" : "text-gray-700"}
                     ${disabled ? "opacity-70" : ""}`}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  )
);

type AuthScreenProps = {
  onAuthComplete?: () => void;
  onLogout?: () => void;
};

const AuthScreen = ({ onAuthComplete = () => {}, onLogout = () => {} }: AuthScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        if (storedEmail) {
          const user = await account.get();
          await AsyncStorage.setItem("userId", user.$id); // Store userId
          await AsyncStorage.setItem("userRole", user.prefs?.role || "student");
          setIsLoggedIn(true);
          // Redirect to dashboard immediately if session exists
          const redirectPath = user.prefs?.role === "teacher" ? "/(tabs)" : "/(tabs)/StudentDashboard";
          router.replace(redirectPath);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.log("No active session:", error);
        setIsLoggedIn(false);
        await AsyncStorage.multiRemove(["userEmail", "userId", "userRole"]);
      }
    };
    checkSession();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isSignup) {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Always clear all sessions and storage before login attempt
      try {
        await account.deleteSessions?.();
      } catch {}
      await AsyncStorage.multiRemove(["userEmail", "userId", "userRole"]);

      let user;
      if (isSignup) {
        user = await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
        await AsyncStorage.setItem("userId", user.$id); // Store userId
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userRole", role);
        await account.updatePrefs({ role });
        Alert.alert("Success", "Account created successfully!");
      } else {
        await account.createEmailPasswordSession(email, password);
        user = await account.get();
        const userRole = user.prefs?.role || "student";
        await AsyncStorage.setItem("userId", user.$id); // Store userId
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userRole", userRole);
        await account.updatePrefs({ role: userRole });
        Alert.alert("Success", "Signed in successfully!");
      }

      setIsLoggedIn(true);

      // On web, force a reload to ensure session/cookies are synced
      if (typeof window !== 'undefined' && window.location) {
        setTimeout(() => window.location.reload(), 500);
        return;
      }
      // Redirect based on role (native)
      const redirectPath =
        user.prefs?.role === "teacher"
          ? "/(tabs)"
          : "/(tabs)/StudentDashboard";
      router.replace(redirectPath);
      onAuthComplete();
    } catch (error: any) {
      console.log("Auth error:", error);
      let errorMessage = "An error occurred during authentication";
      // Handle Appwrite session already active error
      if (
        typeof error === "object" &&
        error !== null &&
        (error.message?.includes("session is active") || error.message?.includes("prohibited when a session is active"))
      ) {
        try {
          // Try to get the user; if it works, redirect
          const user = await account.get();
          await AsyncStorage.setItem("userId", user.$id);
          await AsyncStorage.setItem("userRole", user.prefs?.role || "student");
          setIsLoggedIn(true);
          const redirectPath = user.prefs?.role === "teacher" ? "/(tabs)" : "/(tabs)/StudentDashboard";
          router.replace(redirectPath);
          onAuthComplete();
          return;
        } catch (sessionError: any) {
          // If session is invalid (401), force delete all sessions and clear storage
          // Always try to delete all sessions, clear storage, and reload the page (web) to reset cookies
          try {
            await account.deleteSessions?.();
          } catch {}
          await AsyncStorage.multiRemove(["userEmail", "userId", "userRole"]);
          setIsLoggedIn(false);
          errorMessage = "Session was invalid and has been cleared. Please log in again.";
          // On web, force a reload to clear Appwrite cookies
          if (typeof window !== 'undefined' && window.location) {
            setTimeout(() => window.location.reload(), 500);
          }
        }
      } else if (typeof error === "object" && error !== null) {
        const err = error as { message?: string; code?: number };
        if (err.message) errorMessage = err.message;
        else if (err.code === 401) errorMessage = "Invalid email or password";
        else if (err.code === 409)
          errorMessage = "An account with this email already exists";
      }
      Alert.alert("Authentication Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSessions?.();
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      await AsyncStorage.multiRemove(["userEmail", "userId", "userRole"]);
      setIsLoggedIn(false);
      setEmail("");
      setPassword("");
      setName("");
      setIsSignup(false);
      setErrors({});
      // On web, only reload if session/cookies are not cleared (fallback)
      if (typeof window !== 'undefined' && window.location) {
        // Try to check if session is still active
        try {
          await account.get();
          // If still logged in, force reload
          setTimeout(() => window.location.reload(), 500);
          return;
        } catch {}
      }
      onLogout();
    }
  };

  // Only show login/signup form if not logged in (no session)
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#e0e7ff" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}>
            {/* Background gradient */}
            <View style={{
              ...(StyleSheet.absoluteFillObject as object),
              zIndex: -1,
              backgroundColor: "#e0e7ff"
            }}>
              <View style={{
                flex: 1,
                backgroundColor: "#e0e7ff",
                opacity: 0.9
              }} />
            </View>
            {/* Logo */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <View style={{ width: 80, height: 80, borderRadius: 24, marginBottom: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 44, color: "#2563eb" }}>🔐</Text>
              </View>
              <Text style={{ fontSize: 32, fontWeight: "bold", color: "#1e293b", marginBottom: 4 }}>
                {isSignup ? "Create Account" : "Welcome Back"}
              </Text>
              <Text style={{ color: "#64748b", textAlign: "center", fontSize: 16 }}>
                {isSignup
                  ? "Join us and start your learning journey"
                  : "Sign in to continue your progress"}
              </Text>
            </View>
            {/* Glassmorphism Card */}
            <View style={{
              backgroundColor: "rgba(255,255,255,0.85)",
              borderRadius: 28,
              padding: 24,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              marginBottom: 24,
            }}>
              <InputField
                ref={emailRef}
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                icon={<Text style={{ fontSize: 20, color: "#2563eb" }}>📧</Text>}
              />
              {isSignup && (
                <InputField
                  ref={nameRef}
                  placeholder="Full name"
                  value={name}
                  onChangeText={setName}
                  error={errors.name}
                  icon={<Text style={{ fontSize: 20, color: "#2563eb" }}>👤</Text>}
                />
              )}
              <InputField
                ref={passwordRef}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                error={errors.password}
                showToggle={true}
                onToggleShow={() => setShowPassword(!showPassword)}
                showValue={showPassword}
                icon={<Text style={{ fontSize: 20, color: "#2563eb" }}>🔒</Text>}
              />
              {isSignup && (
                <View style={{ marginBottom: 18 }}>
                  <Text style={{ color: "#334155", fontWeight: "500", marginBottom: 8 }}>Role</Text>
                  <View style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 18, backgroundColor: "#fff", overflow: "hidden" }}>
                    <Picker
                      selectedValue={role}
                      onValueChange={setRole}
                      style={{ height: 50 }}
                    >
                      <Picker.Item label="👨‍🎓 Student" value="student" />
                      <Picker.Item label="👩‍🏫 Teacher" value="teacher" />
                    </Picker>
                  </View>
                </View>
              )}
              <CustomButton
                title={isSignup ? "Create Account" : "Sign In"}
                onPress={handleAuth}
                disabled={isLoading}
              />
            </View>
            {isLoggedIn && (
              <View style={{ alignItems: "center" }}>
                <CustomButton
                  title="Logout"
                  onPress={handleLogout}
                  variant="primary"
                />
              </View>
            )}
            {!isLoggedIn && (
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#64748b", marginBottom: 8, fontSize: 16 }}>
                  {isSignup
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsSignup(!isSignup);
                    setErrors({});
                    setEmail("");
                    setPassword("");
                    setName("");
                  }}
                  disabled={isLoading}
                >
                  <Text style={{ color: "#2563eb", fontWeight: "bold", fontSize: 18 }}>
                    {isSignup ? "Sign In" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ marginTop: 32, alignItems: "center" }}>
              <Text style={{ color: "#94a3b8", fontSize: 13, textAlign: "center" }}>
                By continuing, you agree to our Terms of Service
                {"\n"}and Privacy Policy
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
  // If logged in, don't render anything (redirect handled in useEffect)
  return null;
};

export default AuthScreen;
