import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import api from '../../src/api/client';

export default function RegisterScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        const { fullName, email, password } = formData;
        if (!fullName || !email || !password) {
            Alert.alert(t('error'), t('please_fill_all_fields'));
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/register', {
                fullName,
                email,
                password,
                role: 'USER'
            });

            Alert.alert(t('success'), t('registration_success'), [
                { text: 'OK', onPress: () => router.replace('/login') }
            ]);
        } catch (error: any) {
            const message = error.response?.data?.message || t('registration_failed');
            Alert.alert(t('error'), message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white px-6 pt-16">
            <View className="items-center mb-8">
                <Text className="text-3xl font-bold text-primary">{t('register')}</Text>
                <Text className="text-gray-500 mt-2">{t('create_new_account')}</Text>
            </View>

            <View>
                <Input
                    label={t('full_name')}
                    placeholder="الاسم الكامل"
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                />
                <Input
                    label={t('email')}
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Input
                    label={t('password')}
                    placeholder="********"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry
                />

                <Button
                    title={t('register')}
                    onPress={handleRegister}
                    isLoading={isLoading}
                    className="mt-4"
                />

                <View className="flex-row justify-center mt-8 mb-10">
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text className="text-primary font-bold"> {t('login')}</Text>
                    </TouchableOpacity>
                    <Text className="text-gray-600">{t('already_have_account')}</Text>
                </View>
            </View>
        </ScrollView>
    );
}
