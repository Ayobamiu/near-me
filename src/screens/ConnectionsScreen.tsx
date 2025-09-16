import React, { useState, useEffect } from "react";
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
import { useConnections } from "../contexts/ConnectionsContext";
import { usePresence } from "../contexts/PresenceContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";

export default function ConnectionsScreen() {
  const { user } = useAuth();
  const { connections, acceptConnection, declineConnection, loading } =
    useConnections();
  const { nearbyUsers } = usePresence();
  const { getUserDisplayName } = useUserProfile();
  const navigation = useNavigation<any>();
  const [userNames, setUserNames] = useState<Map<string, string>>(new Map());
  const [namesLoading, setNamesLoading] = useState(false);
  console.log("userNames", userNames);
  // Load user names when connections change
  useEffect(() => {
    const loadUserNames = async () => {
      console.log(
        "ConnectionsScreen: Loading user names for connections:",
        connections.length
      );
      const userIds = new Set<string>();
      connections.forEach((connection) => {
        userIds.add(connection.fromUserId);
        userIds.add(connection.toUserId);
      });

      console.log("ConnectionsScreen: User IDs to load:", Array.from(userIds));

      const newUserNames = new Map(userNames);
      const promises = [];

      for (const userId of userIds) {
        if (!newUserNames.has(userId)) {
          console.log("ConnectionsScreen: Loading name for user:", userId);
          promises.push(
            getUserDisplayName(userId)
              .then((displayName) => {
                console.log(
                  "ConnectionsScreen: Got name for",
                  userId,
                  ":",
                  displayName
                );
                return { userId, displayName };
              })
              .catch((error) => {
                console.error(
                  "ConnectionsScreen: Error loading user name for:",
                  userId,
                  error
                );
                return { userId, displayName: `User ${userId.slice(0, 8)}` };
              })
          );
        }
      }

      if (promises.length > 0) {
        setNamesLoading(true);
        try {
          const results = await Promise.all(promises);
          results.forEach(({ userId, displayName }) => {
            newUserNames.set(userId, displayName);
          });
          console.log("ConnectionsScreen: Updated user names:", newUserNames);
          setUserNames(newUserNames);
        } catch (error) {
          console.error("ConnectionsScreen: Error loading user names:", error);
        } finally {
          setNamesLoading(false);
        }
      }
    };

    if (connections.length > 0) {
      loadUserNames();
    }
  }, [connections]);

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

  const handleChat = (userId: string, userName: string) => {
    // Find the actual connection ID from the connections array
    const connection = connections.find(
      (conn) =>
        (conn.fromUserId === userId || conn.toUserId === userId) &&
        conn.status === "accepted"
    );

    if (!connection) {
      Alert.alert("Error", "No active connection found with this user");
      return;
    }

    navigation.navigate("Chat", {
      connectionId: connection.id,
      otherUserName: userName,
      receiverId: userId,
    });
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

  // Separate connections into different categories
  const incomingConnections = connections.filter(
    (conn) => conn.toUserId === user?.uid && conn.status === "pending"
  );
  const outgoingConnections = connections.filter(
    (conn) => conn.fromUserId === user?.uid && conn.status === "pending"
  );
  const acceptedConnections = connections.filter(
    (conn) => conn.status === "accepted"
  );

  console.log("ConnectionsScreen: Total connections:", connections.length);
  console.log("ConnectionsScreen: Incoming:", incomingConnections.length);
  console.log("ConnectionsScreen: Outgoing:", outgoingConnections.length);
  console.log("ConnectionsScreen: Accepted:", acceptedConnections.length);

  const renderConnectionCard = (connection: any, isIncoming: boolean) => {
    console.log("connection", connection);
    const otherUserId = isIncoming
      ? connection.fromUserId
      : connection.toUserId;
    const otherUserName =
      userNames.get(otherUserId) || `User ${otherUserId.slice(0, 8)}`;
    console.log("otherUserName", otherUserName);
    const connectionStatus = getConnectionStatus(otherUserId);
    const isConnected = connectionStatus?.status === "connected";
    const isPending = connectionStatus?.status === "pending";

    return (
      <TouchableOpacity key={connection.id} style={styles.connectionCard}>
        <View style={styles.connectionInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{otherUserName}</Text>
            {isConnected && (
              <View style={styles.connectedBadge}>
                <Text style={styles.connectedText}>✓ Connected</Text>
              </View>
            )}
            {isPending && isIncoming && (
              <View style={styles.incomingBadge}>
                <Text style={styles.incomingText}>📨 New Request</Text>
              </View>
            )}
            {isPending && !isIncoming && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>⏳ Pending</Text>
              </View>
            )}
          </View>
          <Text style={styles.connectionType}>
            {isIncoming
              ? "Wants to connect with you"
              : "Connection request sent"}
          </Text>
          {connection.message && (
            <Text style={styles.connectionMessage}>"{connection.message}"</Text>
          )}
        </View>

        {/* Show different buttons based on connection status */}
        {isConnected ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.connectButton, styles.disabledButton]}
              disabled={true}
            >
              <Text
                style={[styles.connectButtonText, styles.disabledButtonText]}
              >
                Connected
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => handleChat(otherUserId, otherUserName)}
            >
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        ) : isPending && isIncoming ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.acceptButton, styles.flexButton]}
              onPress={() => handleAcceptConnection(connection.id)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.declineButton, styles.flexButton]}
              onPress={() => handleDeclineConnection(connection.id)}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        ) : isPending && !isIncoming ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.connectButton, styles.disabledButton]}
              disabled={true}
            >
              <Text
                style={[styles.connectButtonText, styles.disabledButtonText]}
              >
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chatButton, styles.disabledButton]}
              disabled={true}
            >
              <Text style={[styles.chatButtonText, styles.disabledButtonText]}>
                Chat
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  if (loading || namesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {loading ? "Loading connections..." : "Loading user names..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Connections</Text>
      <Text style={styles.subtitle}>Manage your connection requests</Text>

      <ScrollView
        style={styles.connectionsList}
        showsVerticalScrollIndicator={false}
      >
        {/* Incoming Connection Requests */}
        {incomingConnections.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Incoming Requests ({incomingConnections.length})
            </Text>
            {incomingConnections.map((connection) =>
              renderConnectionCard(connection, true)
            )}
          </>
        )}

        {/* Outgoing Connection Requests */}
        {outgoingConnections.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Sent Requests ({outgoingConnections.length})
            </Text>
            {outgoingConnections.map((connection) =>
              renderConnectionCard(connection, false)
            )}
          </>
        )}

        {/* Accepted Connections */}
        {acceptedConnections.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Connected ({acceptedConnections.length})
            </Text>
            {acceptedConnections.map((connection) => {
              const isIncoming = connection.toUserId === user?.uid;
              return renderConnectionCard(connection, isIncoming);
            })}
          </>
        )}

        {/* Empty State */}
        {connections.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No connections yet</Text>
            <Text style={styles.emptyStateText}>
              Go to the Home tab to find people nearby and send connection
              requests
            </Text>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
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
  connectionsList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  connectionCard: {
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
  connectionInfo: {
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
  connectionType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  connectionMessage: {
    fontSize: 14,
    color: "#007AFF",
    fontStyle: "italic",
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
