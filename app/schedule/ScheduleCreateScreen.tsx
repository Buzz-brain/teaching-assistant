// app/schedule/ScheduleCreateScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DATABASE_ID,
  databases,
  ID,
  Permission,
  Role,
  SCHEDULES_COLLECTION_ID,
} from "../../utils/appwrite-config";

// Type for a class in the schedule
interface ClassType {
  id: string;
  day: string;
  subject: string;
  location: string;
  type: string;
  time: string;
  students: number;
}
const ScheduleCreateScreen = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [scheduleName, setScheduleName] = useState("");
  const [classes, setClasses] = useState<ClassType[]>([]); // Local state for UI
  const [classDay, setClassDay] = useState("");
  const [classSubject, setClassSubject] = useState("");
  const [classLocation, setClassLocation] = useState("");
  const [classType, setClassType] = useState("");
  const [classTime, setClassTime] = useState("");
  const [classStudents, setClassStudents] = useState("");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const types = ["Lecture", "Lab", "Tutorial", "Project"];
  const subjects = [
    "Advanced Mathematics",
    "Computer Science 101",
    "Data Structures",
    "Algorithm Design",
  ];

  useEffect(() => {
    const checkRole = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole");
        const userId = await AsyncStorage.getItem("userId");
        console.log("Checking role:", role, "userId:", userId);
        setUserRole(role || "student");
        setUserId(userId || null);
        if (role !== "teacher" || !userId) {
          Alert.alert("Access Denied", "Only teachers can create schedules.");
          router.replace("/(tabs)");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to verify user role.");
        router.replace("/(tabs)");
      }
    };
    checkRole();
  }, []);

  if (userRole !== "teacher") {
    return null;
  }

  const addClass = () => {
    if (
      !classDay ||
      !classSubject ||
      !classLocation ||
      !classType ||
      !classTime ||
      !classStudents
    ) {
      Alert.alert("Error", "Please fill all class fields");
      return;
    }

    const newClass = {
      id: Date.now().toString(),
      day: classDay,
      subject: classSubject,
      location: classLocation,
      type: classType,
      time: classTime,
      students: parseInt(classStudents),
    };

    setClasses([...classes, newClass]);
    setClassDay("");
    setClassSubject("");
    setClassLocation("");
    setClassType("");
    setClassTime("");
    setClassStudents("");
    Alert.alert("Success", "Class added successfully!");
  };

  const deleteClass = (id: string) => {
    setClasses(classes.filter((c) => c.id !== id));
  };

  const publishSchedule = async () => {
    if (!scheduleName.trim()) {
      Alert.alert("Error", "Please enter schedule name");
      return;
    }
    if (classes.length === 0) {
      Alert.alert("Error", "Please add at least one class");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      router.replace("/(tabs)");
      return;
    }

    try {
      const scheduleData = {
        name: scheduleName,
        teacherId: userId,
        isActive: true,
        weekSchedule: JSON.stringify(classes), // Store all class data here
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Publishing schedule with data:", scheduleData);

      await databases.createDocument(
        DATABASE_ID,
        SCHEDULES_COLLECTION_ID,
        ID.unique(),
        scheduleData,
        [
          Permission.read(Role.users()),
          Permission.write(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );

      Alert.alert(
        "Success",
        `Schedule "${scheduleName}" published successfully!`,
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/ScheduleScreenTeacher"),
          },
        ]
      );
    } catch (error) {
      console.error("Publish schedule error:", error);
  Alert.alert("Error", `Failed to publish schedule: ${(error as any).message}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      {/* Gradient Header */}
      <View style={{ position: 'relative', marginBottom: 18 }}>
        <LinearGradient
          colors={["#2563eb", "#60a5fa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 120, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          <View style={{ position: "absolute", bottom: -24, left: 0, right: 0, height: 48, zIndex: 1 }}>
            <View style={{ backgroundColor: "#f1f5f9", borderTopLeftRadius: 48, borderTopRightRadius: 48, opacity: 0.9 }} />
          </View>
          <View style={{ height: "100%", flexDirection: "row", alignItems: "center", paddingHorizontal: 24 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back-sharp" size={28} color="#fff" style={{ opacity: 0.92 }} />
            </TouchableOpacity>
            <Ionicons name="calendar-outline" size={28} color="#fff" style={{ marginRight: 10, opacity: 0.96 }} />
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold", letterSpacing: 0.5, opacity: 0.98 }}>
              Create Schedule
            </Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 16 }}>
          {/* Glassmorphism Card for Schedule Info */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 18, padding: 18, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, borderWidth: 1, borderColor: 'rgba(203,213,225,0.18)', overflow: 'hidden', marginBottom: 18 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 8 }}>Schedule Information</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 6, backgroundColor: '#fff', color: '#334155' }}
              placeholder="Enter schedule name..."
              value={scheduleName}
              onChangeText={setScheduleName}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {classes.length > 0 && (
            <View style={{ backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 18, padding: 18, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, borderWidth: 1, borderColor: 'rgba(203,213,225,0.18)', overflow: 'hidden', marginBottom: 18 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 8 }}>Added Classes ({classes.length})</Text>
              {classes.map((c, index) => (
                <View key={c.id} style={{ borderLeftWidth: 4, borderLeftColor: '#2563eb', backgroundColor: '#eff6ff', padding: 12, marginBottom: 12, borderRadius: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontWeight: 'bold', color: '#2563eb', fontSize: 15 }}>Class {index + 1}</Text>
                    <TouchableOpacity onPress={() => deleteClass(c.id)} style={{ backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: '#fff', fontSize: 12 }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: '#334155', fontSize: 14 }}>Day: <Text style={{ fontWeight: '600' }}>{c.day}</Text></Text>
                  <Text style={{ color: '#334155', fontSize: 14 }}>Subject: <Text style={{ fontWeight: '600' }}>{c.subject}</Text></Text>
                  <Text style={{ color: '#334155', fontSize: 14 }}>Location: <Text style={{ fontWeight: '600' }}>{c.location}</Text></Text>
                  <Text style={{ color: '#334155', fontSize: 14 }}>Type: <Text style={{ fontWeight: '600' }}>{c.type}</Text></Text>
                  <Text style={{ color: '#334155', fontSize: 14 }}>Time: <Text style={{ fontWeight: '600' }}>{c.time}</Text></Text>
                  <Text style={{ color: '#334155', fontSize: 14 }}>Students: <Text style={{ fontWeight: '600' }}>{c.students}</Text></Text>
                </View>
              ))}
            </View>
          )}

          {/* Glassmorphism Card for Add New Class */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 18, padding: 18, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, borderWidth: 1, borderColor: 'rgba(203,213,225,0.18)', overflow: 'hidden', marginBottom: 18 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 8 }}>Add New Class</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#334155', marginBottom: 6 }}>Day:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={{ paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: classDay === day ? '#2563eb' : '#cbd5e1', backgroundColor: classDay === day ? '#2563eb' : '#fff', marginRight: 8 }}
                    onPress={() => setClassDay(day)}
                  >
                    <Text style={{ color: classDay === day ? '#fff' : '#334155', fontWeight: '500', fontSize: 14 }}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#334155', marginBottom: 6 }}>Subject:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject}
                    style={{ paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: classSubject === subject ? '#2563eb' : '#cbd5e1', backgroundColor: classSubject === subject ? '#2563eb' : '#fff', marginRight: 8 }}
                    onPress={() => setClassSubject(subject)}
                  >
                    <Text style={{ color: classSubject === subject ? '#fff' : '#334155', fontWeight: '500', fontSize: 14 }}>{subject}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 6, backgroundColor: '#fff', color: '#334155' }}
              placeholder="Location (e.g., Room 101)"
              value={classLocation}
              onChangeText={setClassLocation}
              placeholderTextColor="#94a3b8"
            />
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#334155', marginBottom: 6 }}>Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {types.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={{ paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: classType === type ? '#2563eb' : '#cbd5e1', backgroundColor: classType === type ? '#2563eb' : '#fff', marginRight: 8 }}
                    onPress={() => setClassType(type)}
                  >
                    <Text style={{ color: classType === type ? '#fff' : '#334155', fontWeight: '500', fontSize: 14 }}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 6, backgroundColor: '#fff', color: '#334155' }}
              placeholder="Time (e.g., 9:00 AM)"
              value={classTime}
              onChangeText={setClassTime}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 6, backgroundColor: '#fff', color: '#334155' }}
              placeholder="Number of students"
              value={classStudents}
              onChangeText={setClassStudents}
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              style={{ backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8, shadowColor: '#2563eb', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
              onPress={addClass}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+ Add Class</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 18, alignItems: 'center', marginBottom: 24, shadowColor: '#22c55e', shadowOpacity: 0.13, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
            onPress={publishSchedule}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20, letterSpacing: 0.5 }}>
              🚀 Publish Schedule
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleCreateScreen;
