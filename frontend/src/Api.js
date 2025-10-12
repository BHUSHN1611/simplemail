import axios from 'axios';

// Use Vite environment variable for production backend base URL.
// In production set VITE_API_BASE to your backend URL (e.g. https://your-backend.onrender.com)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE,
});

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

export const sendEmail = (emailData) => {
    return api.post('/email/send', emailData)
        .then(response => response.data);
};

export const getEmails = ({ q = '', pageToken = '', limit, folder = 'Inbox' } = {}) => {
    const params = [];
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (pageToken) params.push(`pageToken=${encodeURIComponent(pageToken)}`);
    if (limit) params.push(`limit=${encodeURIComponent(limit)}`);
    if (folder && folder !== 'Inbox') params.push(`folder=${encodeURIComponent(folder)}`);
    const qs = params.length ? `?${params.join('&')}` : '';

    return api.get(`/email/inbox${qs}`)
        .then(response => response.data);
};

export const getEmailById = (id) => {
    // For demo emails, don't send auth header
    if (id.startsWith('demo-')) {
        return axios.get(`${API_BASE}/email/message/${id}`)
            .then(response => response.data);
    }

    return api.get(`/email/message/${id}`)
        .then(response => response.data);
};