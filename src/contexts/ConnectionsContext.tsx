import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import connectionsService, {
  Connection,
  Message,
} from "../services/connectionsService";
import notificationService from "../services/notificationService";

interface ConnectionsContextType {
  connections: Connection[];
  sendConnectionRequest: (toUserId: string, message?: string) => Promise<void>;
  acceptConnection: (connectionId: string) => Promise<void>;
  declineConnection: (connectionId: string) => Promise<void>;
  loading: boolean;
}

const ConnectionsContext = createContext<ConnectionsContextType | undefined>(
  undefined
);

export const useConnections = () => {
  const context = useContext(ConnectionsContext);
  if (context === undefined) {
    throw new Error("useConnections must be used within a ConnectionsProvider");
  }
  return context;
};

export const ConnectionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConnections([]);
      setLoading(false);
      return;
    }

    // Load connections immediately when user logs in
    const loadConnections = async () => {
      try {
        // Load both outgoing and incoming connections
        const outgoingConnections = await connectionsService.getUserConnections(
          user.uid
        );
        const incomingConnections =
          await connectionsService.getIncomingConnections(user.uid);
        const allConnections = [...outgoingConnections, ...incomingConnections];
        console.log("Loaded connections on startup:", allConnections);
        setConnections(allConnections);
        setLoading(false);
      } catch (error) {
        console.error("Error loading connections:", error);
        setLoading(false);
      }
    };

    loadConnections();

    // Subscribe to both outgoing and incoming connections for real-time updates
    // These subscriptions work independently of presence/online status
    const unsubscribeOutgoing = connectionsService.subscribeToUserConnections(
      user.uid,
      (outgoingConnections) => {
        console.log("Outgoing connections updated:", outgoingConnections);
        setConnections((prev) => {
          // Filter out old outgoing connections and add new ones
          const incomingConnections = prev.filter(
            (conn) => conn.toUserId === user.uid
          );
          return [...outgoingConnections, ...incomingConnections];
        });
      }
    );

    const unsubscribeIncoming =
      connectionsService.subscribeToIncomingConnections(
        user.uid,
        (incomingConnections) => {
          console.log("Incoming connections updated:", incomingConnections);
          setConnections((prev) => {
            // Filter out old incoming connections and add new ones
            const outgoingConnections = prev.filter(
              (conn) => conn.fromUserId === user.uid
            );
            return [...outgoingConnections, ...incomingConnections];
          });
        }
      );

    return () => {
      unsubscribeOutgoing();
      unsubscribeIncoming();
    };
  }, [user]);

  const sendConnectionRequest = async (toUserId: string, message?: string) => {
    if (!user) return;

    try {
      await connectionsService.sendConnectionRequest(
        user.uid,
        toUserId,
        message
      );
      // Show success notification
      notificationService.showConnectionSent("User");
    } catch (error) {
      console.error("Error sending connection request:", error);
      notificationService.showError(
        "Error",
        "Failed to send connection request"
      );
      throw error;
    }
  };

  const acceptConnection = async (connectionId: string) => {
    try {
      await connectionsService.updateConnectionStatus(connectionId, "accepted");
      notificationService.showConnectionAccepted("User");
    } catch (error) {
      console.error("Error accepting connection:", error);
      notificationService.showError("Error", "Failed to accept connection");
      throw error;
    }
  };

  const declineConnection = async (connectionId: string) => {
    try {
      await connectionsService.updateConnectionStatus(connectionId, "declined");
    } catch (error) {
      console.error("Error declining connection:", error);
      throw error;
    }
  };

  const value = {
    connections,
    sendConnectionRequest,
    acceptConnection,
    declineConnection,
    loading,
  };

  return (
    <ConnectionsContext.Provider value={value}>
      {children}
    </ConnectionsContext.Provider>
  );
};
