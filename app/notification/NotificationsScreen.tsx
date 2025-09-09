import { Feather as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const notifications = [
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
];

type NotificationsScreenProps = {
  setCurrentPage?: (page: string) => void;
};

const NotificationsScreen = ({ setCurrentPage }: NotificationsScreenProps) => {
  const router = useRouter();
  const handleBack = () => {
    // If setCurrentPage is provided (legacy), use it, else use router
    if (setCurrentPage) {
      setCurrentPage("dashboard");
    } else {
      // Try to go back, or go to dashboard if not possible
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/StudentDashboard");
      }
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      {/* Gradient Header */}
      <View style={{ position: 'relative', marginBottom: 18 }}>
        <LinearGradient
          colors={["#2563eb", "#60a5fa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 120, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, paddingHorizontal: 24, shadowColor: '#2563eb', shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}
        >
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="bell" size={28} color="#fff" style={{ marginRight: 12, opacity: 0.92 }} />
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 0.5 }}>Notifications</Text>
              </View>
              <TouchableOpacity onPress={handleBack} style={{ paddingHorizontal: 2, paddingVertical: 2 }}>
                <Text style={{ color: '#fff', fontWeight: '500', fontSize: 15, opacity: 0.92 }}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 20 }}>
          {notifications.map((notification) => (
            <View
              key={notification.id}
              style={[
                styles.notificationCard,
                notification.unread && styles.unreadCard,
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#1e293b', fontSize: 17, marginBottom: 2 }}>{notification.title}</Text>
                  <Text style={{ color: '#64748b', marginBottom: 4, fontSize: 15 }}>{notification.message}</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 13 }}>{notification.time}</Text>
                </View>
                {notification.unread && (
                  <Animated.View style={styles.unreadDot} />
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#2563eb',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.13)',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  unreadDot: {
    width: 10,
    height: 10,
    backgroundColor: '#2563eb',
    borderRadius: 5,
    marginLeft: 10,
    marginTop: 2,
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});

export default NotificationsScreen;
