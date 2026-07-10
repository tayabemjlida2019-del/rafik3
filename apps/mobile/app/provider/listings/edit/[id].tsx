import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Camera, MapPin, Tag, Info } from 'lucide-react-native';
import api from '../../../../src/api/client';
import Button from '../../../../src/components/Button';
import Input from '../../../../src/components/Input';
import { Colors } from '../../../../src/constants/Theme';

export default function EditListingScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [form, setForm] = useState({
        title: '',
        description: '',
        basePrice: '',
        city: '',
        wilaya: '',
        address: '',
        type: 'HOTEL',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await api.get(`/listings/${id}`);
                const data = response.data;
                setForm({
                    title: data.title || '',
                    description: data.description || '',
                    basePrice: data.basePrice?.toString() || '',
                    city: data.city || '',
                    wilaya: data.wilaya || '',
                    address: data.address || '',
                    type: data.type || 'HOTEL',
                });
            } catch (error) {
                Alert.alert(t('error'), t('failed_to_load_details'));
                router.back();
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchListing();
    }, [id]);

    const handleSubmit = async () => {
        if (!form.title || !form.basePrice || !form.city || !form.wilaya) {
            Alert.alert(t('error'), t('please_fill_all_fields'));
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...form,
                basePrice: parseFloat(form.basePrice),
            };

            await api.patch(`/listings/${id}`, payload);
            Alert.alert(t('success'), t('listing_updated_success'));
            router.back();
        } catch (error: any) {
            const message = error.response?.data?.message || t('listing_failed_message');
            Alert.alert(t('error'), message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="bg-white px-6 pt-14 pb-4 shadow-sm flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">{t('edit_listing')}</Text>
                <View className="w-10" />
            </View>

            <View className="px-6 py-8">
                {/* Image Placeholder */}
                <TouchableOpacity className="w-full h-48 bg-gray-50 rounded-3xl items-center justify-center border-2 border-dashed border-gray-200 mb-8">
                    <Camera size={32} color="#9ca3af" />
                    <Text className="text-gray-400 mt-2 font-medium">{t('change_photos') || 'Change Photos'}</Text>
                </TouchableOpacity>

                <View className="flex-row items-center justify-end mb-4 border-b border-gray-100 pb-2">
                    <Text className="text-lg font-bold text-gray-900 mr-2">{t('listing_title')}</Text>
                    <Info size={18} color={Colors.primary} />
                </View>

                <Input
                    placeholder={t('listing_title')}
                    value={form.title}
                    onChangeText={(val) => setForm({ ...form, title: val })}
                />

                <Input
                    placeholder={t('listing_description')}
                    multiline
                    numberOfLines={4}
                    value={form.description}
                    onChangeText={(val) => setForm({ ...form, description: val })}
                    containerClassName="h-32"
                    textAlignVertical="top"
                />

                <View className="flex-row items-center justify-end mb-4 mt-6 border-b border-gray-100 pb-2">
                    <Text className="text-lg font-bold text-gray-900 mr-2">{t('base_price')}</Text>
                    <Tag size={18} color={Colors.primary} />
                </View>

                <Input
                    placeholder={`${t('base_price')} (DA)`}
                    keyboardType="numeric"
                    value={form.basePrice}
                    onChangeText={(val) => setForm({ ...form, basePrice: val })}
                />

                <View className="flex-row items-center justify-end mb-4 mt-6 border-b border-gray-100 pb-2">
                    <Text className="text-lg font-bold text-gray-900 mr-2">{t('location') || 'Location'}</Text>
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

                <Button
                    title={t('save_changes')}
                    onPress={handleSubmit}
                    isLoading={isSaving}
                    className="mt-8 mb-12"
                />
            </View>
        </ScrollView>
    );
}
