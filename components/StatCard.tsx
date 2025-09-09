import Icon from "@expo/vector-icons/Feather";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

type StatCardProps = {
  iconName: React.ComponentProps<typeof Icon>["name"];
  title: string;
  value: string;
  change: string;
  changeColor?: string;
  iconColor: string; // hex color, e.g. '#2563eb'
};

const StatCard = ({ iconName, title, value, change, changeColor = "text-green-500", iconColor }: StatCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: Number(value.replace(/[^\d]/g, "")) || 0,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ width: '48%' }}>
      <Animated.View style={{
        borderRadius: 22,
        padding: 18,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.18)',
        shadowColor: '#2563eb',
        shadowOpacity: 0.10,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
        transform: [{ scale }],
        overflow: 'hidden',
      }}>
        <LinearGradient
          colors={["#e0e7ff", "#f1f5f9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ ...(StyleSheet.absoluteFillObject as object), borderRadius: 22, opacity: 0.7, zIndex: -1 }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: iconColor,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: iconColor,
            shadowOpacity: 0.18,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4
          }}>
            <Icon name={iconName} size={20} color="white" />
          </View>
          <Text className={`text-sm font-semibold ${changeColor}`}>{change}</Text>
        </View>
        <Animated.Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1e293b', marginBottom: 2 }}>
          {animatedValue.interpolate({
            inputRange: [0, Number(value.replace(/[^\d]/g, "")) || 0],
            outputRange: [0, Number(value.replace(/[^\d]/g, "")) || 0],
            extrapolate: 'clamp',
          })}
        </Animated.Text>
        <Text style={{ fontSize: 15, color: '#64748b', fontWeight: '500' }}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
};

export default StatCard;
