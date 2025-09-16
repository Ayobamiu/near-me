import React from "react";
import { Alert, AlertButton } from "react-native";
import { getFriendlyError, isRetryableError } from "../services/errorService";

interface FriendlyErrorAlertProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  customTitle?: string;
  customMessage?: string;
}

export const showFriendlyError = ({
  error,
  onRetry,
  onDismiss,
  customTitle,
  customMessage,
}: FriendlyErrorAlertProps) => {
  const friendlyError = getFriendlyError(error);
  const isRetryable = isRetryableError(error);

  const title = customTitle || friendlyError.title;
  const message = customMessage || friendlyError.message;

  const buttons: AlertButton[] = [];

  // Add retry button if error is retryable and onRetry is provided
  if (isRetryable && onRetry) {
    buttons.push({
      text: "Try Again",
      onPress: onRetry,
      style: "default",
    });
  }

  // Add dismiss button
  buttons.push({
    text: friendlyError.action,
    onPress: onDismiss,
    style: friendlyError.action === "Try Again" ? "default" : "cancel",
  });

  Alert.alert(title, message, buttons);
};

// Convenience function for simple error display
export const showError = (error: any, onRetry?: () => void) => {
  showFriendlyError({ error, onRetry });
};

// Convenience function for custom error messages
export const showCustomError = (
  title: string,
  message: string,
  onDismiss?: () => void
) => {
  showFriendlyError({
    error: { code: "custom" },
    customTitle: title,
    customMessage: message,
    onDismiss,
  });
};

// Convenience function for success messages
export const showSuccess = (
  title: string,
  message: string,
  onDismiss?: () => void
) => {
  Alert.alert(title, message, [
    {
      text: "OK",
      onPress: onDismiss,
      style: "default",
    },
  ]);
};

export default {
  showFriendlyError,
  showError,
  showCustomError,
  showSuccess,
};
