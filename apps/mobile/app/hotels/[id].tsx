import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, MapPin, Star, Wifi, Coffee, Wind, Shield, Heart, Share2, Clock, Users } from 'lucide-react-native';
import api from '../../src/api/client';
import Button from '../../src/components/Button';

const { width } = Dimensions.get('window');

interface Hotel {
    id: string;
    title: string;
    description: string;
    basePrice: number;
    price: number;
    location: string;
    city: string;
    address: string;
    images: { id: string, url: string }[];
    avgRating: number;
    totalReviews: number;
    type: string;
    isFeatured: boolean;
    metadata: any;
    provider: any;
}

const amenityConfig: Record<string, { icon: any; label: string }> = {
    wifi: { icon: (c: string) => <Wifi size={18} color={c} />, label: 'واي فاي' },
    breakfast: { icon: (c: string) => <Coffee size={18} color={c} />, label: 'إفطار' },
    air_conditioning: { icon: (c: string) => <Wind size={18} color={c} />, label: 'تكييف' },
    pool: { icon: () => <Text className="text-base">🏊</Text>, label: 'مسبح' },
    parking: { icon: () => <Text className="text-base">🅿️</Text>, label: 'مواقف' },
    gym: { icon: () => <Text className="text-base">💪</Text>, label: 'رياضة' },
    spa: { icon: () => <Text className="text-base">🧖</Text>, label: 'سبا' },
    restaurant: { icon: () => <Text className="text-base">🍴</Text>, label: 'مطعم' },
    room_service: { icon: () => <Text className="text-base">🛌</Text>, label: 'خدمة غرف' },
};

