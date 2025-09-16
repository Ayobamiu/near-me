import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    addDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface Connection {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: 'pending' | 'accepted' | 'declined' | 'blocked';
    createdAt: any; // Firestore timestamp
    updatedAt: any; // Firestore timestamp
    message?: string; // Optional initial message
}

export interface Message {
    id: string;
    connectionId: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: any; // Firestore timestamp
    read: boolean;
}

class ConnectionsService {
    private connectionsRef = collection(db, 'connections');
    private messagesRef = collection(db, 'messages');

    // Send a connection request
    async sendConnectionRequest(
        fromUserId: string,
        toUserId: string,
        message?: string
    ): Promise<string> {
        try {
            // Check if connection already exists and is not declined
            const existingConnection = await this.getConnection(fromUserId, toUserId);
            if (existingConnection && existingConnection.status !== 'declined') {
                throw new Error('Connection request already exists');
            }

            const connectionData: Omit<Connection, 'id'> = {
                fromUserId,
                toUserId,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                message: message || '',
            };

            const docRef = await addDoc(this.connectionsRef, connectionData);
            return docRef.id;
        } catch (error) {
            console.error('Error sending connection request:', error);
            throw error;
        }
    }

    // Get connection between two users
    async getConnection(fromUserId: string, toUserId: string): Promise<Connection | null> {
        try {
            const q = query(
                this.connectionsRef,
                where('fromUserId', '==', fromUserId),
                where('toUserId', '==', toUserId)
            );

            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            const data = doc.data();
            return {
                id: doc.id,
                fromUserId: data.fromUserId,
                toUserId: data.toUserId,
                status: data.status,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                message: data.message,
            };
        } catch (error) {
            console.error('Error getting connection:', error);
            return null;
        }
    }

    // Update connection status
    async updateConnectionStatus(
        connectionId: string,
        status: Connection['status']
    ): Promise<void> {
        try {
            const connectionDoc = doc(this.connectionsRef, connectionId);
            await updateDoc(connectionDoc, {
                status,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating connection status:', error);
            throw error;
        }
    }

    // Resend a declined connection request
    async resendConnectionRequest(
        connectionId: string,
        message?: string
    ): Promise<void> {
        try {
            const connectionDoc = doc(this.connectionsRef, connectionId);
            await updateDoc(connectionDoc, {
                status: 'pending',
                message: message || '',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error resending connection request:', error);
            throw error;
        }
    }

    // Get user's outgoing connections (excluding declined)
    async getUserConnections(userId: string): Promise<Connection[]> {
        try {
            const q = query(
                this.connectionsRef,
                where('fromUserId', '==', userId),
                where('status', '!=', 'declined'),
                orderBy('updatedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const connections: Connection[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                connections.push({
                    id: doc.id,
                    fromUserId: data.fromUserId,
                    toUserId: data.toUserId,
                    status: data.status,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    message: data.message,
                });
            });
            return connections;
        } catch (error) {
            console.error('Error getting user connections:', error);
            return [];
        }
    }

    // Get user's incoming connections (excluding declined)
    async getIncomingConnections(userId: string): Promise<Connection[]> {
        try {
            const q = query(
                this.connectionsRef,
                where('toUserId', '==', userId),
                where('status', '!=', 'declined'),
                orderBy('updatedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const connections: Connection[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                connections.push({
                    id: doc.id,
                    fromUserId: data.fromUserId,
                    toUserId: data.toUserId,
                    status: data.status,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    message: data.message,
                });
            });
            return connections;
        } catch (error) {
            console.error('Error getting incoming connections:', error);
            return [];
        }
    }

    // Get user's declined connections (for resending)
    async getDeclinedConnections(userId: string): Promise<Connection[]> {
        try {
            const q = query(
                this.connectionsRef,
                where('fromUserId', '==', userId),
                where('status', '==', 'declined'),
                orderBy('updatedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const connections: Connection[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                connections.push({
                    id: doc.id,
                    fromUserId: data.fromUserId,
                    toUserId: data.toUserId,
                    status: data.status,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    message: data.message,
                });
            });
            return connections;
        } catch (error) {
            console.error('Error getting declined connections:', error);
            return [];
        }
    }

    // Subscribe to user's outgoing connections (excluding declined)
    subscribeToUserConnections(
        userId: string,
        callback: (connections: Connection[]) => void
    ): () => void {
        const q = query(
            this.connectionsRef,
            where('fromUserId', '==', userId),
            where('status', '!=', 'declined'),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const connections: Connection[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    connections.push({
                        id: doc.id,
                        fromUserId: data.fromUserId,
                        toUserId: data.toUserId,
                        status: data.status,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                        message: data.message,
                    });
                });
                callback(connections);
            },
            (error) => {
                console.error('Error in connections subscription:', error);
                if (process.env.NODE_ENV === 'development') {
                    callback([]);
                }
            }
        );

        return unsubscribe;
    }

    // Subscribe to user's incoming connections (excluding declined)
    subscribeToIncomingConnections(
        userId: string,
        callback: (connections: Connection[]) => void
    ): () => void {
        const q = query(
            this.connectionsRef,
            where('toUserId', '==', userId),
            where('status', '!=', 'declined'),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const connections: Connection[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    connections.push({
                        id: doc.id,
                        fromUserId: data.fromUserId,
                        toUserId: data.toUserId,
                        status: data.status,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                        message: data.message,
                    });
                });
                callback(connections);
            },
            (error) => {
                console.error('Error in incoming connections subscription:', error);
                if (process.env.NODE_ENV === 'development') {
                    callback([]);
                }
            }
        );

        return unsubscribe;
    }

    // Send a message
    async sendMessage(
        connectionId: string,
        senderId: string,
        receiverId: string,
        content: string
    ): Promise<string> {
        try {
            console.log('ConnectionsService: Sending message:', {
                connectionId,
                senderId,
                receiverId,
                content
            });

            const messageData: Omit<Message, 'id'> = {
                connectionId,
                senderId,
                receiverId,
                content,
                timestamp: serverTimestamp(),
                read: false,
            };

            const docRef = await addDoc(this.messagesRef, messageData);
            console.log('ConnectionsService: Message saved with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('ConnectionsService: Error sending message:', error);
            throw error;
        }
    }

    // Subscribe to messages for a connection
    subscribeToMessages(
        connectionId: string,
        callback: (messages: Message[]) => void
    ): () => void {
        console.log('ConnectionsService: Subscribing to messages for connection:', connectionId);

        const q = query(
            this.messagesRef,
            where('connectionId', '==', connectionId),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                console.log('ConnectionsService: Messages snapshot received:', snapshot.size, 'messages');
                const messages: Message[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    messages.push({
                        id: doc.id,
                        connectionId: data.connectionId,
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        content: data.content,
                        timestamp: data.timestamp,
                        read: data.read,
                    });
                });
                console.log('ConnectionsService: Processed messages:', messages.length);
                callback(messages);
            },
            (error) => {
                console.error('ConnectionsService: Error in messages subscription:', error);
                if (process.env.NODE_ENV === 'development') {
                    callback([]);
                }
            }
        );

        return unsubscribe;
    }

    // Mark message as read
    async markMessageAsRead(messageId: string): Promise<void> {
        try {
            const messageDoc = doc(this.messagesRef, messageId);
            await updateDoc(messageDoc, {
                read: true,
            });
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }
}

export default new ConnectionsService();
