import { Feather as Icon } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 22,
    padding: 20,
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
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    minHeight: 60,
    textAlignVertical: 'top',
  },
});

const HelpScreen = () => {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    // Logic to send question to teacher (e.g., via Appwrite)
    console.log("Question submitted:", question);
    setQuestion("");
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
            <Icon name="help-circle" size={32} color="#fff" style={{ marginRight: 12, opacity: 0.92 }} />
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 0.5 }}>Help</Text>
          </View>
        </LinearGradient>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.card}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 }}>Ask a Question</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your question"
              value={question}
              onChangeText={setQuestion}
              multiline
              placeholderTextColor="#94a3b8"
            />
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [{
                backgroundColor: '#2563eb',
                borderRadius: 12,
                paddingVertical: 13,
                marginTop: 6,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
                shadowColor: '#2563eb',
                shadowOpacity: 0.10,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }]}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpScreen;
