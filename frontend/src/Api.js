import axios from 'axios';

// Use Vite environment variable for production backend base URL.
// In production set VITE_API_BASE to your backend URL (e.g. https://your-backend.onrender.com)
// For Render deployment, use: https://your-backend-service-name.onrender.com
const API_BASE = import.meta.env.VITE_API_BASE;

const api = axios.create({
    baseURL: API_BASE,
});

// Helper function to check if response is JSON
const isJsonResponse = (response) => {
    const contentType = response.headers?.['content-type'] || '';
    return contentType.includes('application/json') || contentType.includes('application/javascript');
};

// Helper function to detect network connectivity issues
const isNetworkError = (error) => {
    return (
        !error.response && error.request ||
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNABORTED' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('timeout')
    );
};

// Helper function to create user-friendly network error messages
const getNetworkErrorMessage = (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return 'Request timeout: The server took too long to respond. Please check your connection and try again.';
    }
    if (error.code === 'ENOTFOUND') {
        return 'Server not found: Please check if the server is running and try again.';
    }
    if (error.code === 'ECONNREFUSED') {
        return 'Connection refused: The server is not accepting connections. Please try again later.';
    }
    return 'Network error: Please check your internet connection and try again.';
};

// Helper function to safely parse JSON response
const safeJsonParse = (response) => {
    try {
        // Check if response has data and it's not empty
        if (!response.data) {
            throw new Error('Empty response received from server');
        }

        // If it's already parsed (object), return as is
        if (typeof response.data === 'object' && response.data !== null) {
            return response.data;
        }

        // Try to parse as JSON
        if (typeof response.data === 'string') {
            // Check if it's HTML (error page)
            if (response.data.trim().startsWith('<')) {
                throw new Error('Received HTML error page instead of JSON response');
            }

            // Try to parse JSON
            return JSON.parse(response.data);
        }

        // If it's not a string or object, something is wrong
        throw new Error('Invalid response format received from server');
    } catch (parseError) {
        if (parseError.message.includes('JSON.parse')) {
            throw new Error('Invalid JSON response received from server');
        }
        throw parseError;
    }
};

// Add response interceptor to log all responses and handle JSON parsing errors
api.interceptors.response.use(
    (response) => {
        console.log('🔗 API Response:', {
            url: response.config.url,
            status: response.status,
            headers: response.headers
        });

        // Safely handle response data
        if (response.data !== undefined) {
            try {
                response.data = safeJsonParse(response);
            } catch (parseError) {
                console.error('🔗 API: JSON parsing error:', parseError.message);
                // Create a more informative error
                const enhancedError = new Error(`Response parsing failed: ${parseError.message}`);
                enhancedError.originalResponse = response;
                enhancedError.isJsonError = true;
                throw enhancedError;
            }
        }

        return response;
    },
    (error) => {
        console.error('🔗 API Error Response:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            isNetworkError: !error.response,
            headers: error.response?.headers
        });

        // Enhanced error handling for different scenarios
        if (isNetworkError(error)) {
            // Network error with specific messaging
            const networkError = new Error(getNetworkErrorMessage(error));
            networkError.isNetworkError = true;
            networkError.originalError = error;
            return Promise.reject(networkError);
        }

        // Handle different HTTP status codes
        if (error.response.status >= 500) {
            const serverError = new Error('Server error: The server encountered an internal error. Please try again later.');
            serverError.isServerError = true;
            serverError.originalError = error;
            return Promise.reject(serverError);
        }

        if (error.response.status === 404) {
            const notFoundError = new Error('Not found: The requested resource was not found.');
            notFoundError.isNotFoundError = true;
            notFoundError.originalError = error;
            return Promise.reject(notFoundError);
        }

        if (error.response.status >= 400) {
            const clientError = new Error('Request error: There was a problem with your request.');
            clientError.isClientError = true;
            clientError.originalError = error;
            return Promise.reject(clientError);
        }

        return Promise.reject(error);
    }
);

// Add auth token to requests
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('user-info');
    
    if (userInfo) {
        try {
            const { token } = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error parsing user info from localStorage:', error);
            // Clear corrupted data
            localStorage.removeItem('user-info');
        }
    }
    return config;
});

// Handle 401 responses (token expired or invalid)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('🔗 API: 401 Unauthorized - clearing stored auth data');
            localStorage.removeItem('user-info');
            // Optionally redirect to login page
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export const googleAuth = (accessToken) => {
    return api.get(`/auth/google?access_token=${encodeURIComponent(accessToken)}`);
};

