import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { useAuthStore } from '../../stores/auth.store';
import { useAppStore } from '../../stores/app.store';

export default function ProfileScreen({ navigation }: any) {
    const { t, i18n } = useTranslation();
    const { user, provider, logout } = useAuthStore();
    const { language, setLanguage } = useAppStore();

    const languages = [
        { code: 'ar', label: '🇩🇿 العربية', name: t('arabic') },
        { code: 'fr', label: '🇫🇷 Français', name: t('french') },
        { code: 'en', label: '🇬🇧 English', name: t('english') },
    ];

    const handleLogout = () => {
        Alert.alert(t('logout'), '', [
            { text: t('back'), style: 'cancel' },
            { text: t('logout'), style: 'destructive', onPress: () => logout() },
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <LinearGradient colors={['#1A1A2E', '#0F0F1A']} style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'ر'}</Text>
                </View>
                <Text style={styles.name}>{user?.fullName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                {provider && (
                    <View style={styles.providerBadge}>
                        <Ionicons name="briefcase" size={14} color={theme.colors.primary} />
                        <Text style={styles.providerText}>{provider.businessName}</Text>
                    </View>
                )}
            </LinearGradient>

            {/* Language Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌍 {t('language')}</Text>
                <View style={styles.langRow}>
                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[styles.langBtn, language === lang.code && styles.langBtnActive]}
                            onPress={() => setLanguage(lang.code)}
                        >
                            <Text style={styles.langLabel}>{lang.label}</Text>
                            {language === lang.code && <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.section}>
                <MenuItem icon="person" label={t('editProfile')} onPress={() => { }} />
                <MenuItem icon="notifications" label="Notifications" onPress={() => { }} />
                <MenuItem icon="help-circle" label="FAQ" onPress={() => { }} />
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out" size={20} color={theme.colors.error} />
                <Text style={styles.logoutText}>{t('logout')}</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={menuStyles.item} onPress={onPress} activeOpacity={0.7}>
            <View style={menuStyles.left}>
                <Ionicons name={icon as any} size={20} color={theme.colors.textSecondary} />
                <Text style={menuStyles.label}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
    );
}

const menuStyles = StyleSheet.create({
    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    label: { color: theme.colors.text, fontSize: theme.fontSize.md },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: 24, paddingTop: 70, alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 32, fontWeight: '800', color: theme.colors.background },
    name: { fontSize: theme.fontSize.xl, fontWeight: '800', color: theme.colors.text, marginTop: 12 },
    email: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 4 },
    providerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.primary + '22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full, marginTop: 10 },
    providerText: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: '600' },
    section: { padding: 16 },
    sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
    langRow: { gap: 8 },
    langBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.card, paddingVertical: 14, paddingHorizontal: 16, borderRadius: theme.borderRadius.md, marginBottom: 8 },
    langBtnActive: { borderWidth: 1, borderColor: theme.colors.primary },
    langLabel: { color: theme.colors.text, fontSize: theme.fontSize.md },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 8, paddingVertical: 14, backgroundColor: theme.colors.error + '15', borderRadius: theme.borderRadius.lg },
    logoutText: { color: theme.colors.error, fontWeight: '700', fontSize: theme.fontSize.md },
});
