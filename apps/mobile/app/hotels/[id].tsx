import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, MapPin, Star, Wifi, Coffee, Wind, Shield } from 'lucide-react-native';
import api from '../../src/api/client';
import { Colors } from '../../src/constants/Theme';
import Button from '../../src/components/Button';

interface Hotel {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    city: string;
    images: { id: string, url: string }[];
    avgRating: number;
    type: string;
}

export default function HotelDetailScreen() {
    const { id } = useLocalSearchParams();
    const { t } = useTranslation();
    const router = useRouter();

    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHotelDetails = async () => {
            if (!id) return;
            try {
                const response = await api.get(`/listings/${id}`);
                setHotel(response.data);
            } catch (error) {
                console.error('Error fetching hotel details:', error);
                Alert.alert(t('error'), t('failed_to_load_details'));
                router.back();
            } finally {
                setIsLoading(false);
            }
        };
        fetchHotelDetails();
    }, [id]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!hotel) return null;

    const displayPrice = hotel.price || 0;
    const firstImage = hotel.images?.[0]?.url;

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Hero Image */}
            <View className="relative h-80 bg-gray-100">
                {firstImage ? (
                    <Image source={{ uri: firstImage }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="w-full h-full items-center justify-center">
                        <Text className="text-4xl">🏢</Text>
                    </View>
                )}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-12 left-6 w-10 h-10 bg-white/80 rounded-full items-center justify-center shadow-lg"
                >
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View className="px-6 py-8">
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1">
                        <Text className="text-2xl font-black text-gray-900 mb-2 text-right">{hotel.title}</Text>
                        <View className="flex-row items-center justify-end">
                            <Text className="text-gray-500 mr-1">{hotel.city || hotel.location}</Text>
                            <MapPin size={16} color="#9ca3af" />
                        </View>
                    </View>
                    <View className="flex-row items-center bg-amber-50 px-3 py-1.5 rounded-xl ml-4">
                        <Star size={18} color="#f59e0b" fill="#f59e0b" />
                        <Text className="text-amber-700 font-bold ml-1 text-base">{hotel.avgRating || '5.0'}</Text>
                    </View>
                </View>

                {/* Description */}
                <View className="mb-8">
                    <Text className="text-lg font-bold text-gray-900 mb-2 text-right">{t('about_this_hotel')}</Text>
                    <Text className="text-gray-600 leading-6 text-right">
                        {hotel.description}
                    </Text>
                </View>

                {/* Amenities (Hardcoded for MVP) */}
                <View className="mb-8">
                    <Text className="text-lg font-bold text-gray-900 mb-4 text-right">{t('amenities')}</Text>
                    <View className="flex-row flex-wrap justify-end">
                        <AmenityIcon icon={<Wifi size={20} color={Colors.primary} />} label={t('wifi')} />
                        <AmenityIcon icon={<Coffee size={20} color={Colors.primary} />} label={t('breakfast')} />
                        <AmenityIcon icon={<Wind size={20} color={Colors.primary} />} label={t('ac')} />
                        <AmenityIcon icon={<Shield size={20} color={Colors.primary} />} label={t('safe')} />
                    </View>
                </View>
            </View>

            {/* Sticky Bottom Bar */}
            <View className="border-t border-gray-100 px-6 py-6 flex-row items-center justify-between bg-white shadow-lg">
                <Button
                    title={t('book_now')}
                    onPress={() => router.push({
                        pathname: `/hotels/book/${hotel.id}`,
                        params: { title: hotel.title, price: displayPrice }
                    })}
                    className="flex-1 ml-6"
                />
                <View className="items-end">
                    <Text className="text-primary text-2xl font-black">{displayPrice}</Text>
                    <Text className="text-gray-500 text-xs font-bold">{t('night')} / دج</Text>
                </View>
            </View>
        </ScrollView>
    );
}

function AmenityIcon({ icon, label }: { icon: any, label: string }) {
    return (
        <View className="items-center justify-center p-4 bg-gray-50 rounded-2xl mr-4 mb-4 min-w-[80px]">
            <View className="mb-2 bg-white w-10 h-10 rounded-full items-center justify-center shadow-sm">
                {icon}
            </View>
            <Text className="text-gray-600 text-xs font-medium">{label}</Text>
        </View>
    );
}
