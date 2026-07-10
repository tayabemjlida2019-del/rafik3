import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import api from '../../src/api/client';
import useAuthStore from '../../src/store/authStore';

export default function LoginScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('error'), t('please_fill_all_fields'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, accessToken, refreshToken } = response.data;

            await setAuth(user, accessToken, refreshToken);
            router.replace('/(tabs)');
        } catch (error: any) {
            const message = error.response?.data?.message || t('login_failed');
            Alert.alert(t('error'), message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white px-6 pt-20">
            <View className="items-center mb-10">
                <Text className="text-3xl font-bold text-primary">{t('welcome')}</Text>
                <Text className="text-gray-500 mt-2">{t('login_to_continue')}</Text>
            </View>

            <View>
                <Input
                    label={t('email')}
                    placeholder="example@mail.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Input
                    label={t('password')}
                    placeholder="********"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity className="self-start mb-6">
                    <Text className="text-primary font-medium">{t('forgot_password')}</Text>
                </TouchableOpacity>

                <Button
                    title={t('login')}
                    onPress={handleLogin}
                    isLoading={isLoading}
                />

                <View className="flex-row justify-center mt-8">
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                        <Text className="text-primary font-bold"> {t('register_now')}</Text>
                    </TouchableOpacity>
                    <Text className="text-gray-600">{t('dont_have_account')}</Text>
                </View>

                <View className="mt-12 pt-8 border-t border-gray-100 items-center">
                    <Text className="text-gray-400 mb-4">{t('become_provider')}</Text>
                    <Button
                        title={t('join_as_provider')}
                        variant="outline"
                        onPress={() => router.push('/(auth)/register-provider')}
                    />
                </View>
            </View>
        </ScrollView>
    );
}