export const appPasswordLogin = ({ email, appPassword, imapHost }) => {
    // Validate API_BASE is set
    if (!API_BASE) {
        const error = new Error('API_BASE environment variable is not configured. Please check your .env file.');
        console.error('❌ API: Configuration error:', error.message);
        throw error;
    }

    console.log('🔐 API: Attempting app password login for:', email);
    console.log('🔍 API: Full request config:', {
        url: `${API_BASE}/auth/app-login`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: { email, appPassword, imapHost }
    });

    return api.post('/auth/app-login', { email, appPassword, imapHost })
        .then(response => {
            console.log('✅ API: Login successful:', response.data);
            console.log('✅ API: Full response:', response);
            return response.data;
        })
        .catch(error => {
            console.error('❌ API: Login failed:', error);
            console.error('❌ API: Full error object:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
                config: error.config,
                code: error.code,
                response: error.response ? {
                    data: error.response.data,
                    status: error.response.status,
                    headers: error.response.headers,
                    statusText: error.response.statusText
                } : 'No response object',
                request: error.request ? 'Request object exists' : 'No request object'
            });

            // Enhanced error handling for login-specific scenarios
            let userFriendlyMessage = 'Login failed';

            if (error.isNetworkError) {
                userFriendlyMessage = 'Network error: Please check your internet connection and try again.';
            } else if (error.isServerError) {
                userFriendlyMessage = 'Server error: The authentication server is temporarily unavailable. Please try again in a few minutes.';
            } else if (error.isNotFoundError) {
                userFriendlyMessage = 'Authentication service not found: Please contact support if this issue persists.';
            } else if (error.isClientError) {
                userFriendlyMessage = 'Login credentials error: Please check your email and app password and try again.';
            } else if (error.isJsonError) {
                userFriendlyMessage = 'Communication error: Received an invalid response from the server. Please try again.';
            } else if (error.response) {
                // Try to extract error message from response, but safely handle non-JSON responses
                try {
                    if (error.response.data) {
                        if (typeof error.response.data === 'string') {
                            // Check if it's HTML (error page)
                            if (error.response.data.trim().startsWith('<')) {
                                userFriendlyMessage = 'Server error: Received an HTML error page. Please try again or contact support.';
                            } else {
                                // Try to parse as JSON
                                try {
                                    const parsedData = JSON.parse(error.response.data);
                                    userFriendlyMessage = parsedData.message || parsedData.error || userFriendlyMessage;
                                } catch (parseError) {
                                    // If JSON parsing fails, use the string as message
                                    userFriendlyMessage = error.response.data.length > 200
                                        ? 'Server error: Please try again or contact support.'
                                        : error.response.data;
                                }
                            }
                        } else if (typeof error.response.data === 'object') {
                            userFriendlyMessage = error.response.data.message || error.response.data.error || userFriendlyMessage;
                        }
                    }
                } catch (dataError) {
                    console.error('Error processing login error response data:', dataError);
                    userFriendlyMessage = 'An error occurred while processing the server response.';
                }
            }

            // Create enhanced error with user-friendly message
            const enhancedError = new Error(userFriendlyMessage);
            enhancedError.originalError = error;
            enhancedError.response = error.response;
            enhancedError.isApiError = true;

            // Add specific error types for better handling in UI
            if (error.isNetworkError) enhancedError.type = 'network';
            else if (error.isServerError) enhancedError.type = 'server';
            else if (error.isNotFoundError) enhancedError.type = 'not_found';
            else if (error.isClientError) enhancedError.type = 'client';
            else if (error.isJsonError) enhancedError.type = 'json_parse';
            else enhancedError.type = 'unknown';

            throw enhancedError;
        });
};

