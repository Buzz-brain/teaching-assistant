import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

const colorMap: Record<string, string> = {
  "bg-indigo-500": "#6366f1",
  "bg-green-500": "#22c55e",
  "bg-purple-500": "#a21caf",
  "bg-yellow-500": "#eab308",
  "bg-red-500": "#ef4444",
  "bg-blue-500": "#2563eb",
  "bg-pink-500": "#ec4899",
  "bg-orange-500": "#f59e42",
  "bg-gray-500": "#6b7280",
};

type ActivityItemProps = {
  initials: string;
  name: string;
  action: string;
  time: string;
  color: string;
};

const ActivityItem = ({ initials, name, action, time, color }: ActivityItemProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const bgColor = colorMap[color] || "#2563eb";

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ marginBottom: 12 }}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}> 
        <LinearGradient
          colors={["rgba(96,165,250,0.13)", "rgba(37,99,235,0.08)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.avatar, { backgroundColor: bgColor }]}> 
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{initials}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 16, color: '#1e293b', fontWeight: '500' }}>
              {name} {action}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{time}</Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#2563eb',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.13)',
    marginBottom: 0,
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});

export default ActivityItem;
