import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ListingCardProps {
    id: string;
    title: string;
    price: number;
    image?: string;
    rating?: number;
    city?: string;
    type: string;
    onPress: () => void;
}

export default function ListingCard({ title, price, image, rating, city, type, onPress }: ListingCardProps) {
    const typeIcons: Record<string, string> = {
        HOTEL: '🏨', HOME: '🏠', RESTAURANT: '🍲', TAXI: '🚕',
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.imageWrap}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>{typeIcons[type] || '🏠'}</Text>
                    </View>
                )}
                {rating && (
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                    </View>
                )}
            </View>
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {city && <Text style={styles.city}>{city}</Text>}
                <Text style={styles.price}>{price.toLocaleString()} <Text style={styles.priceUnit}>د.ج</Text></Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        marginBottom: 16,
        ...theme.shadow.md,
    },
    imageWrap: { height: 120, position: 'relative' },
    image: { width: '100%', height: '100%' },
    placeholder: {
        width: '100%', height: '100%',
        backgroundColor: theme.colors.surfaceLight,
        alignItems: 'center', justifyContent: 'center',
    },
    placeholderText: { fontSize: 40 },
    ratingBadge: {
        position: 'absolute', top: 8, right: 8,
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: theme.borderRadius.full,
    },
    ratingText: { color: '#FFD700', fontSize: 11, fontWeight: '700' },
    info: { padding: 10 },
    title: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.text },
    city: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted, marginTop: 2 },
    price: { fontSize: theme.fontSize.md, fontWeight: '800', color: theme.colors.primary, marginTop: 6 },
    priceUnit: { fontSize: theme.fontSize.xs, fontWeight: '400' },
});
