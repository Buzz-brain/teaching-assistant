type Schedule = {
  id: string;
  name: string;
  teacherId: string;
  isActive: boolean;
  weekSchedule: any[];
  createdAt: string;
};
// app/schedule/ScheduleScreen.tsx
import { Feather as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Query } from "appwrite";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DATABASE_ID,
  databases,
  SCHEDULES_COLLECTION_ID,
} from "../../utils/appwrite-config";

const ScheduleScreen = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedules = async () => {
    try {
      const role = await AsyncStorage.getItem("userRole");
      setUserRole(role || "student");

      if (role !== "student") {
        Alert.alert("Error", "Access restricted to students.");
        router.replace("/(tabs)");
        return;
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        SCHEDULES_COLLECTION_ID,
        [
          Query.equal("isActive", true),
          Query.orderDesc("createdAt"),
          Query.limit(25),
        ]
      );

      const formattedSchedules = response.documents.map((schedule) => ({
        id: schedule.$id,
        name: schedule.name,
        teacherId: schedule.teacherId,
        isActive: schedule.isActive,
        weekSchedule: JSON.parse(schedule.weekSchedule || "[]"),
        createdAt: schedule.createdAt,
      }));

      setSchedules(formattedSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      Alert.alert("Error", "Failed to load schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [])
  );

  useEffect(() => {
    fetchSchedules();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchedules();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="calendar" size={40} color="#2563eb" style={{ marginBottom: 12, opacity: 0.7 }} />
        <Text style={{ fontSize: 18, color: '#64748b', fontWeight: '500' }}>Loading schedules...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      {/* Gradient Header */}
      <View style={{ position: 'relative', marginBottom: 18 }}>
        <LinearGradient
          colors={["#2563eb", "#60a5fa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 120, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 18, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="calendar" size={32} color="#fff" style={{ marginRight: 14, opacity: 0.92 }} />
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 0.5 }}>Your Schedules</Text>
            </View>
            <Pressable
              onPress={onRefresh}
              style={({ pressed }) => [{ backgroundColor: '#fff', borderRadius: 18, padding: 8, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4, opacity: pressed ? 0.85 : 1 }]}
            >
              <Icon name="refresh-cw" size={20} color="#2563eb" />
            </Pressable>
          </View>
          <Text style={{ color: '#e0e7ef', fontSize: 15, marginTop: 6, opacity: 0.85 }}>{schedules.length} active schedules</Text>
        </LinearGradient>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          {schedules.length === 0 ? (
            <View style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 24, padding: 36, alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
              <Icon name="calendar" size={48} color="#9CA3AF" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#64748b', marginTop: 16 }}>No schedules available</Text>
              <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>Check back later for new schedules</Text>
            </View>
          ) : (
            schedules.map((schedule: Schedule) => (
              <Pressable
                key={schedule.id}
                style={({ pressed }) => [
                  styles.scheduleCard,
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.96 }
                ]}
                android_ripple={{ color: '#e0e7ff' }}
                onPress={() => {/* Could add navigation to details here */}}
              >
                <LinearGradient
                  colors={["#fff", "#f1f5f9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="book-open" size={22} color="#2563eb" style={{ marginRight: 10, opacity: 0.85 }} />
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b', flex: 1 }}>{schedule.name}</Text>
                  {/* <Icon name="chevron-right" size={22} color="#94a3b8" /> */}
                </View>
                <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 6 }}>Created: {new Date(schedule.createdAt).toLocaleDateString()}</Text>
                {schedule.weekSchedule.map((cls: any, index: number) => (
                  <View key={index} style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: '#e5e7eb', paddingTop: index === 0 ? 0 : 8, marginTop: index === 0 ? 0 : 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#2563eb' }}>{cls.day} - {cls.subject}</Text>
                    <Text style={{ fontSize: 14, color: '#64748b', marginTop: 1 }}>{cls.time} | {cls.location} | {cls.type}</Text>
                    <Text style={{ fontSize: 13, color: '#a1a1aa', marginTop: 1 }}>Students: {cls.students}</Text>
                  </View>
                ))}
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  scheduleCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#2563eb',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.13)',
    overflow: 'hidden',
  },
});

export default ScheduleScreen;
