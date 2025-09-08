import React from "react";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

const StatCard = ({
  iconName,
  title,
  value,
  change,
  changeColor = "text-green-500",
  iconColor,
}) => {
  return (
    <View className="bg-white rounded-xl p-4 w-[48%] shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <View
          className={`w-8 h-8 rounded-lg justify-center items-center ${iconColor}`}
        >
          <Icon name={iconName} size={20} color="white" />
        </View>
        <Text className={`text-sm font-semibold ${changeColor}`}>{change}</Text>
      </View>
      <Text className="text-3xl font-bold text-gray-900 mb-1">{value}</Text>
      <Text className="text-sm text-gray-500">{title}</Text>
    </View>
  );
};

export default StatCard;
