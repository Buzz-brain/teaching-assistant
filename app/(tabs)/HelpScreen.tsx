import React, { useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";

const HelpScreen = () => {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    // Logic to send question to teacher (e.g., via Appwrite)
    console.log("Question submitted:", question);
    setQuestion("");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Text className="text-3xl font-bold text-gray-900 px-4 py-5">Help</Text>
      <View className="bg-white mx-4 p-4 rounded-lg shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-2">
          Ask a Question
        </Text>
        <TextInput
          className="border border-gray-300 p-2 mb-2 rounded-lg"
          placeholder="Enter your question"
          value={question}
          onChangeText={setQuestion}
          multiline
        />
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

export default HelpScreen;
