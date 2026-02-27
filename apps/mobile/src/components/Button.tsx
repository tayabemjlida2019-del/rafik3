import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    isLoading = false,
    disabled = false,
    className = '',
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'secondary':
                return 'bg-secondary';
            case 'outline':
                return 'bg-transparent border border-primary';
            case 'danger':
                return 'bg-error';
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
            activeOpacity={0.7}
            disabled={disabled || isLoading}
            onPress={onPress}
            className={`h-12 w-full flex-row items-center justify-center rounded-xl px-4 ${getVariantClasses()} ${disabled ? 'opacity-50' : ''} ${className}`}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' ? '#10b981' : 'white'} />
            ) : (
                <Text className={`text-base font-bold ${getTextClasses()}`}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

export default Button;
