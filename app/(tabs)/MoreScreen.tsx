import { Feather as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { account } from "../../utils/appwrite-config";

const MoreScreen = () => {
  const router = useRouter();

  const MenuOption = ({ iconName, title, onPress }) => (
    <TouchableOpacity
      className="flex-row items-center bg-white mx-4 mb-2 p-4 rounded-lg shadow-sm"
      onPress={onPress}
    >
      <Icon name={iconName} size={24} color="#6b7280" />
      <Text className="flex-1 text-base text-gray-900 ml-3">{title}</Text>
      <Icon name="chevron-right" size={20} color="#6b7280" />
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    try {
      // Clear storage first
      await AsyncStorage.multiRemove(["userEmail", "userRole", "userId"]);

      // Try to delete session
      try {
        await account.deleteSession("current");
      } catch (sessionError) {
        console.log("Session deletion error (ignoring):", sessionError);
      }

      // Just replace with root - let the layout handle the rest
      router.replace("/");
    } catch (error) {
      console.log("Logout error:", error);
      // Even if there's an error, clear storage and navigate
      await AsyncStorage.multiRemove(["userEmail", "userRole", "userId"]);
      router.replace("/");
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Text className="text-3xl font-bold text-gray-900 px-4 py-5">More</Text>
      <MenuOption iconName="settings" title="Settings" />
      <MenuOption iconName="help-circle" title="Help & Support" />
      <MenuOption iconName="file-text" title="Privacy Policy" />
      <MenuOption iconName="user" title="About" />
      <MenuOption iconName="log-out" title="Logout" onPress={handleLogout} />
    </ScrollView>
  );
};

export default MoreScreen;
