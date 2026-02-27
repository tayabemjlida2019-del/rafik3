import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ListingCardProps {
    title: string;
    city: string;
    price: number;
    rating: number;
    imageUrl?: string;
    type: string;
    onPress: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
    title,
    city,
    price,
    rating,
    imageUrl,
    type,
    onPress,
}) => {
    const { t } = useTranslation();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="bg-white rounded-3xl overflow-hidden mb-6 shadow-sm border border-gray-100"
        >
            <View className="relative h-48 w-full bg-gray-100">
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} className="w-full h-full object-cover" />
                ) : (
                    <View className="w-full h-full items-center justify-center">
                        <Text className="text-4xl text-gray-300">🏢</Text>
                    </View>
                )}
                <View className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full flex-row items-center gap-1">
                    <Text className="text-amber-400">⭐</Text>
                    <Text className="text-xs font-bold">{rating || 0}</Text>
                </View>
            </View>

            <View className="p-4">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-lg font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>
                        {title}
                    </Text>
                    <Text className="text-primary font-black text-lg">
                        {price} <Text className="text-xs font-normal text-gray-400">دج</Text>
                    </Text>
                </View>

                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-1">
                        <Text className="text-gray-400 text-xs text-right">📍 {city}</Text>
                    </View>
                    <Text className="text-gray-400 text-xs">
                        {t(`type_${type.toLowerCase()}`)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ListingCard;
