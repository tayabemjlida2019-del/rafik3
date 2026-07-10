import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import api from '../../src/api/client';
import { ChevronLeft, Search, MapPin, Star } from 'lucide-react-native';
import Input from '../../src/components/Input';

export default function FoodListingScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const response = await api.get('/listings', { params: { type: 'RESTAURANT' } });
            setRestaurants(response.data);
        } catch (error) {
            console.error('Failed to fetch restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRestaurants = restaurants.filter(res =>
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View className="flex-1 bg-white">
            <View className="px-6 pt-14 pb-4 border-b border-gray-50 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-gray-900">المطاعم</Text>
                <View className="w-10" />
            </View>

            <View className="px-6 py-4">
                <Input
                    placeholder="ابحث عن مطعم، أكلة، أو مدينة..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    icon={<Search size={20} color="#9ca3af" />}
                    containerClassName="bg-gray-50 border-none rounded-2xl h-12"
                />
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRestaurants} colors={['#10b981']} />}
            >
                {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((res) => (
                        <TouchableOpacity
                            key={res.id}
                            onPress={() => router.push(`/food/${res.id}`)}
                            activeOpacity={0.9}
                            className="bg-white rounded-[32px] overflow-hidden mb-8 shadow-sm border border-gray-100"
                        >
                            <View className="relative h-48 bg-gray-100">
                                {res.images?.[0]?.url ? (
                                    <Image source={{ uri: res.images[0].url }} className="w-full h-full" />
                                ) : (
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-4xl text-gray-300">🍕</Text>
                                    </View>
                                )}
                                <View className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm">
                                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                    <Text className="text-xs font-black text-gray-900">{res.avgRating || '4.5'}</Text>
                                </View>
                            </View>

                            <View className="p-6">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-xl font-bold text-gray-900 flex-1 mr-2 text-right">
                                        {res.title}
                                    </Text>
                                    <View className="bg-emerald-50 px-2 py-1 rounded-lg">
                                        <Text className="text-emerald-600 font-bold text-[10px]">مفتوح الآن</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-end">
                                    <Text className="text-gray-400 text-xs text-right mr-1">{res.city}</Text>
                                    <MapPin size={12} color="#9ca3af" />
                                </View>

                                <View className="mt-4 pt-4 border-t border-gray-50 flex-row justify-between items-center">
                                    <Text className="text-gray-500 text-xs">مدة التوصيل: 30-45 دقيقة</Text>
                                    <Text className="text-primary font-black">قائمة الطعام 🍴</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : !loading ? (
                    <View className="py-20 items-center">
                        <Text className="text-4xl mb-4">🍽️</Text>
                        <Text className="text-gray-400 font-medium">لم يتم العثور على مطاعم تطابق بحثك</Text>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}
