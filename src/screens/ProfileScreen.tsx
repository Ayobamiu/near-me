import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { usePresence } from "../contexts/PresenceContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import InterestsDisplay from "../components/InterestsDisplay";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isVisible, setVisibility } = usePresence();
  const { getUserInterests } = useUserProfile();
  const navigation = useNavigation<any>();
  const [userInterests, setUserInterests] = useState<string[]>([]);

  // Load user interests
  useEffect(() => {
    const loadInterests = async () => {
      if (!user) return;
      try {
        const interests = await getUserInterests(user.uid);
        setUserInterests(interests);
      } catch (error) {
        console.error("Error loading interests:", error);
      }
    };
    loadInterests();
  }, [user, getUserInterests]);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(user?.displayName || "")}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.displayName || "User"}</Text>
        <Text style={styles.userHeadline}>NearMe User</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        {/* Interests Section */}
        <View style={styles.interestsSection}>
          <View style={styles.interestsHeader}>
            <Text style={styles.interestsTitle}>Interests</Text>
            <TouchableOpacity
              style={styles.editInterestsButton}
              onPress={() => navigation.navigate("Interests")}
            >
              <Text style={styles.editInterestsButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <InterestsDisplay
            interests={userInterests}
            maxDisplay={5}
            style={styles.interestsDisplay}
          />
        </View>
      </View>

      <View style={styles.settingsCard}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Make me visible to others</Text>
          <Switch value={isVisible} onValueChange={setVisibility} />
        </View>

        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>My Interests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>Privacy Settings</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userHeadline: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#999",
  },
  interestsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  interestsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  interestsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  editInterestsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  editInterestsButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  interestsDisplay: {
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
  },
  settingButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
