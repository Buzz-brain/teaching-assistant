import React from "react";
import { Text, View } from "react-native";

const ActivityItem = ({ initials, name, action, time, color }) => {
  return (
    <View className="flex-row items-center px-4 py-3">
      <View
        className={`w-10 h-10 rounded-full justify-center items-center ${color}`}
      >
        <Text className="text-white font-bold text-sm">{initials}</Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-base text-gray-900">
          {name} {action}
        </Text>
        <Text className="text-sm text-gray-500 mt-0.5">{time}</Text>
      </View>
    </View>
  );
};

export default ActivityItem;
