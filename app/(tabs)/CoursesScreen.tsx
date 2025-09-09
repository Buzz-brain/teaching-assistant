import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CourseItem from "../../components/CourseItem";

const CoursesScreen = () => {
  const courses = [
    { title: "Advanced Mathematics", students: 28 },
    { title: "Computer Science 101", students: 35 },
    { title: "Data Structures", students: 42 },
    { title: "Algorithm Design", students: 24 },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f1f5f9" }}>
      {/* Modern Gradient Header */}
      <View style={{ position: "relative", marginBottom: 18 }}>
        <LinearGradient
          colors={["#2563eb", "#60a5fa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 120,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          {/* Decorative Wave */}
          <View
            style={{
              position: "absolute",
              bottom: -24,
              left: 0,
              right: 0,
              height: 48,
              zIndex: 1,
            }}
          >
            <View
              style={{
                backgroundColor: "#f1f5f9",
                borderTopLeftRadius: 48,
                borderTopRightRadius: 48,
                opacity: 0.9,
              }}
            />
          </View>
          {/* Left-aligned Icon and Title */}
          <View
            style={{
              height: "100%",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            <Ionicons
              name="book-outline"
              size={32}
              color="#fff"
              style={{ marginRight: 12, opacity: 0.92 }}
            />
            <Text
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: "bold",
                letterSpacing: 0.5,
                opacity: 0.98,
              }}
            >
              My Courses
            </Text>
          </View>
        </LinearGradient>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Course List */}
        <View style={{ paddingHorizontal: 20 }}>
          {courses.map((course, index) => (
            <CourseItem
              key={index}
              title={course.title}
              students={course.students}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CoursesScreen;
