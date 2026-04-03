import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import Button from '../../components/Button';
import api from '../../api/client';
import { useAuthStore } from '../../stores/auth.store';

export default function ListingDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { t } = useTranslation();
    const isAuth = useAuthStore((s) => s.isAuthenticated);
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/listings/${id}`);
                setListing(data);
            } catch { }
            setLoading(false);
        })();
    }, [id]);

    if (loading) return <View style={styles.loadingWrap}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
    if (!listing) return <View style={styles.loadingWrap}><Text style={styles.errorText}>{t('error')}</Text></View>;

    const typeIcons: Record<string, string> = { HOTEL: '🏨', HOME: '🏠', RESTAURANT: '🍲', TAXI: '🚕' };

    return (
        <ScrollView style={styles.container}>
            {/* Image */}
            <View style={styles.imageWrap}>
                {listing.photos?.[0] ? (
                    <Image source={{ uri: listing.photos[0] }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}><Text style={{ fontSize: 60 }}>{typeIcons[listing.type] || '🏠'}</Text></View>
                )}
            </View>

            <View style={styles.content}>
                {/* Title & Rating */}
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{listing.title}</Text>
                    {listing.avgRating > 0 && (
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.ratingText}>{listing.avgRating?.toFixed(1)}</Text>
                        </View>
                    )}
                </View>

                {/* Location */}
                <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color={theme.colors.primary} />
                    <Text style={styles.infoText}>{listing.city}, {listing.wilaya}</Text>
                </View>

                {/* Price */}
                <View style={styles.priceCard}>
                    <Text style={styles.priceLabel}>{listing.type === 'TAXI' ? t('pricePerTrip') : t('pricePerNight')}</Text>
                    <Text style={styles.price}>{(listing.pricePerNight || listing.pricePerTrip || 0).toLocaleString()} د.ج</Text>
                </View>

                {/* Description */}
                {listing.description && (
                    <View style={styles.descSection}>
                        <Text style={styles.sectionTitle}>{t('description')}</Text>
                        <Text style={styles.descText}>{listing.description}</Text>
                    </View>
                )}

                {/* Book Button */}
                <Button
                    title={isAuth ? t('bookNow') : t('login')}
                    onPress={() => {
                        if (!isAuth) { navigation.navigate('Login'); return; }
                        // Navigate to booking flow
                        navigation.navigate('Bookings');
                    }}
                    style={{ marginTop: 24 }}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    loadingWrap: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' },
    errorText: { color: theme.colors.error, fontSize: theme.fontSize.md },
    imageWrap: { height: 280 },
    image: { width: '100%', height: '100%' },
    placeholder: { width: '100%', height: '100%', backgroundColor: theme.colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
    content: { padding: 20 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.text, flex: 1, marginRight: 12 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.borderRadius.full },
    ratingText: { color: '#FFD700', fontWeight: '700', fontSize: theme.fontSize.sm },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    infoText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
    priceCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: 16, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primary + '33' },
    priceLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
    price: { fontSize: theme.fontSize.xl, fontWeight: '800', color: theme.colors.primary },
    descSection: { marginTop: 20 },
    sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
    descText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, lineHeight: 24 },
});
