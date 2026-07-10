import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import ListingCard from '../../components/ListingCard';
import api from '../../api/client';
import { useAuthStore } from '../../stores/auth.store';

const CATEGORIES = [
    { key: 'HOTEL', icon: '🏨', color: '#4A90D9' },
    { key: 'HOME', icon: '🏠', color: '#50C878' },
    { key: 'RESTAURANT', icon: '🍲', color: '#FF6B6B' },
    { key: 'TAXI', icon: '🚕', color: '#FFD700' },
];

export default function HomeScreen({ navigation }: any) {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/listings');
            setListings(data.data || data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchListings(); }, []);

    const navigateCategory = (type: string) => {
        const screens: Record<string, string> = {
            HOTEL: 'Hotels', HOME: 'Homes', RESTAURANT: 'Food', TAXI: 'Taxi',
        };
        navigation.navigate(screens[type] || 'Hotels');
    };

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchListings} tintColor={theme.colors.primary} />}>
            {/* Hero */}
            <LinearGradient colors={['#1A1A2E', '#0F0F1A']} style={styles.hero}>
                <View style={styles.heroTop}>
                    <View>
                        <Text style={styles.greeting}>{user ? `👋 ${user.fullName}` : t('welcome')}</Text>
                        <Text style={styles.heroSubtitle}>{t('subtitle')}</Text>
                    </View>
                    <LinearGradient colors={['#C6A75E', '#E2B65B']} style={styles.logoBadge}>
                        <Text style={styles.logoBadgeText}>ر</Text>
                    </LinearGradient>
                </View>

                {/* Search Bar */}
                <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
                    <Ionicons name="search" size={20} color={theme.colors.textMuted} />
                    <Text style={styles.searchText}>{t('search')}</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* Categories */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('allServices')}</Text>
                <View style={styles.categories}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat.key} style={styles.catCard} onPress={() => navigateCategory(cat.key)} activeOpacity={0.8}>
                            <View style={[styles.catIcon, { backgroundColor: cat.color + '22' }]}>
                                <Text style={styles.catEmoji}>{cat.icon}</Text>
                            </View>
                            <Text style={styles.catLabel}>{t(cat.key === 'HOTEL' ? 'hotels' : cat.key === 'HOME' ? 'homes' : cat.key === 'RESTAURANT' ? 'food' : 'taxi')}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Featured Listings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⭐ {t('featured')}</Text>
                <View style={styles.listingsGrid}>
                    {listings.slice(0, 6).map((item: any) => (
                        <ListingCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            price={item.pricePerNight || item.pricePerTrip || 0}
                            image={item.photos?.[0]}
                            rating={item.avgRating}
                            city={item.city}
                            type={item.type}
                            onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
                        />
                    ))}
                </View>
                {listings.length === 0 && !loading && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyText}>{t('noResults')}</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    hero: { padding: 24, paddingTop: 60, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontSize: theme.fontSize.xl, fontWeight: '800', color: theme.colors.text },
    heroSubtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 4 },
    logoBadge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    logoBadgeText: { fontSize: 24, fontWeight: '800', color: theme.colors.background },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: theme.colors.surfaceLight, borderRadius: theme.borderRadius.lg,
        paddingVertical: 14, paddingHorizontal: 16, marginTop: 20,
    },
    searchText: { color: theme.colors.textMuted, fontSize: theme.fontSize.md },
    section: { padding: 16, paddingTop: 24 },
    sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: '800', color: theme.colors.text, marginBottom: 16 },
    categories: { flexDirection: 'row', justifyContent: 'space-between' },
    catCard: { alignItems: 'center', flex: 1 },
    catIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    catEmoji: { fontSize: 28 },
    catLabel: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, fontWeight: '600' },
    listingsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { color: theme.colors.textMuted, fontSize: theme.fontSize.md },
});
