import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../theme';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, error && styles.inputError, style]}
                placeholderTextColor={theme.colors.textMuted}
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    label: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: 6, fontWeight: '600' },
    input: {
        backgroundColor: theme.colors.inputBg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
    inputError: { borderColor: theme.colors.error },
    error: { fontSize: theme.fontSize.xs, color: theme.colors.error, marginTop: 4 },
});
