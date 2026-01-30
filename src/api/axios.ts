import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global response handler: on 401 (except on login page), clear token and redirect to login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isLoginPage = currentPath.endsWith('/login');

        if (status === 401 && !isLoginPage) {
            try { localStorage.removeItem('token'); } catch (e) {}
            // Navigate to login page to prompt re-authentication
            if (typeof window !== 'undefined') {
                const base = import.meta.env.BASE_URL || '/';
                window.location.href = base + 'login';
            }
        }
        return Promise.reject(err);
    }
);

export default api;