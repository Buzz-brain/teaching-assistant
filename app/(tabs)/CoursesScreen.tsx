import React from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CourseItem from "../../components/CourseItem";

const CoursesScreen = () => {
  const courses = [
    { title: "Advanced Mathematics", students: "28" },
    { title: "Computer Science 101", students: "35" },
    { title: "Data Structures", students: "42" },
    { title: "Algorithm Design", students: "24" },
  ];

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 bg-gray-50">
        <Text className="text-3xl font-bold text-gray-900 px-4 py-5">
          My Courses
        </Text>
        {courses.map((course, index) => (
          <CourseItem
            key={index}
            title={course.title}
            students={course.students}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CoursesScreen;
