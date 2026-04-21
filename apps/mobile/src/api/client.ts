import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Using http://10.0.2.2:3001 for Android Emulator or your machine's IP for real device
// We will use a more flexible approach if needed later.
// Keep this shape so `rafiq.ps1` can auto-rewrite it.
const BASE_URL = 'http://192.168.246.68:3001/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach access token
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
        config.headers = config.headers ?? {};
        // Axios v1 headers type can be tricky; normalize to plain object.
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: better error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            // Token refresh logic would go here
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
        }
        return Promise.reject(error);
    }
);

export default api;
