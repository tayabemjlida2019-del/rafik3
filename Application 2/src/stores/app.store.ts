import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

interface AppState {
    language: string;
    setLanguage: (lang: string) => Promise<void>;
    loadLanguage: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
    language: 'ar',

    setLanguage: async (lang) => {
        await AsyncStorage.setItem('language', lang);
        i18n.changeLanguage(lang);
        set({ language: lang });
    },

    loadLanguage: async () => {
        const lang = await AsyncStorage.getItem('language');
        if (lang) {
            i18n.changeLanguage(lang);
            set({ language: lang });
        }
    },
}));
