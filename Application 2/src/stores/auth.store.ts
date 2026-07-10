import { create } from 'zustand';
import api from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    role: string;
    avatarUrl?: string;
}

interface Provider {
    id: string;
    businessName: string;
    kycStatus: string;
    avgRating: number;
}

interface AuthState {
    user: User | null;
    provider: Provider | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    registerUser: (data: { email: string; fullName: string; password: string; phone?: string }) => Promise<void>;
    registerProvider: (data: {
        email: string; fullName: string; password: string; phone?: string;
        businessName: string; businessType: string; city: string; wilaya: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    provider: null,
    isLoading: true,
    isAuthenticated: false,

    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        set({ user: data.user, provider: data.provider, isAuthenticated: true });
    },

    registerUser: async (userData) => {
        const { data } = await api.post('/auth/register/user', userData);
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        set({ user: data.user, isAuthenticated: true });
    },

    registerProvider: async (providerData) => {
        const { data } = await api.post('/auth/register/provider', providerData);
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        set({ user: data.user, provider: data.provider, isAuthenticated: true });
    },

    logout: async () => {
        try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) await api.post('/auth/logout', { refreshToken });
        } catch { }
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        set({ user: null, provider: null, isAuthenticated: false });
    },

    loadUser: async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) { set({ isLoading: false }); return; }
            const { data } = await api.get('/auth/me');
            set({ user: data.user, provider: data.provider, isAuthenticated: true, isLoading: false });
        } catch {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
            set({ isLoading: false, isAuthenticated: false });
        }
    },
}));
