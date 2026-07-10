import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Building2, MapPin, Info } from 'lucide-react-native';
import api from '../../src/api/client';
import useAuthStore from '../../src/store/authStore';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import { Colors } from '../../src/constants/Theme';

export default function RegisterProviderScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [form, setForm] = useState({
        email: '',
        fullName: '',
        password: '',
        phone: '',
        businessName: '',
        businessType: 'HOTEL',
        city: '',
        wilaya: '',
        address: '',
        description: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!form.email || !form.fullName || !form.password || !form.businessName || !form.city || !form.wilaya) {
            Alert.alert(t('error'), t('please_fill_all_fields'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/register/provider', form);
            const { user, accessToken, refreshToken, provider } = response.data;
            await setAuth(user, accessToken, refreshToken, provider);
            Alert.alert(t('success'), t('registration_success'));
            router.replace('/(tabs)');
        } catch (error: any) {
            const message = error.response?.data?.message || t('registration_failed');
            Alert.alert(t('error'), message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="bg-primary pt-14 pb-8 px-6 rounded-b-[40px] shadow-lg">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-6">
                    <ChevronLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-white mb-2 text-right">{t('join_as_provider')}</Text>
                <Text className="text-white/80 text-right leading-6">{t('register_provider_desc')}</Text>
            </View>

            <View className="px-6 py-8">
                {/* Personal Info Section */}
                <View className="flex-row items-center justify-end mb-4 border-b border-gray-100 pb-2">
                    <Text className="text-lg font-bold text-gray-900 mr-2">{t('full_name')}</Text>
                    <Info size={18} color={Colors.primary} />
                </View>

                <Input
                    placeholder={t('full_name')}
                    value={form.fullName}
                    onChangeText={(val) => setForm({ ...form, fullName: val })}
                />
                <Input
                    placeholder={t('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={form.email}
                    onChangeText={(val) => setForm({ ...form, email: val })}
                />
                <Input
                    placeholder={t('password')}
                    secureTextEntry
                    value={form.password}
                    onChangeText={(val) => setForm({ ...form, password: val })}
                />
                <Input
                    placeholder={t('phone')}
                    keyboardType="phone-pad"
                    value={form.phone}
                    onChangeText={(val) => setForm({ ...form, phone: val })}
                />

                {/* Business Info Section */}
                <View className="flex-row items-center justify-end mb-4 mt-8 border-b border-gray-100 pb-2">
                    <Text className="text-lg font-bold text-gray-900 mr-2">{t('business_name')}</Text>
                    <Building2 size={18} color={Colors.primary} />
                </View>

                <Input
                    placeholder={t('business_name')}
                    value={form.businessName}
                    onChangeText={(val) => setForm({ ...form, businessName: val })}
                />

                <Text className="text-gray-700 font-medium mb-3 text-right">{t('business_type')}</Text>
                <View className="flex-row flex-wrap justify-end mb-4">
                    <TypeOption
                        selected={form.businessType === 'HOTEL'}
                        onPress={() => setForm({ ...form, businessType: 'HOTEL' })}
                        label={t('type_hotel')}
                    />
                    <TypeOption
                        selected={form.businessType === 'HOME'}
                        onPress={() => setForm({ ...form, businessType: 'HOME' })}
                        label={t('type_home')}
                    />
                    <TypeOption
                        selected={form.businessType === 'RESTAURANT'}
                        onPress={() => setForm({ ...form, businessType: 'RESTAURANT' })}
                        label={t('type_restaurant')}
                    />
                    <TypeOption
                        selected={form.businessType === 'TAXI'}
                        onPress={() => setForm({ ...form, businessType: 'TAXI' })}
                        label={t('type_taxi')}
                    />
                </View>

                <View className="flex-row items-center justify-end mb-4 mt-6 border-b border-gray-100 pb-2">
                    <Text className="text-lg font-bold text-gray-900 mr-2">{t('city')}</Text>
                    <MapPin size={18} color={Colors.primary} />
                </View>

                <View className="flex-row">
                    <Input
                        placeholder={t('wilaya')}
                        containerClassName="flex-1 mr-4"
                        value={form.wilaya}
                        onChangeText={(val) => setForm({ ...form, wilaya: val })}
                    />
                    <Input
                        placeholder={t('city')}
                        containerClassName="flex-1"
                        value={form.city}
                        onChangeText={(val) => setForm({ ...form, city: val })}
                    />
                </View>

                <Input
                    placeholder={t('address')}
                    value={form.address}
                    onChangeText={(val) => setForm({ ...form, address: val })}
                />

                <Input
                    placeholder={t('description')}
                    multiline
                    numberOfLines={4}
                    value={form.description}
                    onChangeText={(val) => setForm({ ...form, description: val })}
                    containerClassName="h-32"
                    textAlignVertical="top"
                />

                <Button
                    title={t('register')}
                    onPress={handleRegister}
                    isLoading={isLoading}
                    className="mt-6"
                />

                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 items-center"
                >
                    <Text className="text-gray-500">{t('already_have_account')} <Text className="text-primary font-bold">{t('login')}</Text></Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

function TypeOption({ selected, onPress, label }: { selected: boolean, onPress: () => void, label: string }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`px-4 py-2 rounded-xl mb-3 ml-2 border ${selected ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
        >
            <Text className={`font-medium ${selected ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
        </TouchableOpacity>
    );
}
