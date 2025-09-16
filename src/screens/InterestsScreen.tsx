import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import InterestsSelector from "../components/InterestsSelector";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InterestsScreen() {
  const { user } = useAuth();
  const { getUserInterests, updateUserInterests } = useUserProfile();
  const navigation = useNavigation<any>();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user's current interests
  useEffect(() => {
    const loadInterests = async () => {
      if (!user) return;

      try {
        const interests = await getUserInterests(user.uid);
        setSelectedInterests(interests);
      } catch (error) {
        console.error("Error loading interests:", error);
        Alert.alert("Error", "Failed to load your interests");
      } finally {
        setLoading(false);
      }
    };

    loadInterests();
  }, [user, getUserInterests]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUserInterests(selectedInterests);
      Alert.alert("Success", "Your interests have been updated!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error saving interests:", error);
      Alert.alert("Error", "Failed to save your interests");
    } finally {
      setSaving(false);
    }
  };

  const handleInterestsChange = (interests: string[]) => {
    setSelectedInterests(interests);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your interests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <InterestsSelector
        selectedInterests={selectedInterests}
        onInterestsChange={handleInterestsChange}
        maxSelections={15}
        showSearch={true}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Interests"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  footer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e1e5e9",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
