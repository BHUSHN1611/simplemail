// Authentication utility functions and constants

// Constants for better maintainability
export const AUTH_CONSTANTS = {
    STORAGE_KEY: 'user-info',
    ROUTES: {
        DASHBOARD: '/dashboard'
    },
    ERRORS: {
        NO_ACCESS_TOKEN: 'No access token returned by Google',
        INVALID_RESPONSE: 'Login failed: unexpected response from server.',
        NETWORK_ERROR: 'Login failed: no response from server (network/CORS). Check API base URL and backend status.',
        GOOGLE_SIGNIN_FAILED: 'Google sign-in failed. Please try again.',
        DEFAULT_ERROR: 'Login failed: '
    }
};

// User data validation schema
export const validateUserData = (data) => {
    if (!data || typeof data !== 'object') {
        return { isValid: false, error: 'Invalid response format' };
    }

    // Handle nested response structure from backend
    const responseData = data.data || data;
    const { user, token } = responseData;

    if (!user || typeof user !== 'object') {
        return { isValid: false, error: 'Invalid user data in response' };
    }

    if (!token || typeof token !== 'string') {
        return { isValid: false, error: 'Invalid or missing token' };
    }

    const { email, name } = user;
    if (!email || !name) {
        return { isValid: false, error: 'Missing required user information' };
    }

    return { isValid: true };
};

// Extract user info from API response
export const extractUserInfo = (responseData) => {
    // Handle nested response structure from backend
    const data = responseData.data || responseData;
    const { user, token } = data;
    const { email, name, image } = user;

    return {
        email: email || '',
        name: name || '',
        token: token || '',
        image: image || ''
    };
};

// Store user data in localStorage with error handling
export const storeUserData = (userData) => {
    try {
        localStorage.setItem(AUTH_CONSTANTS.STORAGE_KEY, JSON.stringify(userData));
        return { success: true };
    } catch (error) {
        console.error('Failed to store user data:', error);
        return { success: false, error: 'Failed to save login information' };
    }
};

// Retry mechanism for network requests
export const retryAsync = async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on the last attempt or for certain error types
            if (i === maxRetries || error?.response?.status < 500) {
                throw error;
            }

            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }

    throw lastError;
};

// Enhanced error message extraction
export const getErrorMessage = (error) => {
    if (error?.response) {
        // Server responded with error status
        const serverMsg = error.response?.data?.message ||
                         JSON.stringify(error.response?.data) ||
                         error.response?.statusText ||
                         `Server error (${error.response?.status})`;
        return serverMsg;
    }

    if (error?.request) {
        // Network error
        return AUTH_CONSTANTS.ERRORS.NETWORK_ERROR;
    }

    // Other errors
    return error?.message || AUTH_CONSTANTS.ERRORS.DEFAULT_ERROR + String(error);
};