import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import api from '../../src/api/client';
import { ChevronLeft, ShoppingBag, Plus, Minus, Star } from 'lucide-react-native';
import Button from '../../src/components/Button';

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams();
    const { t } = useTranslation();
    const router = useRouter();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDetails();
            fetchMenu();
        }
    }, [id]);

    const fetchDetails = async () => {
        try {
            const response = await api.get(`/listings/${id}`);
            setRestaurant(response.data);
        } catch (error) {
            console.error('Failed to fetch restaurant details:', error);
        }
    };

    const fetchMenu = async () => {
        try {
            const response = await api.get(`/food/menu/${id}`);
            setMenu(response.data);
        } catch (error) {
            console.error('Failed to fetch menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateCart = (item: any, delta: number) => {
        setCart(prev => {
            const newCart = { ...prev };
            const currentQty = newCart[item.id]?.quantity || 0;
            const newQty = Math.max(0, currentQty + delta);

            if (newQty === 0) {
                delete newCart[item.id];
            } else {
                newCart[item.id] = { ...item, quantity: newQty };
            }
            return newCart;
        });
    };

    const calculateTotal = () => {
        return Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handlePlaceOrder = async () => {
        const total = calculateTotal();
        if (total === 0) return;

        setIsSubmitting(true);
        try {
            await api.post('/bookings', {
                listingId: id,
                checkIn: new Date().toISOString(),
                checkOut: new Date().toISOString(),
                guests: 1,
                metadata: {
                    type: 'FOOD_ORDER',
                    items: Object.values(cart),
                    totalPrice: total,
                },
                paymentMethod: 'CASH',
            });

            Alert.alert(
                t('success'),
                'تم إرسال طلبك بنجاح! سيتم البدء في تحضير طعامك قريباً.',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/two') }]
            );
        } catch (error) {
            Alert.alert(t('error'), 'فشل إرسال الطلب، يرجى المحاولة مرة أخرى');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 150 }}>
                {/* Header Image */}
                <View className="relative h-64 bg-gray-100">
                    {restaurant?.images?.[0]?.url && (
                        <Image source={{ uri: restaurant.images[0].url }} className="w-full h-full" />
                    )}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-6 w-10 h-10 bg-white/80 rounded-full items-center justify-center shadow-lg"
                    >
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Restaurant Info */}
                <View className="px-6 py-6 bg-white -mt-8 rounded-t-[40px] shadow-xl">
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-2xl font-black text-gray-900 text-right flex-1">{restaurant?.title}</Text>
                        <View className="flex-row items-center bg-amber-50 px-3 py-1.5 rounded-xl ml-4">
                            <Star size={16} color="#f59e0b" fill="#f59e0b" />
                            <Text className="text-amber-700 font-bold ml-1">{restaurant?.avgRating || '4.5'}</Text>
                        </View>
                    </View>
                    <Text className="text-gray-500 text-right mb-6">{restaurant?.description}</Text>

                    {/* Menu Items */}
                    {menu.map((category: any) => (
                        <View key={category.id} className="mb-8">
                            <Text className="text-lg font-bold text-gray-900 mb-4 text-right border-b border-gray-50 pb-2">
                                {category.name}
                            </Text>
                            {category.items?.map((item: any) => (
                                <View key={item.id} className="flex-row items-center justify-between mb-6">
                                    <View className="flex-row items-center">
                                        {cart[item.id] ? (
                                            <View className="flex-row items-center bg-emerald-50 rounded-xl px-2 py-1">
                                                <TouchableOpacity
                                                    onPress={() => updateCart(item, -1)}
                                                    className="w-8 h-8 items-center justify-center"
                                                >
                                                    <Minus size={16} color="#059669" />
                                                </TouchableOpacity>
                                                <Text className="mx-3 font-bold text-emerald-900">{cart[item.id].quantity}</Text>
                                                <TouchableOpacity
                                                    onPress={() => updateCart(item, 1)}
                                                    className="w-8 h-8 items-center justify-center"
                                                >
                                                    <Plus size={16} color="#059669" />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => updateCart(item, 1)}
                                                className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center"
                                            >
                                                <Plus size={20} color="#059669" />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <View className="flex-1 ml-4 items-end">
                                        <Text className="font-bold text-gray-900 mb-1">{item.name}</Text>
                                        <Text className="text-gray-400 text-xs mb-1 text-right" numberOfLines={1}>{item.description}</Text>
                                        <Text className="text-primary font-black">{item.price} دج</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Cart Summary & Checkout */}
            {calculateTotal() > 0 && (
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 shadow-2xl">
                    <TouchableOpacity
                        onPress={handlePlaceOrder}
                        disabled={isSubmitting}
                        className="bg-primary h-14 rounded-2xl flex-row items-center justify-between px-6"
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" className="flex-1" />
                        ) : (
                            <>
                                <View className="bg-white/20 px-3 py-1 rounded-lg">
                                    <Text className="text-white font-black">{calculateTotal()} دج</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-white font-bold ml-3 text-lg">إتمام الطلب</Text>
                                    <ShoppingBag size={24} color="white" />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
