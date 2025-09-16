import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserPresence {
  id: string;
  displayName: string;
  email: string;
  isVisible: boolean;
  lastSeen: any; // Firestore timestamp
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  interests?: string[];
}

class PresenceService {
  private presenceRef = collection(db, 'presence');
  private unsubscribe: (() => void) | null = null;

  // Update user's presence
  async updatePresence(
    userId: string,
    userData: Partial<UserPresence>
  ): Promise<void> {
    try {
      const presenceDoc = doc(this.presenceRef, userId);
      await setDoc(presenceDoc, {
        ...userData,
        lastSeen: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating presence:', error);
      // For development, we'll continue without throwing the error
      // In production, you'd want to handle this properly
      if (process.env.NODE_ENV === 'development') {
        console.warn('Presence update failed, continuing in development mode');
        return;
      }
      throw error;
    }
  }

  // Set user as visible/invisible
  async setVisibility(userId: string, isVisible: boolean): Promise<void> {
    await this.updatePresence(userId, { isVisible });
  }

  // Update user location
  async updateLocation(
    userId: string,
    latitude: number,
    longitude: number,
    accuracy: number
  ): Promise<void> {
    await this.updatePresence(userId, {
      location: { latitude, longitude, accuracy }
    });
  }

  // Subscribe to nearby users
  subscribeToNearbyUsers(
    callback: (users: UserPresence[]) => void
  ): () => void {
    const q = query(
      this.presenceRef,
      where('isVisible', '==', true),
      orderBy('lastSeen', 'desc')
    );

    this.unsubscribe = onSnapshot(q,
      (snapshot) => {
        const users: UserPresence[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          users.push({
            id: doc.id,
            displayName: data.displayName || 'Unknown',
            email: data.email || '',
            isVisible: data.isVisible || false,
            lastSeen: data.lastSeen,
            location: data.location,
            interests: data.interests || [],
          });
        });
        callback(users);
      },
      (error) => {
        console.error('Error in presence subscription:', error);
        // In development, return empty array instead of crashing
        if (process.env.NODE_ENV === 'development') {
          console.warn('Presence subscription failed, returning empty list in development mode');
          callback([]);
        }
      }
    );

    return () => {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    };
  }

  // Remove user presence (when they go offline)
  async removePresence(userId: string): Promise<void> {
    try {
      const presenceDoc = doc(this.presenceRef, userId);
      await deleteDoc(presenceDoc);
    } catch (error) {
      console.error('Error removing presence:', error);
      throw error;
    }
  }

  // Clean up
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

export default new PresenceService();
