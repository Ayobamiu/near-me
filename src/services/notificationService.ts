import { Alert } from 'react-native';

class NotificationService {
    // Show connection request notification
    showConnectionRequest(fromUserName: string) {
        Alert.alert(
            "New Connection Request",
            `${fromUserName} wants to connect with you!`,
            [
                { text: "Decline", style: "cancel" },
                { text: "Accept", style: "default" }
            ]
        );
    }

    // Show connection accepted notification
    showConnectionAccepted(userName: string) {
        Alert.alert(
            "Connection Accepted!",
            `${userName} has accepted your connection request. You can now chat!`,
            [{ text: "Great!", style: "default" }]
        );
    }

    // Show new message notification
    showNewMessage(fromUserName: string, message: string) {
        Alert.alert(
            "New Message",
            `${fromUserName}: ${message}`,
            [
                { text: "Reply", style: "default" },
                { text: "Later", style: "cancel" }
            ]
        );
    }

    // Show connection sent notification
    showConnectionSent(userName: string) {
        Alert.alert(
            "Connection Sent",
            `Connection request sent to ${userName}!`,
            [{ text: "OK", style: "default" }]
        );
    }

    // Show error notification
    showError(title: string, message: string) {
        Alert.alert(title, message, [{ text: "OK", style: "default" }]);
    }
}

export default new NotificationService();
