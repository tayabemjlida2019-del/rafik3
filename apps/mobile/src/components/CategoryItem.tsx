import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CategoryItemProps {
    title: string;
    icon: string;
    isActive?: boolean;
    onPress: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
    title,
    icon,
    isActive,
    onPress,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`mr-4 items-center justify-center px-6 py-4 rounded-3xl border-2 transition-all ${isActive
                    ? 'bg-primary border-primary shadow-lg shadow-primary/20'
                    : 'bg-white border-gray-50'
                }`}
        >
            <Text className="text-2xl mb-1">{icon}</Text>
            <Text
                className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default CategoryItem;
