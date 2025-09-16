import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useBLE } from "../contexts/BLEContext";
import { usePresence } from "../contexts/PresenceContext";
import { useConnections } from "../contexts/ConnectionsContext";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";

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
  const { user } = useAuth();
  const { isScanning, nearbyDevices, startScan, stopScan, hasPermission } =
    useBLE();
  const { nearbyUsers, isVisible, setVisibility, loading } = usePresence();
  const {
    sendConnectionRequest,
    connections,
    acceptConnection,
    declineConnection,
  } = useConnections();
  const navigation = useNavigation<any>();

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

  const handleConnect = async (userId: string, userName: string) => {
    try {
      await sendConnectionRequest(userId, `Hi! I'd like to connect with you.`);
    } catch (error) {
      // Error handling is now done in the context
    }
  };

  const handleChat = (userId: string, userName: string) => {
    // For now, we'll create a mock connection ID
    // In a real app, you'd get this from the connections service
    const mockConnectionId = `connection-${userId}`;
    navigation.navigate("Chat", {
      connectionId: mockConnectionId,
      otherUserName: userName,
      receiverId: userId,
    });
  };

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      await acceptConnection(connectionId);
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const handleDeclineConnection = async (connectionId: string) => {
    try {
      await declineConnection(connectionId);
    } catch (error) {
      // Error handling is done in the context
    }
  };

  // Check if user is already connected to someone
  const getConnectionStatus = (userId: string) => {
    const connection = connections.find(
      (conn) => conn.toUserId === userId || conn.fromUserId === userId
    );

    if (!connection) return null;

    if (connection.status === "accepted") {
      return { status: "connected", connection };
    } else if (connection.status === "pending") {
      // Check if this is an incoming request (user is the receiver)
      const isIncoming = connection.toUserId === userId;
      return {
        status: "pending",
        connection,
        isIncoming,
        isOutgoing: !isIncoming,
      };
    } else if (connection.status === "declined") {
      return { status: "declined", connection };
    }

    return null;
  };

  // Combine real-time users with BLE devices and mock users
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

  // Get users involved in connection requests (both incoming and outgoing)
  const connectionUsers = connections.map((connection) => {
    const isIncoming = connection.toUserId === user?.uid;
    const otherUserId = isIncoming
      ? connection.fromUserId
      : connection.toUserId;

    // Try to find user info from nearby users first
    const nearbyUser = nearbyUsers.find((u) => u.id === otherUserId);

    if (nearbyUser) {
      return {
        id: otherUserId,
        name: nearbyUser.displayName,
        headline: "Nearby User",
        distance: "Online now",
        interests: nearbyUser.interests || ["NearMe User"],
        isRealTime: true,
        connectionStatus: getConnectionStatus(otherUserId),
      };
    }

    // If not in nearby users, create a basic user entry
    return {
      id: otherUserId,
      name: `User ${otherUserId.slice(0, 8)}`,
      headline: "Connection Request",
      distance: "Offline",
      interests: ["Connection"],
      isRealTime: false,
      connectionStatus: getConnectionStatus(otherUserId),
    };
  });

  // Always show mock users so connections can be tested even when offline
  const allUsers = [...realTimeUsers, ...bleDevices, ...mockUsers];

  // Add connection users if they're not already in the list
  const uniqueConnectionUsers = connectionUsers.filter(
    (connUser) => !allUsers.some((user) => user.id === connUser.id)
  );

  const allUsersWithConnections = [...allUsers, ...uniqueConnectionUsers];

  // Filter out users who already have connections (they'll be shown in Connections tab)
  const nearbyUsersList = allUsersWithConnections.filter(
    (user) =>
      !connections.some(
        (conn) => conn.fromUserId === user.id || conn.toUserId === user.id
      )
  );

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
          style={[
            styles.visibilityButton,
            isVisible && styles.visibilityButtonActive,
          ]}
          onPress={handleVisibilityToggle}
        >
          <Text style={styles.visibilityButtonText}>
            {isVisible ? "You're Visible" : "Make Me Visible"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
        {nearbyUsersList.map((user) => {
          const connectionStatus = getConnectionStatus(user.id);
          const isConnected = connectionStatus?.status === "connected";
          const isPending = connectionStatus?.status === "pending";
          const isIncomingRequest = connectionStatus?.isIncoming;
          const isOutgoingRequest = connectionStatus?.isOutgoing;

          return (
            <TouchableOpacity key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  {isConnected && (
                    <View style={styles.connectedBadge}>
                      <Text style={styles.connectedText}>✓ Connected</Text>
                    </View>
                  )}
                  {isPending && isOutgoingRequest && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>⏳ Pending</Text>
                    </View>
                  )}
                  {isPending && isIncomingRequest && (
                    <View style={styles.incomingBadge}>
                      <Text style={styles.incomingText}>📨 New Request</Text>
                    </View>
                  )}
                </View>
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

              {/* Show different buttons based on connection status */}
              {isConnected ? (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.connectButton, styles.disabledButton]}
                    disabled={true}
                  >
                    <Text
                      style={[
                        styles.connectButtonText,
                        styles.disabledButtonText,
                      ]}
                    >
                      Connected
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => handleChat(user.id, user.name)}
                  >
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              ) : isPending && isIncomingRequest ? (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.acceptButton, styles.flexButton]}
                    onPress={() =>
                      handleAcceptConnection(connectionStatus.connection.id)
                    }
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.declineButton, styles.flexButton]}
                    onPress={() =>
                      handleDeclineConnection(connectionStatus.connection.id)
                    }
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              ) : isPending && isOutgoingRequest ? (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.connectButton, styles.disabledButton]}
                    disabled={true}
                  >
                    <Text
                      style={[
                        styles.connectButtonText,
                        styles.disabledButtonText,
                      ]}
                    >
                      Pending
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chatButton, styles.disabledButton]}
                    disabled={true}
                  >
                    <Text
                      style={[styles.chatButtonText, styles.disabledButtonText]}
                    >
                      Chat
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => handleConnect(user.id, user.name)}
                  >
                    <Text style={styles.connectButtonText}>Connect</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chatButton, styles.disabledButton]}
                    disabled={true}
                  >
                    <Text
                      style={[styles.chatButtonText, styles.disabledButtonText]}
                    >
                      Chat
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 4,
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
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  connectedBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  connectedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  pendingBadge: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  pendingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  incomingBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  incomingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  connectButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  connectButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  chatButton: {
    backgroundColor: "#34C759",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  chatButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledButtonText: {
    color: "#999",
  },
  flexButton: {
    flex: 1,
  },
  acceptButton: {
    backgroundColor: "#34C759",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  declineButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  declineButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
