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
            activeOpacity={0.8}
            className={`mr-3 items-center justify-center px-5 py-3.5 rounded-2xl border ${isActive
                    ? 'bg-primary border-primary shadow-lg'
                    : 'bg-white border-gray-100'
                }`}
            style={isActive ? { elevation: 4, shadowColor: '#003580' } : { elevation: 1 }}
        >
            <Text className="text-xl mb-1">{icon}</Text>
            <Text
                className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default CategoryItem;
