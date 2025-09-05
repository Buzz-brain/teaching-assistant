import { Feather as Icon } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const CourseItem = ({ title, students }) => {
  return (
    <TouchableOpacity className="flex-row justify-between items-center bg-white mx-4 mb-2 p-4 rounded-lg shadow-sm">
      <View>
        <Text className="text-base font-semibold text-gray-900 mb-1">
          {title}
        </Text>
        <Text className="text-sm text-gray-500">
          {students} students enrolled
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color="#6b7280" />
    </TouchableOpacity>
  );
};

export default CourseItem;
