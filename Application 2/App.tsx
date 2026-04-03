import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/i18n';
import Navigation from './src/navigation';
import LoadingScreen from './src/components/LoadingScreen';
import { useAuthStore } from './src/stores/auth.store';
import { useAppStore } from './src/stores/app.store';

export default function App() {
    const isLoading = useAuthStore((s) => s.isLoading);
    const loadUser = useAuthStore((s) => s.loadUser);
    const loadLanguage = useAppStore((s) => s.loadLanguage);

    useEffect(() => {
        loadUser();
        loadLanguage();
    }, []);

    if (isLoading) return <LoadingScreen />;

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <Navigation />
        </SafeAreaProvider>
    );
}
