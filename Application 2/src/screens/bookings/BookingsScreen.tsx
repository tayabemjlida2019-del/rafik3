import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import api from '../../api/client';

const STATUS_COLORS: Record<string, string> = {
    PENDING: '#FF9800', CONFIRMED: '#4CAF50', COMPLETED: '#2196F3', CANCELLED: '#F44336', REJECTED: '#9E9E9E',
};

export default function BookingsScreen({ navigation }: any) {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/bookings');
            setBookings(data.data || data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            PENDING: t('pending'), CONFIRMED: t('confirmed'), COMPLETED: t('completed'), CANCELLED: t('cancelled'), REJECTED: t('rejected'),
        };
        return map[status] || status;
    };

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} tintColor={theme.colors.primary} />}>
            <Text style={styles.title}>📋 {t('myBookings')}</Text>

            {bookings.map((b: any) => (
                <TouchableOpacity key={b.id} style={styles.card} activeOpacity={0.85}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.listingName}>{b.listing?.title || 'خدمة'}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[b.status] || '#999') + '22' }]}>
                            <Text style={[styles.statusText, { color: STATUS_COLORS[b.status] || '#999' }]}>{getStatusLabel(b.status)}</Text>
                        </View>
                    </View>

                    <View style={styles.details}>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar" size={14} color={theme.colors.textMuted} />
                            <Text style={styles.detailText}>{new Date(b.checkIn || b.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="cash" size={14} color={theme.colors.primary} />
                            <Text style={[styles.detailText, { color: theme.colors.primary, fontWeight: '700' }]}>{b.totalPrice?.toLocaleString()} د.ج</Text>
                        </View>
                    </View>

                    {b.status === 'PENDING' && (
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                            Alert.alert(t('cancel'), '', [
                                { text: t('back'), style: 'cancel' },
                                {
                                    text: t('cancel'), style: 'destructive', onPress: async () => {
                                        try { await api.patch(`/bookings/${b.id}/cancel`, { reason: 'User cancelled' }); fetch(); } catch { }
                                    }
                                },
                            ]);
                        }}>
                            <Text style={styles.cancelText}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            ))}

            {bookings.length === 0 && !loading && (
                <View style={styles.empty}><Text style={styles.emptyIcon}>📦</Text><Text style={styles.emptyText}>{t('noBookings')}</Text></View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: 16, paddingTop: 60 },
    title: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.text, marginBottom: 20 },
    card: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: 16, marginBottom: 12, ...theme.shadow.sm },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    listingName: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text, flex: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.full },
    statusText: { fontSize: theme.fontSize.xs, fontWeight: '700' },
    details: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
    cancelBtn: { marginTop: 12, paddingVertical: 8, alignItems: 'center', backgroundColor: theme.colors.error + '15', borderRadius: theme.borderRadius.md },
    cancelText: { color: theme.colors.error, fontWeight: '700', fontSize: theme.fontSize.sm },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { color: theme.colors.textMuted, fontSize: theme.fontSize.md },
});
