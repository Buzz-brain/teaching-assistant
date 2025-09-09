import { Feather as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { account } from "../../utils/appwrite-config";

const styles = StyleSheet.create({
  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.13)',
    overflow: 'hidden',
  },
});

const MoreScreen = () => {
  const router = useRouter();

  const MenuOption = ({ iconName, title, onPress }: { iconName: any; title: any; onPress?: () => void }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuCard,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.96 }
      ]}
      disabled={!onPress}
    >
      <Icon name={iconName} size={24} color="#2563eb" style={{ marginRight: 14, opacity: 0.85 }} />
      <Text style={{ flex: 1, fontSize: 16, color: '#1e293b', fontWeight: '500' }}>{title}</Text>
      {/* <Icon name="chevron-right" size={20} color="#94a3b8" /> */}
    </Pressable>
  );

  const handleLogout = async () => {
    try {
      // Clear storage first
      await AsyncStorage.multiRemove(["userEmail", "userRole", "userId"]);

      // Try to delete session
      try {
        await account.deleteSession("current");
      } catch (sessionError) {
        console.log("Session deletion error (ignoring):", sessionError);
      }

      // Just replace with root - let the layout handle the rest
      router.replace("/");
    } catch (error) {
      console.log("Logout error:", error);
      // Even if there's an error, clear storage and navigate
      await AsyncStorage.multiRemove(["userEmail", "userRole", "userId"]);
      router.replace("/");
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
          <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%', justifyContent: 'flex-start' }}>
            <Icon name="grid" size={32} color="#fff" style={{ marginRight: 12, opacity: 0.92 }} />
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 0.5 }}>More</Text>
          </View>
        </LinearGradient>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <MenuOption iconName="settings" title="Settings" />
          <MenuOption iconName="help-circle" title="Help & Support" />
          <MenuOption iconName="file-text" title="Privacy Policy" />
          <MenuOption iconName="user" title="About" />
          <MenuOption iconName="log-out" title="Logout" onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
};

export default MoreScreen;
