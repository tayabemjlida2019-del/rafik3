import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    containerClassName = '',
    ...props
}) => {
    return (
        <View className={`w-full mb-4 ${containerClassName}`}>
            {label && (
                <Text className="mb-2 text-sm font-medium text-gray-700 text-right">
                    {label}
                </Text>
            )}
            <View className="relative flex-row items-center">
                <TextInput
                    className={`h-12 w-full rounded-xl border bg-gray-50 px-4 text-right ${error ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                        } ${icon ? 'pr-12' : ''}`}
                    placeholderTextColor="#9ca3af"
                    {...props}
                />
                {icon && (
                    <View className="absolute left-4">
                        {icon}
                    </View>
                )}
            </View>
            {error && (
                <Text className="mt-1 text-xs text-red-500 text-right">{error}</Text>
            )}
        </View>
    );
};

export default Input;