export default function HotelDetailScreen() {
    const { id } = useLocalSearchParams();
    const { t } = useTranslation();
    const router = useRouter();

    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

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
                <ActivityIndicator size="large" color="#003580" />
                <Text className="text-gray-400 text-xs font-bold mt-4">جاري تحميل التفاصيل...</Text>
            </View>
        );
    }

    if (!hotel) return null;

    const displayPrice = hotel.basePrice || hotel.price || 0;
    const rating = hotel.avgRating || 4.5;
    const reviews = hotel.totalReviews || 0;
    const images = hotel.images || [];

    const ratingLabel = (r: number) => {
        if (r >= 4.5) return 'ممتاز';
        if (r >= 4) return 'رائع جداً';
        if (r >= 3) return 'جيد';
        return 'مقبول';
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Hero Image Carousel */}
                <View className="relative h-80 bg-gray-100">
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setActiveImageIndex(index);
                        }}
                    >
                        {images.length > 0 ? images.map((img, i) => (
                            <Image
                                key={img.id || i}
                                source={{ uri: img.url }}
                                style={{ width, height: 320 }}
                                resizeMode="cover"
                            />
                        )) : (
                            <View style={{ width, height: 320 }} className="items-center justify-center bg-gray-50">
                                <Text className="text-6xl opacity-20">🏨</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Top Actions */}
                    <View className="absolute top-12 left-5 right-5 flex-row justify-between">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-white/90 rounded-2xl items-center justify-center shadow-md"
                        >
                            <ChevronLeft size={22} color="#111" />
                        </TouchableOpacity>
                        <View className="flex-row gap-2.5">
                            <TouchableOpacity className="w-10 h-10 bg-white/90 rounded-2xl items-center justify-center shadow-md">
                                <Share2 size={18} color="#111" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsFavorite(!isFavorite)}
                                className="w-10 h-10 bg-white/90 rounded-2xl items-center justify-center shadow-md"
                            >
                                <Heart size={18} color={isFavorite ? '#ef4444' : '#111'} fill={isFavorite ? '#ef4444' : 'none'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Image Indicators */}
                    {images.length > 1 && (
                        <View className="absolute bottom-4 flex-row self-center gap-1.5">
                            {images.map((_, i) => (
                                <View
                                    key={i}
                                    className={`h-1 rounded-full ${i === activeImageIndex ? 'bg-white w-6' : 'bg-white/40 w-1.5'}`}
                                />
                            ))}
                        </View>
                    )}

                    {/* Image Count */}
                    <View className="absolute bottom-4 left-4 bg-black/60 rounded-lg px-2.5 py-1">
                        <Text className="text-white text-[10px] font-bold">{activeImageIndex + 1}/{images.length || 1}</Text>
                    </View>
                </View>

                {/* Content */}
                <View className="px-6 pt-6">
                    {/* Badges */}
                    <View className="flex-row flex-wrap gap-2 mb-3">
                        <View className="bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                            <Text className="text-primary text-[10px] font-bold">🏨 {hotel.metadata?.type || 'فندق'}</Text>
                        </View>
                        {hotel.isFeatured && (
                            <View className="bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                                <Text className="text-amber-700 text-[10px] font-bold">⭐ مميز</Text>
                            </View>
                        )}
                        <View className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                            <Text className="text-emerald-700 text-[10px] font-bold">إلغاء مجاني</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text className="text-2xl font-black text-gray-900 mb-3 text-right">{hotel.title}</Text>

                    {/* Rating + Location Row */}
                    <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center gap-1.5">
                            <Text className="text-gray-400 text-xs font-medium">{hotel.city || hotel.location}</Text>
                            <MapPin size={14} color="#9ca3af" />
                        </View>
                        <View className="flex-row items-center bg-white rounded-xl px-2.5 py-1.5 border border-gray-100">
                            <View className="w-8 h-8 bg-primary rounded-md rounded-bl-none items-center justify-center mr-2">
                                <Text className="text-white font-black text-[11px]">{rating.toFixed(1)}</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-gray-900 text-xs font-bold">{ratingLabel(rating)}</Text>
                                <Text className="text-gray-400 text-[9px]">{reviews} تقييم</Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Info Chips */}
                    <View className="flex-row flex-wrap gap-2.5 mb-8">
                        <View className="flex-row items-center bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100">
                            <Text className="text-xs font-bold text-gray-700 mr-1.5">{hotel.metadata?.rooms || 1} غرفة</Text>
                            <Text className="text-sm">🛏️</Text>
                        </View>
                        <View className="flex-row items-center bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100">
                            <Text className="text-xs font-bold text-gray-700 mr-1.5">حتى {hotel.metadata?.maxGuests || 4} ضيوف</Text>
                            <Users size={14} color="#374151" />
                        </View>
                        <View className="flex-row items-center bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100">
                            <Text className="text-xs font-bold text-gray-700 mr-1.5">{hotel.metadata?.area || '40'} م²</Text>
                            <Text className="text-sm">📐</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="mb-8">
                        <Text className="text-base font-black text-gray-900 mb-3 text-right">تفاصيل الإقامة</Text>
                        <Text className="text-gray-500 leading-6 text-right text-sm">{hotel.description}</Text>
                    </View>

                    {/* Amenities */}
                    <View className="mb-8">
                        <Text className="text-base font-black text-gray-900 mb-4 text-right">المرافق والخدمات</Text>
                        <View className="flex-row flex-wrap gap-3 justify-end">
                            {(hotel.metadata?.amenities || ['wifi', 'breakfast', 'air_conditioning', 'parking']).map((a: string) => {
                                const config = amenityConfig[a];
                                return (
                                    <View key={a} className="items-center bg-gray-50 rounded-2xl p-3.5 border border-gray-100" style={{ minWidth: 75 }}>
                                        <View className="w-9 h-9 bg-white rounded-xl items-center justify-center shadow-sm mb-1.5">
                                            {config ? (typeof config.icon === 'function' ? config.icon('#003580') : config.icon) : <Text className="text-sm">💎</Text>}
                                        </View>
                                        <Text className="text-gray-600 text-[10px] font-bold">{config?.label || a}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* House Rules */}
                    <View className="mb-8">
                        <Text className="text-base font-black text-gray-900 mb-4 text-right">قواعد الإقامة</Text>
                        <View className="flex-row gap-3">
                            <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center border border-gray-100">
                                <Clock size={18} color="#003580" />
                                <Text className="text-[9px] font-bold text-gray-400 uppercase mt-1.5 mb-0.5">الوصول</Text>
                                <Text className="text-gray-900 font-bold text-xs">بعد 14:00</Text>
                            </View>
                            <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center border border-gray-100">
                                <Clock size={18} color="#003580" />
                                <Text className="text-[9px] font-bold text-gray-400 uppercase mt-1.5 mb-0.5">المغادرة</Text>
                                <Text className="text-gray-900 font-bold text-xs">قبل 12:00</Text>
                            </View>
                            <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center border border-gray-100">
                                <Text className="text-base">🚭</Text>
                                <Text className="text-[9px] font-bold text-gray-400 uppercase mt-1.5 mb-0.5">التدخين</Text>
                                <Text className="text-gray-900 font-bold text-xs">غير مسموح</Text>
                            </View>
                        </View>
                    </View>

                    {/* Provider Card */}
                    {hotel.provider && (
                        <View className="bg-primary/5 rounded-3xl p-5 border border-primary/10">
                            <View className="flex-row items-center justify-end">
                                <View className="items-end flex-1 mr-4">
                                    <View className="flex-row items-center bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mb-1.5">
                                        <Text className="text-emerald-700 text-[9px] font-bold">شريك موثق ✅</Text>
                                    </View>
                                    <Text className="text-gray-900 font-black text-base">{hotel.provider.businessName}</Text>
                                </View>
                                <View className="w-14 h-14 bg-primary/10 rounded-2xl items-center justify-center border border-primary/20">
                                    <Text className="text-primary font-black text-xl">{hotel.provider.businessName?.[0] || 'ر'}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Booking Bar */}
            <View
                className="border-t border-gray-100 px-6 py-4 flex-row items-center justify-between bg-white"
                style={{ elevation: 8, shadowColor: '#000' }}
            >
                <Button
                    title="احجز الآن"
                    onPress={() => router.push({
                        pathname: '/hotels/book/[id]',
                        params: { id: hotel.id, title: hotel.title, price: String(displayPrice) }
                    })}
                    className="flex-1 mr-4"
                />
                <View className="items-end">
                    <Text className="text-primary text-xl font-black">{displayPrice?.toLocaleString()}</Text>
                    <Text className="text-gray-400 text-[10px] font-bold">دج / ليلة</Text>
                </View>
            </View>
        </View>
    );
}
