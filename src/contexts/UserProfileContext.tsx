import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { usePresence } from "./PresenceContext";
import userService, { UserProfile } from "../services/userService";

interface UserProfileContextType {
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
  getUserDisplayName: (userId: string) => Promise<string>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  getUserInterests: (userId: string) => Promise<string[]>;
  updateUserInterests: (interests: string[]) => Promise<void>;
  profiles: Map<string, UserProfile>;
  loading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { nearbyUsers } = usePresence();
  const [profiles, setProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(false);

  // Get user profile with caching
  const getUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    // Check cache first
    if (profiles.has(userId)) {
      console.log("UserProfileContext: Using cached profile for:", userId);
      return profiles.get(userId) || null;
    }

    // If not in cache, fetch from database
    setLoading(true);
    try {
      const profile = await userService.getUserProfile(userId);
      if (profile) {
        setProfiles((prev) => new Map(prev).set(userId, profile));
      }
      return profile;
    } catch (error) {
      console.error("UserProfileContext: Error fetching profile:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get user display name with fallback
  const getUserDisplayName = async (userId: string): Promise<string> => {
    console.log("UserProfileContext: Getting display name for:", userId);

    // First try to find in nearby users (if they're visible)
    const nearbyUser = nearbyUsers.find((u) => u.id === userId);
    if (nearbyUser) {
      console.log(
        "UserProfileContext: Found in nearby users:",
        nearbyUser.displayName
      );
      return nearbyUser.displayName;
    }

    console.log(
      "UserProfileContext: Not in nearby users, fetching from database"
    );
    const profile = await getUserProfile(userId);
    if (profile) {
      console.log(
        "UserProfileContext: Found in database:",
        profile.displayName
      );
      return profile.displayName;
    }

    console.log("UserProfileContext: Using fallback name for:", userId);
    // Final fallback
    return `User ${userId.slice(0, 8)}`;
  };

  // Get user interests
  const getUserInterests = async (userId: string): Promise<string[]> => {
    const profile = await getUserProfile(userId);
    return profile?.interests || [];
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("User not authenticated");
    try {
      await userService.updateUserProfile(user.uid, data);
      setProfiles((prev) => {
        const newCache = new Map(prev);
        const currentProfile = newCache.get(user.uid);
        if (currentProfile) {
          newCache.set(user.uid, { ...currentProfile, ...data });
        }
        return newCache;
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  // Update user interests
  const updateUserInterests = async (interests: string[]) => {
    if (!user) throw new Error("User not authenticated");
    try {
      await userService.updateUserProfile(user.uid, { interests });
      setProfiles((prev) => {
        const newCache = new Map(prev);
        const currentProfile = newCache.get(user.uid);
        if (currentProfile) {
          newCache.set(user.uid, { ...currentProfile, interests });
        }
        return newCache;
      });
    } catch (error) {
      console.error("Error updating user interests:", error);
      throw error;
    }
  };

  // Preload profiles for multiple users
  const preloadProfiles = async (userIds: string[]) => {
    const uncachedIds = userIds.filter((id) => !profiles.has(id));
    if (uncachedIds.length === 0) return;

    setLoading(true);
    try {
      const fetchedProfiles = await userService.getUserProfiles(uncachedIds);
      setProfiles((prev) => {
        const newMap = new Map(prev);
        fetchedProfiles.forEach((profile) => {
          newMap.set(profile.id, profile);
        });
        return newMap;
      });
    } catch (error) {
      console.error("UserProfileContext: Error preloading profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    getUserProfile,
    getUserDisplayName,
    updateUserProfile,
    getUserInterests,
    updateUserInterests,
    profiles,
    loading,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
