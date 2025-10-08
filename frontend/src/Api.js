import axios from 'axios';

// Use Vite environment variable for production backend base URL.
// In production set VITE_API_BASE to your backend URL (e.g. https://api.example.com)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('user-info');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const googleAuth = (code) => api.get(`/auth/google?code=${code}`);
export const sendEmail = (emailData) => api.post('/email/send', emailData);
export const getEmails = ({ q = '', pageToken = '', limit } = {}) => {
    const params = [];
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (pageToken) params.push(`pageToken=${encodeURIComponent(pageToken)}`);
    if (limit) params.push(`limit=${encodeURIComponent(limit)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return api.get(`/email/inbox${qs}`);
};
export const getEmailById = (id) => api.get(`/email/message/${id}`);