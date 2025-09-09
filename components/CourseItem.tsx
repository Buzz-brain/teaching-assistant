import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

interface CourseItemProps {
  title: string;
  students: number;
}

const CourseItem = ({ title, students }: CourseItemProps) => {
  const scale = useRef(new Animated.Value(1)).current;

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
      style={{ marginBottom: 16 }}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}> 
        <LinearGradient
          colors={["rgba(96,165,250,0.18)", "rgba(37,99,235,0.10)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 17, fontWeight: '600', color: '#1e293b', marginBottom: 2 }}>{title}</Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>{students} students enrolled</Text>
          </View>
          {/* <Icon name="chevron-right" size={22} color="#2563eb" /> */}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#2563eb',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.18)',
    marginBottom: 0,
    overflow: 'hidden',
  },
});

export default CourseItem;
