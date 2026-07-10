import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'accent';
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    isLoading = false,
    disabled = false,
    className = '',
    icon,
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'secondary':
                return 'bg-gray-900';
            case 'outline':
                return 'bg-transparent border-2 border-primary';
            case 'danger':
                return 'bg-red-500';
            case 'accent':
                return 'bg-accent';
            default:
                return 'bg-primary';
        }
    };

    const getTextClasses = () => {
        switch (variant) {
            case 'outline':
                return 'text-primary';
            default:
                return 'text-white';
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={disabled || isLoading}
            onPress={onPress}
            className={`h-14 w-full flex-row items-center justify-center rounded-2xl px-6 ${getVariantClasses()} ${disabled ? 'opacity-40' : ''} ${className}`}
            style={!disabled ? { elevation: 3, shadowColor: variant === 'accent' ? '#C6A75E' : '#003580' } : {}}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' ? '#003580' : 'white'} />
            ) : (
                <View className="flex-row items-center gap-2">
                    {icon}
                    <Text className={`text-base font-black ${getTextClasses()}`}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default Button;
