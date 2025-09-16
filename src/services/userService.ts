import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
    id: string;
    displayName: string;
    email: string;
    interests?: string[];
    headline?: string;
    createdAt: any;
    updatedAt: any;
}

class UserService {
    private profilesRef = 'profiles';

    // Get user profile by ID
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            console.log('UserService: Fetching profile for user:', userId);
            const userDoc = doc(db, this.profilesRef, userId);
            console.log('UserService: Document path:', userDoc.path);
            const userSnap = await getDoc(userDoc);
            console.log('UserService: Document exists:', userSnap.exists());

            if (userSnap.exists()) {
                const data = userSnap.data();
                console.log('UserService: Raw data:', data);
                const profile: UserProfile = {
                    id: userSnap.id,
                    displayName: data.displayName || 'Unknown User',
                    email: data.email || '',
                    interests: data.interests || [],
                    headline: data.headline || '',
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                };
                console.log('UserService: Profile found:', profile.displayName);
                return profile;
            } else {
                console.log('UserService: No profile found for user:', userId);
                return null;
            }
        } catch (error) {
            console.error('UserService: Error fetching user profile:', error);
            return null;
        }
    }

    // Get multiple user profiles by IDs
    async getUserProfiles(userIds: string[]): Promise<UserProfile[]> {
        try {
            console.log('UserService: Fetching profiles for users:', userIds);
            const profiles: UserProfile[] = [];

            // Fetch profiles in parallel
            const profilePromises = userIds.map(userId => this.getUserProfile(userId));
            const results = await Promise.all(profilePromises);

            // Filter out null results
            results.forEach(profile => {
                if (profile) {
                    profiles.push(profile);
                }
            });

            console.log('UserService: Found profiles:', profiles.length);
            return profiles;
        } catch (error) {
            console.error('UserService: Error fetching user profiles:', error);
            return [];
        }
    }

    // Create or update user profile
    async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
        try {
            console.log('UserService: Updating profile for user:', userId);
            const userDoc = doc(db, this.profilesRef, userId);
            await setDoc(userDoc, {
                ...profileData,
                updatedAt: serverTimestamp(),
            }, { merge: true });
            console.log('UserService: Profile updated successfully');
        } catch (error) {
            console.error('UserService: Error updating user profile:', error);
            throw error;
        }
    }
}

export default new UserService();
