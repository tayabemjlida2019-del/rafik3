import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    variant?: 'primary' | 'outline' | 'ghost';
    style?: ViewStyle;
    disabled?: boolean;
}

export default function Button({ title, onPress, loading, variant = 'primary', style, disabled }: ButtonProps) {
    if (variant === 'primary') {
        return (
            <TouchableOpacity onPress={onPress} disabled={loading || disabled} style={style} activeOpacity={0.8}>
                <LinearGradient
                    colors={['#C6A75E', '#E2B65B', '#D4A843']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.btn, (loading || disabled) && styles.disabled]}
                >
                    {loading ? <ActivityIndicator color="#1A1A2E" /> : <Text style={styles.btnText}>{title}</Text>}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading || disabled}
            style={[styles.btn, variant === 'outline' ? styles.outlineBtn : styles.ghostBtn, style]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={theme.colors.primary} />
            ) : (
                <Text style={[styles.btnText, variant === 'outline' ? styles.outlineText : styles.ghostText]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        fontSize: theme.fontSize.md,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    disabled: { opacity: 0.6 },
    outlineBtn: {
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        backgroundColor: 'transparent',
    },
    outlineText: { color: theme.colors.primary },
    ghostBtn: { backgroundColor: 'transparent' },
    ghostText: { color: theme.colors.primary },
});
