import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Provider {
    id: string;
    businessName: string;
    businessType: 'HOTEL' | 'HOME' | 'RESTAURANT' | 'TAXI';
    city: string;
    wilaya: string;
    kycStatus: string;
    totalBookings: number;
    avgRating: number;
}

interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'USER' | 'PROVIDER' | 'ADMIN';
}

interface AuthState {
    user: User | null;
    provider: Provider | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string, provider?: Provider) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    provider: null,
    isAuthenticated: false,
    isLoading: true,
    setAuth: async (user, accessToken, refreshToken, provider) => {
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        if (provider) {
            await AsyncStorage.setItem('provider', JSON.stringify(provider));
        }
        set({ user, provider: provider || null, isAuthenticated: true, isLoading: false });
    },
    logout: async () => {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('provider');
        set({ user: null, provider: null, isAuthenticated: false, isLoading: false });
    },
    initialize: async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            const providerStr = await AsyncStorage.getItem('provider');
            const token = await AsyncStorage.getItem('accessToken');
            if (userStr && token) {
                set({
                    user: JSON.parse(userStr),
                    provider: providerStr ? JSON.parse(providerStr) : null,
                    isAuthenticated: true,
                    isLoading: false
                });
            } else {
                set({ user: null, provider: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            set({ user: null, provider: null, isAuthenticated: false, isLoading: false });
        }
    },
}));

export default useAuthStore;