export const sendEmail = (emailData) => {
    // Validate API_BASE is set
    if (!API_BASE) {
        const error = new Error('API_BASE environment variable is not configured. Please check your .env file.');
        console.error('❌ API: Configuration error:', error.message);
        throw error;
    }

    console.log('🚀 API: Sending email request to:', '/email/send');
    console.log('📧 Email data:', emailData);
    console.log('🔍 API: Full request config:', {
        url: `${API_BASE}/email/send`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('user-info') ? JSON.parse(localStorage.getItem('user-info')).token : 'NO_TOKEN'}`
        },
        data: emailData
    });

    return api.post('/email/send', emailData)
        .then(response => {
            console.log('✅ API: Email sent successfully:', response.data);
            console.log('✅ API: Full response:', response);
            return response.data;
        })
        .catch(error => {
            console.error('❌ API: Email send failed:', error);
            console.error('❌ API: Full error object:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
                config: error.config,
                code: error.code,
                response: error.response ? {
                    data: error.response.data,
                    status: error.response.status,
                    headers: error.response.headers,
                    statusText: error.response.statusText
                } : 'No response object',
                request: error.request ? 'Request object exists' : 'No request object'
            });

            // Enhanced error handling for different scenarios
            let userFriendlyMessage = 'An error occurred while sending the email';

            if (error.isNetworkError) {
                userFriendlyMessage = 'Network error: Please check your internet connection and try again.';
            } else if (error.isServerError) {
                userFriendlyMessage = 'Server error: The email server is temporarily unavailable. Please try again in a few minutes.';
            } else if (error.isNotFoundError) {
                userFriendlyMessage = 'Email service not found: Please contact support if this issue persists.';
            } else if (error.isClientError) {
                userFriendlyMessage = 'Email request error: Please check your email details and try again.';
            } else if (error.isJsonError) {
                userFriendlyMessage = 'Communication error: Received an invalid response from the server. Please try again.';
            } else if (error.response) {
                // Try to extract error message from response, but safely handle non-JSON responses
                try {
                    if (error.response.data) {
                        if (typeof error.response.data === 'string') {
                            // Check if it's HTML (error page)
                            if (error.response.data.trim().startsWith('<')) {
                                userFriendlyMessage = 'Server error: Received an HTML error page. Please try again or contact support.';
                            } else {
                                // Try to parse as JSON
                                try {
                                    const parsedData = JSON.parse(error.response.data);
                                    userFriendlyMessage = parsedData.message || parsedData.error || userFriendlyMessage;
                                } catch (parseError) {
                                    // If JSON parsing fails, use the string as message
                                    userFriendlyMessage = error.response.data.length > 200
                                        ? 'Server error: Please try again or contact support.'
                                        : error.response.data;
                                }
                            }
                        } else if (typeof error.response.data === 'object') {
                            userFriendlyMessage = error.response.data.message || error.response.data.error || userFriendlyMessage;
                        }
                    }
                } catch (dataError) {
                    console.error('Error processing error response data:', dataError);
                    userFriendlyMessage = 'An unexpected error occurred while processing the server response.';
                }
            }

            // Create enhanced error with user-friendly message
            const enhancedError = new Error(userFriendlyMessage);
            enhancedError.originalError = error;
            enhancedError.response = error.response;
            enhancedError.isApiError = true;

            // Add specific error types for better handling in UI
            if (error.isNetworkError) enhancedError.type = 'network';
            else if (error.isServerError) enhancedError.type = 'server';
            else if (error.isNotFoundError) enhancedError.type = 'not_found';
            else if (error.isClientError) enhancedError.type = 'client';
            else if (error.isJsonError) enhancedError.type = 'json_parse';
            else enhancedError.type = 'unknown';

            throw enhancedError;
        });
};

export const getEmails = ({ q = '', pageToken = '', limit, folder = 'Inbox' } = {}) => {
    const params = [];
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (pageToken) params.push(`pageToken=${encodeURIComponent(pageToken)}`);
    if (limit) params.push(`limit=${encodeURIComponent(limit)}`);
    if (folder && folder !== 'Inbox') params.push(`folder=${encodeURIComponent(folder)}`);
    const qs = params.length ? `?${params.join('&')}` : '';

    console.log('📬 API: Fetching emails with query:', qs);

    return api.get(`/email/inbox${qs}`)
        .then(response => {
            console.log('✅ API: Emails fetched successfully');
            return response.data;
        })
        .catch(error => {
            console.error('❌ API: Failed to fetch emails:', error);

            // Enhanced error handling with user-friendly messages
            let userFriendlyMessage = 'Failed to load emails';

            if (error.isNetworkError) {
                userFriendlyMessage = 'Network error: Please check your internet connection and try again.';
            } else if (error.isServerError) {
                userFriendlyMessage = 'Server error: The email server is temporarily unavailable. Please try again in a few minutes.';
            } else if (error.isNotFoundError) {
                userFriendlyMessage = 'Email service not found: Please contact support if this issue persists.';
            } else if (error.isClientError) {
                userFriendlyMessage = 'Request error: There was a problem with your email request.';
            } else if (error.isJsonError) {
                userFriendlyMessage = 'Data error: Received invalid email data from server. Please refresh and try again.';
            } else {
                // Try to extract more specific error information
                if (error.response?.data) {
                    try {
                        if (typeof error.response.data === 'string') {
                            if (error.response.data.trim().startsWith('<')) {
                                userFriendlyMessage = 'Server error: Please try refreshing the page or contact support.';
                            } else {
                                userFriendlyMessage = error.response.data.length > 200
                                    ? 'Server error: Please try again or contact support.'
                                    : error.response.data;
                            }
                        } else if (typeof error.response.data === 'object') {
                            userFriendlyMessage = error.response.data.message || error.response.data.error || userFriendlyMessage;
                        }
                    } catch (dataError) {
                        console.error('Error processing email error response:', dataError);
                    }
                }
            }

            // Create enhanced error
            const enhancedError = new Error(userFriendlyMessage);
            enhancedError.originalError = error;
            enhancedError.response = error.response;
            enhancedError.isApiError = true;
            enhancedError.type = error.isNetworkError ? 'network' :
                               error.isServerError ? 'server' :
                               error.isNotFoundError ? 'not_found' :
                               error.isClientError ? 'client' :
                               error.isJsonError ? 'json_parse' : 'unknown';

            throw enhancedError;
        });
};

export const getEmailById = (id) => {
    console.log('📧 API: Fetching email by ID:', id);

    // For demo emails, don't send auth header
    if (id.startsWith('demo-')) {
        console.log('📧 API: Fetching demo email without auth');
        return axios.get(`${API_BASE}/email/message/${id}`)
            .then(response => {
                console.log('✅ API: Demo email fetched successfully');
                return response.data;
            })
            .catch(error => {
                console.error('❌ API: Failed to fetch demo email:', error);

                // Enhanced error handling for demo emails
                let userFriendlyMessage = 'Failed to load demo email';

                if (error.isNetworkError) {
                    userFriendlyMessage = 'Network error: Please check your internet connection and try again.';
                } else if (error.isServerError) {
                    userFriendlyMessage = 'Server error: The demo email server is temporarily unavailable.';
                } else if (error.isNotFoundError) {
                    userFriendlyMessage = 'Demo email not found: The requested demo email could not be found.';
                } else if (error.isJsonError) {
                    userFriendlyMessage = 'Data error: Invalid demo email data received. Please try again.';
                } else {
                    userFriendlyMessage = 'Unable to load the demo email. Please try again.';
                }

                const enhancedError = new Error(userFriendlyMessage);
                enhancedError.originalError = error;
                enhancedError.response = error.response;
                enhancedError.isApiError = true;
                enhancedError.type = error.isNetworkError ? 'network' :
                                   error.isServerError ? 'server' :
                                   error.isNotFoundError ? 'not_found' :
                                   error.isJsonError ? 'json_parse' : 'unknown';

                throw enhancedError;
            });
    }

    console.log('📧 API: Fetching regular email with auth');
    return api.get(`/email/message/${id}`)
        .then(response => {
            console.log('✅ API: Email fetched successfully');
            return response.data;
        })
        .catch(error => {
            console.error('❌ API: Failed to fetch email:', error);

            // Enhanced error handling for regular emails
            let userFriendlyMessage = 'Failed to load email';

            if (error.isNetworkError) {
                userFriendlyMessage = 'Network error: Please check your internet connection and try again.';
            } else if (error.isServerError) {
                userFriendlyMessage = 'Server error: The email server is temporarily unavailable. Please try again in a few minutes.';
            } else if (error.isNotFoundError) {
                userFriendlyMessage = 'Email not found: The requested email could not be found.';
            } else if (error.isClientError) {
                userFriendlyMessage = 'Access error: You may not have permission to view this email.';
            } else if (error.isJsonError) {
                userFriendlyMessage = 'Data error: Received invalid email data from server. Please refresh and try again.';
            } else {
                // Try to extract more specific error information
                if (error.response?.data) {
                    try {
                        if (typeof error.response.data === 'string') {
                            if (error.response.data.trim().startsWith('<')) {
                                userFriendlyMessage = 'Server error: Please try refreshing the page or contact support.';
                            } else {
                                userFriendlyMessage = error.response.data.length > 200
                                    ? 'Server error: Please try again or contact support.'
                                    : error.response.data;
                            }
                        } else if (typeof error.response.data === 'object') {
                            userFriendlyMessage = error.response.data.message || error.response.data.error || userFriendlyMessage;
                        }
                    } catch (dataError) {
                        console.error('Error processing email error response:', dataError);
                    }
                }
            }

            // Create enhanced error
            const enhancedError = new Error(userFriendlyMessage);
            enhancedError.originalError = error;
            enhancedError.response = error.response;
            enhancedError.isApiError = true;
            enhancedError.type = error.isNetworkError ? 'network' :
                               error.isServerError ? 'server' :
                               error.isNotFoundError ? 'not_found' :
                               error.isClientError ? 'client' :
                               error.isJsonError ? 'json_parse' : 'unknown';

            throw enhancedError;
        });
};