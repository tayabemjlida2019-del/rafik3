import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Plus, Edit2, Trash2, Star, MapPin } from 'lucide-react-native';
import api from '../../../src/api/client';
import { Colors } from '../../../src/constants/Theme';

interface Listing {
    id: string;
    title: string;
    type: string;
    basePrice: number;
    status: string;
    images: { url: string }[];
    avgRating: number;
}

export default function MyListingsScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchListings = async () => {
        try {
            const response = await api.get('/listings/provider/my-listings');
            setListings(response.data);
        } catch (error) {
            console.error('Error fetching my listings:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleDelete = (id: string) => {
        Alert.alert(
            t('confirm_delete'),
            t('confirm_delete_listing_message'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/listings/${id}`);
                            setListings(listings.filter(l => l.id !== id));
                        } catch (error) {
                            Alert.alert(t('error'), t('delete_failed'));
                        }
                    }
                }
            ]
        );
    };

    const renderListingItem = ({ item }: { item: Listing }) => (
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row">
                <Image
                    source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/100' }}
                    className="w-24 h-24 rounded-xl"
                />
                <View className="flex-1 ml-4 items-end">
                    <View className="flex-row justify-between items-start w-full mb-1">
                        <View className="flex-row items-center">
                            <Star size={14} color={Colors.accent} fill={Colors.accent} />
                            <Text className="text-gray-500 text-xs ml-1">{item.avgRating.toFixed(1)}</Text>
                        </View>
                        <Text className="text-lg font-bold text-gray-900 text-right flex-1">{item.title}</Text>
                    </View>

                    <View className="flex-row items-center mb-2">
                        <Text className="text-gray-500 text-xs mr-1">{item.type}</Text>
                        <MapPin size={12} color="#9ca3af" />
                    </View>

                    <Text className="text-primary font-bold">{item.basePrice} DA/{t('night')}</Text>

                    <View className={`mt-2 px-2 py-1 rounded-lg bg-gray-50`}>
                        <Text className="text-xs font-bold text-gray-600 uppercase">{item.status}</Text>
                    </View>
                </View>
            </View>

            <View className="flex-row mt-4 pt-4 border-t border-gray-50">
                <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-2 rounded-xl bg-gray-50 mr-2"
                    onPress={() => router.push(`/provider/listings/edit/${item.id}`)}
                >
                    <Edit2 size={16} color="#4b5563" />
                    <Text className="ml-2 text-gray-600 font-bold">{t('edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-2 rounded-xl bg-rose-50"
                    onPress={() => handleDelete(item.id)}
                >
                    <Trash2 size={16} color="#e11d48" />
                    <Text className="ml-2 text-rose-600 font-bold">{t('delete')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-6 pt-14 pb-4 shadow-sm flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.push('/provider/dashboard')} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">{t('my_listings')}</Text>
                <TouchableOpacity
                    onPress={() => router.push('/provider/listings/new')}
                    className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center"
                >
                    <Plus size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={listings}
                    renderItem={renderListingItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={() => {
                            setIsRefreshing(true);
                            fetchListings();
                        }} colors={[Colors.primary]} />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className="text-gray-400 text-lg mb-6">{t('no_listings_yet')}</Text>
                            <TouchableOpacity
                                className="bg-primary px-8 py-3 rounded-2xl"
                                onPress={() => router.push('/provider/listings/new')}
                            >
                                <Text className="text-white font-bold">{t('add_listing')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
}
