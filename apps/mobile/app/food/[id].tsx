import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import api from '../../src/api/client';
import { ChevronLeft, ShoppingBag, Plus, Minus, Star, MapPin, Clock, Share2, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams();
    const { t } = useTranslation();
    const router = useRouter();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
            if (response.data?.[0]) {
                setActiveCategory(response.data[0].id);
            }
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

    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

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
                '🎉 تم إرسال طلبك!',
                'سيتم البدء في تحضير طعامك قريباً.',
                [{ text: 'حسناً', onPress: () => router.replace('/(tabs)/two') }]
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
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="text-gray-400 text-xs font-bold mt-4">جاري تحميل قائمة المطعم...</Text>
            </View>
        );
    }

    const rating = restaurant?.avgRating || 4.5;
    const images = restaurant?.images || [];

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: totalItems > 0 ? 160 : 80 }}>
                {/* Hero Image */}
                <View className="relative h-72 bg-gray-100">
                    {images[0]?.url ? (
                        <Image source={{ uri: images[0].url }} style={{ width, height: 288 }} resizeMode="cover" />
                    ) : (
                        <View style={{ width, height: 288 }} className="items-center justify-center bg-orange-50">
                            <Text className="text-6xl opacity-30">🍲</Text>
                        </View>
                    )}

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
                            <TouchableOpacity className="w-10 h-10 bg-white/90 rounded-2xl items-center justify-center shadow-md">
                                <Heart size={18} color="#111" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Restaurant Info Card */}
                <View className="bg-white -mt-8 rounded-t-[32px] px-6 pt-6 pb-4 shadow-lg" style={{ elevation: 3 }}>
                    {/* Badges */}
                    <View className="flex-row flex-wrap gap-2 mb-3">
                        <View className="bg-orange-50 px-3 py-1 rounded-lg border border-orange-200">
                            <Text className="text-orange-700 text-[10px] font-bold">🍽️ مطعم متميز</Text>
                        </View>
                        <View className="flex-row items-center bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
                            <Text className="text-emerald-700 text-[10px] font-bold">مفتوح الآن</Text>
                        </View>
                    </View>

                    {/* Title & Rating */}
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-row items-center bg-white rounded-xl px-2 py-1.5 border border-gray-100">
                            <View className="w-8 h-8 bg-orange-500 rounded-md rounded-bl-none items-center justify-center mr-1.5">
                                <Text className="text-white font-black text-[10px]">{rating.toFixed(1)}</Text>
                            </View>
                            <View>
                                <Text className="text-gray-900 text-[10px] font-bold">{rating >= 4.5 ? 'ممتاز' : 'جيد'}</Text>
                                <Text className="text-gray-400 text-[8px]">{restaurant?.totalReviews || 0} تقييم</Text>
                            </View>
                        </View>
                        <Text className="text-2xl font-black text-gray-900 text-right flex-1 mr-3">{restaurant?.title}</Text>
                    </View>

                    {/* Info Strip */}
                    <View className="flex-row items-center gap-4 mb-4">
                        <View className="flex-row items-center gap-1">
                            <Text className="text-gray-400 text-xs">{restaurant?.city}</Text>
                            <MapPin size={12} color="#9ca3af" />
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Text className="text-gray-400 text-xs">10:00 - 23:00</Text>
                            <Clock size={12} color="#9ca3af" />
                        </View>
                    </View>

                    {/* Quick Info */}
                    <View className="flex-row gap-2.5">
                        <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center border border-gray-100">
                            <Text className="text-sm mb-0.5">🍽️</Text>
                            <Text className="text-gray-700 text-[9px] font-bold">{restaurant?.metadata?.cuisine || 'جزائري'}</Text>
                        </View>
                        <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center border border-gray-100">
                            <Text className="text-sm mb-0.5">🚗</Text>
                            <Text className="text-emerald-600 text-[9px] font-bold">توصيل متاح</Text>
                        </View>
                        <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center border border-gray-100">
                            <Text className="text-sm mb-0.5">⏱️</Text>
                            <Text className="text-gray-700 text-[9px] font-bold">20-35 دقيقة</Text>
                        </View>
                    </View>
                </View>

                {/* Category Tabs */}
                {menu.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mt-4"
                        contentContainerStyle={{ paddingHorizontal: 24 }}
                    >
                        {menu.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                onPress={() => setActiveCategory(category.id)}
                                className={`mr-2.5 px-5 py-2.5 rounded-xl ${activeCategory === category.id
                                    ? 'bg-orange-500'
                                    : 'bg-white border border-gray-100'
                                    }`}
                                style={activeCategory === category.id ? { elevation: 3, shadowColor: '#f97316' } : {}}
                            >
                                <Text className={`text-xs font-bold ${activeCategory === category.id ? 'text-white' : 'text-gray-500'}`}>
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Menu Items */}
                <View className="px-6 mt-5">
                    {menu
                        .filter(c => !activeCategory || c.id === activeCategory)
                        .map((category: any) => (
                            <View key={category.id} className="mb-6">
                                <Text className="text-base font-black text-gray-900 mb-4 text-right">
                                    {category.name}
                                </Text>
                                {category.items?.map((item: any) => {
                                    const qty = cart[item.id]?.quantity || 0;
                                    return (
                                        <View
                                            key={item.id}
                                            className={`flex-row items-center justify-between mb-3 p-4 rounded-2xl border ${qty > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}
                                            style={{ elevation: 1 }}
                                        >
                                            {/* Left Side — Quantity Controls */}
                                            <View className="flex-row items-center">
                                                {qty > 0 ? (
                                                    <View className="flex-row items-center bg-white rounded-xl px-1.5 py-1 border border-orange-200">
                                                        <TouchableOpacity
                                                            onPress={() => updateCart(item, -1)}
                                                            className="w-8 h-8 items-center justify-center"
                                                        >
                                                            <Minus size={14} color="#f97316" />
                                                        </TouchableOpacity>
                                                        <Text className="mx-2.5 font-black text-orange-600 text-sm">{qty}</Text>
                                                        <TouchableOpacity
                                                            onPress={() => updateCart(item, 1)}
                                                            className="w-8 h-8 items-center justify-center bg-orange-500 rounded-lg"
                                                        >
                                                            <Plus size={14} color="#fff" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : (
                                                    <TouchableOpacity
                                                        onPress={() => updateCart(item, 1)}
                                                        className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center border border-orange-200"
                                                    >
                                                        <Plus size={18} color="#f97316" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            {/* Right Side — Item Info */}
                                            <View className="flex-1 mr-4 items-end">
                                                <Text className="font-bold text-gray-900 mb-0.5 text-right">{item.name}</Text>
                                                <Text className="text-gray-400 text-[10px] mb-1 text-right" numberOfLines={1}>{item.description}</Text>
                                                <Text className="text-orange-600 font-black text-sm">{item.price?.toLocaleString()} دج</Text>
                                            </View>

                                            {/* Image Thumbnail */}
                                            {item.imageUrl && (
                                                <View className="w-16 h-16 rounded-xl overflow-hidden mr-3 bg-gray-100">
                                                    <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                </View>
            </ScrollView>

            {/* Bottom Cart Bar */}
            {totalItems > 0 && (
                <View
                    className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5"
                    style={{ elevation: 10, shadowColor: '#000' }}
                >
                    <TouchableOpacity
                        onPress={handlePlaceOrder}
                        disabled={isSubmitting}
                        className="bg-orange-500 h-14 rounded-2xl flex-row items-center justify-between px-6"
                        style={{ elevation: 4, shadowColor: '#f97316' }}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" className="flex-1" />
                        ) : (
                            <>
                                <View className="bg-white/20 px-3 py-1.5 rounded-lg">
                                    <Text className="text-white font-black">{calculateTotal()?.toLocaleString()} دج</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="bg-white/20 w-6 h-6 rounded-full items-center justify-center mr-2">
                                        <Text className="text-white font-black text-[10px]">{totalItems}</Text>
                                    </View>
                                    <Text className="text-white font-black text-base mr-2">إتمام الطلب</Text>
                                    <ShoppingBag size={20} color="white" />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                    <View className="flex-row items-center justify-center mt-2.5">
                        <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
                        <Text className="text-emerald-600 text-[9px] font-bold">طلب آمن وموثوق • توصيل مجاني</Text>
                    </View>
                </View>
            )}
        </View>
    );
}
