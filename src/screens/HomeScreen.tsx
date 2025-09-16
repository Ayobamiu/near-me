import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBLE } from "../contexts/BLEContext";
import { usePresence } from "../contexts/PresenceContext";

// Mock data for nearby users
const mockUsers = [
  {
    id: "1",
    name: "Sarah Johnson",
    headline: "Software Engineer",
    distance: "15m away",
    interests: ["React Native", "TypeScript", "Mobile Dev"],
  },
  {
    id: "2",
    name: "Mike Chen",
    headline: "Product Manager",
    distance: "25m away",
    interests: ["Product Strategy", "UX Design", "Startups"],
  },
  {
    id: "3",
    name: "Emma Wilson",
    headline: "UX Designer",
    distance: "35m away",
    interests: ["UI/UX", "Figma", "User Research"],
  },
];

export default function HomeScreen() {
  const { isScanning, nearbyDevices, startScan, stopScan, hasPermission } =
    useBLE();
  const { nearbyUsers, isVisible, setVisibility, loading } = usePresence();

  const handleScanPress = () => {
    if (!hasPermission) {
      Alert.alert(
        "Permission Required",
        "Bluetooth permission is required to scan for nearby devices."
      );
      return;
    }

    if (isScanning) {
      stopScan();
    } else {
      startScan();
    }
  };

  const handleVisibilityToggle = () => {
    setVisibility(!isVisible);
  };

  // Combine real-time users with BLE devices
  const realTimeUsers = nearbyUsers.map((user) => ({
    id: user.id,
    name: user.displayName,
    headline: "Nearby User",
    distance: "Online now",
    interests: user.interests || ["NearMe User"],
    isRealTime: true,
  }));

  const bleDevices = nearbyDevices.map((device) => ({
    id: device.id,
    name: device.name || "Unknown Device",
    headline: "BLE Device",
    distance: `${Math.abs(device.rssi || 0)}m away`,
    interests: ["BLE Device"],
    isRealTime: false,
  }));

  const allUsers = [...realTimeUsers, ...bleDevices];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nearby People</Text>
      <Text style={styles.subtitle}>Tap to connect with someone</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonActive]}
          onPress={handleScanPress}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? "Stop Scanning" : "Scan for Nearby Devices"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.visibilityButton, isVisible && styles.visibilityButtonActive]}
          onPress={handleVisibilityToggle}
        >
          <Text style={styles.visibilityButtonText}>
            {isVisible ? "You're Visible" : "Make Me Visible"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
        {allUsers.map((user) => (
          <TouchableOpacity key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userHeadline}>{user.headline}</Text>
              <Text style={styles.userDistance}>{user.distance}</Text>
            </View>
            <View style={styles.interestsContainer}>
              {user.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: "#34C759",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  scanButtonActive: {
    backgroundColor: "#FF3B30",
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  visibilityButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  visibilityButtonActive: {
    backgroundColor: "#34C759",
  },
  visibilityButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  userList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userHeadline: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  userDistance: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  interestTag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  interestText: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "500",
  },
  connectButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  connectButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
