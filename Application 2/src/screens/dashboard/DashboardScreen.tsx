import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import api from '../../api/client';
import Button from '../../components/Button';

export default function DashboardScreen({ navigation }: any) {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState<any[]>([]);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = async () => {
        setLoading(true);
        try {
            const [bRes, lRes] = await Promise.all([
                api.get('/bookings/provider').catch(() => ({ data: [] })),
                api.get('/listings/provider/my-listings').catch(() => ({ data: [] })),
            ]);
            setBookings(bRes.data?.data || bRes.data || []);
            setListings(lRes.data?.data || lRes.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} tintColor={theme.colors.primary} />}>
            <Text style={styles.title}>📊 {t('dashboard')}</Text>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statNum}>{listings.length}</Text>
                    <Text style={styles.statLabel}>{t('myListings')}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNum}>{bookings.filter((b: any) => b.status === 'PENDING').length}</Text>
                    <Text style={styles.statLabel}>{t('pending')}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNum}>{bookings.filter((b: any) => b.status === 'CONFIRMED').length}</Text>
                    <Text style={styles.statLabel}>{t('confirmed')}</Text>
                </View>
            </View>

            {/* Incoming Bookings */}
            <Text style={styles.sectionTitle}>{t('incomingBookings')}</Text>
            {bookings.slice(0, 5).map((b: any) => (
                <View key={b.id} style={styles.bookingCard}>
                    <View style={styles.bookingHeader}>
                        <Text style={styles.bookingName}>{b.user?.fullName || 'عميل'}</Text>
                        <Text style={[styles.bookingStatus, { color: b.status === 'PENDING' ? '#FF9800' : '#4CAF50' }]}>{b.status}</Text>
                    </View>
                    <Text style={styles.bookingListing}>{b.listing?.title}</Text>
                    {b.status === 'PENDING' && (
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.confirmBtn} onPress={async () => {
                                try { await api.patch(`/bookings/${b.id}/confirm`); fetch(); } catch { }
                            }}>
                                <Text style={styles.confirmText}>✓ {t('confirm')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectBtn} onPress={async () => {
                                try { await api.patch(`/bookings/${b.id}/reject`); fetch(); } catch { }
                            }}>
                                <Text style={styles.rejectText}>✕ {t('reject')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            ))}

            {/* My Listings */}
            <Text style={styles.sectionTitle}>{t('myListings')}</Text>
            {listings.map((l: any) => (
                <View key={l.id} style={styles.listingItem}>
                    <Text style={styles.listingTitle}>{l.title}</Text>
                    <Text style={styles.listingPrice}>{(l.pricePerNight || l.pricePerTrip || 0).toLocaleString()} د.ج</Text>
                </View>
            ))}

            {bookings.length === 0 && listings.length === 0 && !loading && (
                <View style={styles.empty}><Text style={styles.emptyText}>{t('noResults')}</Text></View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: 16, paddingTop: 60 },
    title: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.text, marginBottom: 20 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 16, alignItems: 'center' },
    statNum: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.primary },
    statLabel: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 4 },
    sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text, marginBottom: 12, marginTop: 8 },
    bookingCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: 14, marginBottom: 10 },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    bookingName: { color: theme.colors.text, fontWeight: '700', fontSize: theme.fontSize.md },
    bookingStatus: { fontSize: theme.fontSize.xs, fontWeight: '700' },
    bookingListing: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm, marginTop: 4 },
    actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    confirmBtn: { flex: 1, backgroundColor: '#4CAF5022', paddingVertical: 8, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
    confirmText: { color: '#4CAF50', fontWeight: '700', fontSize: theme.fontSize.sm },
    rejectBtn: { flex: 1, backgroundColor: '#F4433622', paddingVertical: 8, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
    rejectText: { color: '#F44336', fontWeight: '700', fontSize: theme.fontSize.sm },
    listingItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: 14, marginBottom: 8 },
    listingTitle: { color: theme.colors.text, fontWeight: '600', fontSize: theme.fontSize.md },
    listingPrice: { color: theme.colors.primary, fontWeight: '700' },
    empty: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { color: theme.colors.textMuted },
});
