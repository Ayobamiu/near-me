// Error codes and their friendly messages
export const ERROR_MESSAGES = {
    // Authentication Errors
    'auth/user-not-found': {
        title: 'Account Not Found',
        message: 'No account found with this email address. Please check your email or create a new account.',
        action: 'Try Again'
    },
    'auth/invalid-credential': {
        title: 'Incorrect Password or Email',
        message: 'The email or password you entered is incorrect. Please try again or reset your password.',
        action: 'Try Again'
    },
    'auth/wrong-password': {
        title: 'Incorrect Password',
        message: 'The password you entered is incorrect. Please try again or reset your password.',
        action: 'Try Again'
    },
    'auth/email-already-in-use': {
        title: 'Email Already Registered',
        message: 'An account with this email already exists. Please sign in instead or use a different email.',
        action: 'Sign In'
    },
    'auth/weak-password': {
        title: 'Password Too Weak',
        message: 'Please choose a stronger password with at least 6 characters.',
        action: 'Try Again'
    },
    'auth/invalid-email': {
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        action: 'Try Again'
    },
    'auth/user-disabled': {
        title: 'Account Disabled',
        message: 'This account has been disabled. Please contact support for assistance.',
        action: 'Contact Support'
    },
    'auth/too-many-requests': {
        title: 'Too Many Attempts',
        message: 'Too many failed attempts. Please wait a moment before trying again.',
        action: 'Try Later'
    },
    'auth/network-request-failed': {
        title: 'Connection Error',
        message: 'Unable to connect to our servers. Please check your internet connection.',
        action: 'Try Again'
    },

    // Connection Errors
    'connection/request-exists': {
        title: 'Request Already Sent',
        message: 'You have already sent a connection request to this person.',
        action: 'OK'
    },
    'connection/self-request': {
        title: 'Cannot Connect to Yourself',
        message: 'You cannot send a connection request to yourself.',
        action: 'OK'
    },
    'connection/not-found': {
        title: 'Connection Not Found',
        message: 'This connection request could not be found. It may have been deleted.',
        action: 'OK'
    },
    'connection/unauthorized': {
        title: 'Unauthorized Action',
        message: 'You are not authorized to perform this action on this connection.',
        action: 'OK'
    },

    // Profile Errors
    'profile/update-failed': {
        title: 'Profile Update Failed',
        message: 'Unable to update your profile. Please try again.',
        action: 'Try Again'
    },
    'profile/load-failed': {
        title: 'Profile Load Failed',
        message: 'Unable to load your profile information. Please try again.',
        action: 'Try Again'
    },
    'profile/interests-save-failed': {
        title: 'Interests Save Failed',
        message: 'Unable to save your interests. Please check your connection and try again.',
        action: 'Try Again'
    },

    // Network Errors
    'network/offline': {
        title: 'You\'re Offline',
        message: 'Please check your internet connection and try again.',
        action: 'Try Again'
    },
    'network/timeout': {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        action: 'Try Again'
    },
    'network/server-error': {
        title: 'Server Error',
        message: 'Our servers are experiencing issues. Please try again in a few moments.',
        action: 'Try Again'
    },

    // Validation Errors
    'validation/required-field': {
        title: 'Required Field',
        message: 'Please fill in all required fields.',
        action: 'OK'
    },
    'validation/invalid-input': {
        title: 'Invalid Input',
        message: 'Please check your input and try again.',
        action: 'OK'
    },
    'validation/too-many-interests': {
        title: 'Too Many Interests',
        message: 'You can select up to 15 interests. Please remove some selections.',
        action: 'OK'
    },

    // Generic Errors
    'generic/unknown': {
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred. Please try again.',
        action: 'Try Again'
    },
    'generic/permission-denied': {
        title: 'Permission Denied',
        message: 'You don\'t have permission to perform this action.',
        action: 'OK'
    }
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

// Function to get friendly error message
export const getFriendlyError = (error: any): { title: string; message: string; action: string } => {
    // Check if it's a Firebase auth error
    if (error?.code && ERROR_MESSAGES[error.code as ErrorCode]) {
        return ERROR_MESSAGES[error.code as ErrorCode];
    }

    // Check if it's a custom error with code
    if (error?.code && ERROR_MESSAGES[error.code as ErrorCode]) {
        return ERROR_MESSAGES[error.code as ErrorCode];
    }

    // Check for network errors
    if (error?.message) {
        if (error.message.includes('network') || error.message.includes('Network')) {
            return ERROR_MESSAGES['network/offline'];
        }
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
            return ERROR_MESSAGES['network/timeout'];
        }
        if (error.message.includes('server') || error.message.includes('Server')) {
            return ERROR_MESSAGES['network/server-error'];
        }
    }

    // Check for specific error messages
    if (error?.message) {
        if (error.message.includes('Connection request already exists')) {
            return ERROR_MESSAGES['connection/request-exists'];
        }
        if (error.message.includes('Cannot connect to yourself')) {
            return ERROR_MESSAGES['connection/self-request'];
        }
        if (error.message.includes('Connection not found')) {
            return ERROR_MESSAGES['connection/not-found'];
        }
        if (error.message.includes('Profile update failed')) {
            return ERROR_MESSAGES['profile/update-failed'];
        }
        if (error.message.includes('Too many interests')) {
            return ERROR_MESSAGES['validation/too-many-interests'];
        }
    }

    // Default to generic error
    return ERROR_MESSAGES['generic/unknown'];
};

// Function to create custom errors with codes
export const createError = (code: ErrorCode, customMessage?: string): Error => {
    const error = new Error(customMessage || ERROR_MESSAGES[code].message);
    (error as any).code = code;
    return error;
};

// Function to check if error is retryable
export const isRetryableError = (error: any): boolean => {
    const retryableCodes = [
        'auth/network-request-failed',
        'auth/too-many-requests',
        'network/offline',
        'network/timeout',
        'network/server-error',
        'profile/update-failed',
        'profile/load-failed',
        'profile/interests-save-failed',
        'generic/unknown'
    ];

    if (error?.code && retryableCodes.includes(error.code)) {
        return true;
    }

    // Check for network-related error messages
    if (error?.message) {
        const networkKeywords = ['network', 'timeout', 'server', 'connection', 'offline'];
        return networkKeywords.some(keyword =>
            error.message.toLowerCase().includes(keyword)
        );
    }

    return false;
};
