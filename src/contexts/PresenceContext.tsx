import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import presenceService, { UserPresence } from "../services/presenceService";

interface PresenceContextType {
  nearbyUsers: UserPresence[];
  isVisible: boolean;
  setVisibility: (visible: boolean) => void;
  updateLocation: (
    latitude: number,
    longitude: number,
    accuracy: number
  ) => void;
  loading: boolean;
}

const PresenceContext = createContext<PresenceContextType | undefined>(
  undefined
);

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return context;
};

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [nearbyUsers, setNearbyUsers] = useState<UserPresence[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNearbyUsers([]);
      setIsVisible(false);
      setLoading(false);
      return;
    }

    // Set up user presence when they log in
    const setupPresence = async () => {
      try {
        await presenceService.updatePresence(user.uid, {
          id: user.uid,
          displayName: user.displayName || "User",
          email: user.email || "",
          isVisible: false,
          interests: [],
        });
      } catch (error) {
        console.error("Error setting up presence:", error);
      }
    };

    setupPresence();

    // Subscribe to nearby users
    const unsubscribe = presenceService.subscribeToNearbyUsers((users) => {
      // Filter out current user
      const otherUsers = users.filter((u) => u.id !== user.uid);
      setNearbyUsers(otherUsers);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const setVisibility = async (visible: boolean) => {
    if (!user) return;

    try {
      await presenceService.setVisibility(user.uid, visible);
      setIsVisible(visible);
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };

  const updateLocation = async (
    latitude: number,
    longitude: number,
    accuracy: number
  ) => {
    if (!user) return;

    try {
      await presenceService.updateLocation(
        user.uid,
        latitude,
        longitude,
        accuracy
      );
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  // Clean up presence when user logs out
  useEffect(() => {
    if (!user) {
      // User logged out, clean up their presence
      return;
    }

    return () => {
      // This will run when the component unmounts or user changes
      if (user) {
        presenceService.removePresence(user.uid);
      }
    };
  }, [user]);

  const value = {
    nearbyUsers,
    isVisible,
    setVisibility,
    updateLocation,
    loading,
  };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};
