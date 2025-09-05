import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const NotificationsScreen = ({ setCurrentPage }) => (
  <View className="flex-1 bg-gray-50 px-4 py-6">
    <View className="flex-row items-center justify-between mb-8">
      <Text className="text-3xl font-bold text-gray-900">Notifications</Text>
      <TouchableOpacity onPress={() => setCurrentPage("dashboard")}>
        <Text className="text-blue-500 font-medium">Back to Dashboard</Text>
      </TouchableOpacity>
    </View>

    <View className="space-y-4">
      {[
        {
          id: 1,
          title: "New Quiz Available",
          message: "Calculus Integration quiz is now available",
          time: "2 hours ago",
          unread: true,
        },
        {
          id: 2,
          title: "Grade Posted",
          message: "Your Programming Basics quiz grade has been posted",
          time: "1 day ago",
          unread: true,
        },
        {
          id: 3,
          title: "Schedule Update",
          message: "Tomorrow's Data Structures class moved to Room C",
          time: "2 days ago",
          unread: false,
        },
        {
          id: 4,
          title: "Assignment Reminder",
          message: "Integration Project due in 2 days",
          time: "3 days ago",
          unread: false,
        },
      ].map((notification) => (
        <View
          key={notification.id}
          className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${
            notification.unread ? "border-l-4 border-l-blue-500" : ""
          }`}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 mb-1">
                {notification.title}
              </Text>
              <Text className="text-gray-600 mb-2">{notification.message}</Text>
              <Text className="text-sm text-gray-500">{notification.time}</Text>
            </View>
            {notification.unread && (
              <View className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </View>
        </View>
      ))}
    </View>
  </View>
);

export default NotificationsScreen;
