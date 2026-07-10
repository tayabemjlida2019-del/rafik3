import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import ListingCard from '../../components/ListingCard';
import api from '../../api/client';

interface ListingsScreenProps { navigation: any; type: string; title: string }

function ListingsScreen({ navigation, type, title }: ListingsScreenProps) {
    const { t } = useTranslation();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/listings', { params: { type } });
            setListings(data.data || data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} tintColor={theme.colors.primary} />}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.grid}>
                {listings.map((item: any) => (
                    <ListingCard key={item.id} id={item.id} title={item.title}
                        price={item.pricePerNight || item.pricePerTrip || 0}
                        image={item.photos?.[0]} rating={item.avgRating} city={item.city} type={item.type}
                        onPress={() => navigation.navigate('ListingDetail', { id: item.id })} />
                ))}
            </View>
            {listings.length === 0 && !loading && (
                <View style={styles.empty}><Text style={styles.emptyIcon}>🔍</Text><Text style={styles.emptyText}>{t('noResults')}</Text></View>
            )}
        </ScrollView>
    );
}

export const HotelsScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    return <ListingsScreen navigation={navigation} type="HOTEL" title={`🏨 ${t('hotels')}`} />;
};
export const HomesScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    return <ListingsScreen navigation={navigation} type="HOME" title={`🏠 ${t('homes')}`} />;
};
export const FoodScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    return <ListingsScreen navigation={navigation} type="RESTAURANT" title={`🍲 ${t('food')}`} />;
};
export const TaxiScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    return <ListingsScreen navigation={navigation} type="TAXI" title={`🚕 ${t('taxi')}`} />;
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: 16, paddingTop: 60 },
    title: { fontSize: theme.fontSize.xxl, fontWeight: '800', color: theme.colors.text, marginBottom: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { color: theme.colors.textMuted, fontSize: theme.fontSize.md },
});
