import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../../src/api/client';
import { Colors } from '../../../src/constants/Theme';

export default function ProviderBookingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/provider');
      setBookings(res.data?.data ?? res.data ?? []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBookings} colors={[Colors.primary]} />}
    >
      <Text className="text-xl font-black text-gray-900 mb-4 text-right">حجوزات العملاء</Text>

      {bookings.length === 0 ? (
        <View className="bg-white p-8 rounded-2xl items-center border border-gray-100">
          <Text className="text-gray-400">لا توجد حجوزات حالياً</Text>
        </View>
      ) : (
        bookings.map((b) => (
          <TouchableOpacity
            key={b.id}
            className="bg-white p-4 rounded-2xl mb-3 border border-gray-100"
            onPress={() => router.push({ pathname: '/provider/bookings/[id]' as any, params: { id: String(b.id) } } as any)}
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-primary font-bold">{(b.totalAmount ?? 0).toLocaleString?.() ?? b.totalAmount ?? '—'} DA</Text>
              <View className="items-end flex-1 ml-3">
                <Text className="text-gray-900 font-bold text-right" numberOfLines={1}>
                  {b.listing?.title ?? 'حجز'}
                </Text>
                <Text className="text-gray-500 text-xs text-right" numberOfLines={1}>
                  {b.user?.fullName ?? 'عميل'} • {b.status ?? '—'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

