import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

export default function LoadingScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.logo}>
                <Text style={styles.logoText}>ر</Text>
            </View>
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 80, height: 80,
        borderRadius: 24,
        backgroundColor: theme.colors.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    logoText: { fontSize: 36, fontWeight: '800', color: theme.colors.background },
});
