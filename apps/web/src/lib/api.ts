import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor: handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint - body not needed as refresh_token is in HttpOnly cookie
                await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });

                // Retry original request (same-origin cookies will be included)
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    },
);

export default api;
