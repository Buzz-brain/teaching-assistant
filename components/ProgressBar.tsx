import React from "react";
import { View } from "react-native";

const ProgressBar = ({ percentage, color }) => {
  return (
    <View className="h-2 bg-gray-200 rounded-full">
      <View
        className={`h-full rounded-full ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </View>
  );
};

export default ProgressBar;
