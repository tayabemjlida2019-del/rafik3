import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Star, ChevronLeft } from 'lucide-react-native';
import api from '../../src/api/client';
import { Colors } from '../../src/constants/Theme';
import Input from '../../src/components/Input';

interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    basePrice: number;
    location: string;
    city: string;
    images: { id: string, url: string }[];
    avgRating: number;
    type: string;
}

export default function ListingHomeScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const [listings, setListings] = useState<Listing[]>([]);
    const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchListings = async () => {
        try {
            const response = await api.get('/listings?type=HOTEL');
            setListings(response.data);
            setFilteredListings(response.data);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query) {
            setFilteredListings(listings);
            return;
        }
        const lowerQuery = query.toLowerCase();
        const filtered = listings.filter(h =>
            h.title.toLowerCase().includes(lowerQuery) ||
            h.city.toLowerCase().includes(lowerQuery) ||
            h.location.toLowerCase().includes(lowerQuery)
        );
        setFilteredListings(filtered);
    };

    const renderItem = ({ item }: { item: Listing }) => {
        const firstImage = item.images?.[0]?.url;
        const displayPrice = item.basePrice || item.price || 0;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                className="mb-8 bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100"
                onPress={() => router.push(`/hotels/${item.id}`)}
            >
                <View className="relative h-52 bg-gray-100">
                    {firstImage ? (
                        <Image
                            source={{ uri: firstImage }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center">
                            <Text className="text-4xl">🏨</Text>
                        </View>
                    )}
                    <View className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm">
                        <Star size={14} color="#f59e0b" fill="#f59e0b" />
                        <Text className="text-gray-900 font-bold text-xs">{item.avgRating || '5.0'}</Text>
                    </View>
                </View>

                <View className="p-6">
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-xl font-bold text-gray-900 text-right flex-1" numberOfLines={1}>
                            {item.title}
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-end mb-4">
                        <Text className="text-gray-500 text-sm mr-1">{item.city || item.location}</Text>
                        <MapPin size={14} color="#9ca3af" />
                    </View>

                    <View className="flex-row justify-between items-center pt-4 border-t border-gray-50">
                        <View className="flex-row items-baseline">
                            <Text className="text-primary text-2xl font-black">{displayPrice}</Text>
                            <Text className="text-gray-400 text-xs font-bold ml-1">دج / {t('night')}</Text>
                        </View>
                        <TouchableOpacity
                            className="bg-primary px-6 py-2.5 rounded-xl"
                            onPress={() => router.push(`/hotels/${item.id}`)}
                        >
                            <Text className="text-white font-bold text-sm">{t('book_now')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 pt-14 pb-4 border-b border-gray-50">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-xl font-black text-gray-900">{t('hotels')}</Text>
                    <View className="w-10" />
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-1">
                    <Search size={20} color="#9ca3af" />
                    <Input
                        placeholder={t('search_hotels')}
                        className="flex-1 text-right h-12 bg-transparent border-0 px-2"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        containerClassName="mb-0 flex-1 ml-2"
                    />
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            ) : (
                <FlatList
                    data={filteredListings}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={() => {
                            setIsRefreshing(true);
                            fetchListings();
                        }} colors={['#10b981']} />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className="text-gray-400 text-lg font-medium">{t('no_hotels_found')}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
