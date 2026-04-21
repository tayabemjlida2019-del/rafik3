import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapPin, Heart, Star } from 'lucide-react-native';

interface ListingCardProps {
    title: string;
    city: string;
    price: number;
    rating: number;
    imageUrl?: string;
    type: string;
    onPress: () => void;
    isFeatured?: boolean;
}

const typeLabels: Record<string, string> = {
    HOTEL: 'فندق',
    HOME: 'إقامة',
    RESTAURANT: 'مطعم',
    TAXI: 'تاكسي',
};

const typeEmoji: Record<string, string> = {
    HOTEL: '🏨',
    HOME: '🏠',
    RESTAURANT: '🍽️',
    TAXI: '🚕',
};

const ListingCard: React.FC<ListingCardProps> = ({
    title,
    city,
    price,
    rating,
    imageUrl,
    type,
    onPress,
    isFeatured,
}) => {
    const { t } = useTranslation();

    const ratingLabel = (r: number) => {
        if (r >= 4.5) return 'ممتاز';
        if (r >= 4) return 'رائع';
        if (r >= 3) return 'جيد';
        return 'مقبول';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className="bg-white rounded-3xl overflow-hidden mb-5 shadow-md border border-gray-100"
            style={{ elevation: 3 }}
        >
            <View className="relative h-52 w-full bg-gray-100">
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="w-full h-full items-center justify-center bg-gray-50">
                        <Text className="text-5xl opacity-30">{typeEmoji[type] || '🏢'}</Text>
                    </View>
                )}

                {/* Top Badges Row */}
                <View className="absolute top-3 left-3 right-3 flex-row justify-between items-start">
                    {/* Rating Badge — Booking style */}
                    <View className="flex-row items-center bg-white/95 rounded-xl px-2.5 py-1.5 shadow-sm">
                        <View className="w-7 h-7 bg-primary rounded-md rounded-bl-none items-center justify-center mr-1.5">
                            <Text className="text-white font-black text-[10px]">{(rating || 4.5).toFixed(1)}</Text>
                        </View>
                        <Text className="text-gray-700 text-[10px] font-bold">{ratingLabel(rating || 4.5)}</Text>
                    </View>

                    {/* Favorite Button */}
                    <TouchableOpacity className="w-9 h-9 bg-white/90 rounded-full items-center justify-center shadow-sm">
                        <Heart size={18} color="#9ca3af" />
                    </TouchableOpacity>
                </View>

                {/* Type Badge — Bottom Left */}
                <View className="absolute bottom-3 left-3">
                    <View className="flex-row items-center bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1">
                        <Text className="text-white text-[10px] font-bold">{typeLabels[type] || type}</Text>
                    </View>
                </View>

                {/* Featured Badge */}
                {isFeatured && (
                    <View className="absolute bottom-3 right-3 bg-accent/90 rounded-lg px-2.5 py-1">
                        <Text className="text-white text-[10px] font-bold">⭐ مميز</Text>
                    </View>
                )}
            </View>

            <View className="p-4">
                <Text className="text-base font-black text-gray-900 mb-1 text-right" numberOfLines={1}>
                    {title}
                </Text>
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <Text className="text-primary font-black text-lg">{price?.toLocaleString()}</Text>
                        <Text className="text-gray-400 text-[10px] font-medium mr-1">
                            {type === 'RESTAURANT' ? 'دج' : 'دج/ليلة'}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Text className="text-gray-400 text-xs font-medium">{city}</Text>
                        <MapPin size={12} color="#9ca3af" />
                    </View>
                </View>

                {/* Trust Signal */}
                <View className="flex-row items-center mt-3 bg-emerald-50 rounded-lg px-2.5 py-1.5 self-start">
                    <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
                    <Text className="text-emerald-700 text-[10px] font-bold">
                        {type === 'RESTAURANT' ? 'توصيل مجاني' : 'إلغاء مجاني'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ListingCard;
