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

const SendMessageScreen = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("");

  const recipients = [
    "All Students",
    "Advanced Mathematics",
    "Computer Science 101",
    "Data Structures",
    "Algorithm Design",
  ];

  useEffect(() => {
    const checkRole = async () => {
      const role = await AsyncStorage.getItem("userRole");
      setUserRole(role || "student");
      if (role !== "teacher") {
        Alert.alert("Access Denied", "Only teachers can send messages.");
        router.replace("/(tabs)");
      }
    };
    checkRole();
  }, []);

  if (userRole !== "teacher") {
    return null;
  }

  const sendMessage = () => {
    if (!messageSubject.trim()) {
      Alert.alert("Error", "Please enter a message subject");
      return;
    }
    if (!messageBody.trim()) {
      Alert.alert("Error", "Please enter a message body");
      return;
    }
    if (!selectedRecipient) {
      Alert.alert("Error", "Please select a recipient");
      return;
    }

    Alert.alert(
      "Success",
      `Message "${messageSubject}" sent to ${selectedRecipient}!`,
      [{ text: "OK", onPress: () => router.push("/(tabs)") }]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-3" onPress={() => router.back()}>
            <Text className="text-2xl text-gray-600">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Send Message</Text>
        </View>
      </View>

      <View className="p-4 space-y-4">
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Message Details
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3 text-base"
            placeholder="Enter message subject..."
            value={messageSubject}
            onChangeText={setMessageSubject}
          />
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Select Recipient:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            <View className="flex-row space-x-2">
              {recipients.map((recipient) => (
                <TouchableOpacity
                  key={recipient}
                  className={`px-4 py-2 rounded-full border ${
                    selectedRecipient === recipient
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => setSelectedRecipient(recipient)}
                >
                  <Text
                    className={`text-sm ${
                      selectedRecipient === recipient
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {recipient}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3 text-base h-40"
            placeholder="Enter your message here..."
            value={messageBody}
            onChangeText={setMessageBody}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          className="bg-green-600 rounded-lg py-4 items-center mb-6"
          onPress={sendMessage}
        >
          <Text className="text-white font-bold text-lg">📤 Send Message</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SendMessageScreen;
