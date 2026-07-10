import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../../../src/api/client';
import { Colors } from '../../../src/constants/Theme';

export default function ProviderBookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data?.data ?? res.data);
      } catch {
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-gray-400">تعذر تحميل تفاصيل الحجز</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text className="text-xl font-black text-gray-900 mb-4 text-right">تفاصيل الحجز</Text>

      <View className="bg-gray-50 p-4 rounded-2xl mb-3">
        <Text className="text-gray-500 text-xs text-right mb-1">العميل</Text>
        <Text className="text-gray-900 font-bold text-right">{booking.user?.fullName ?? '—'}</Text>
      </View>

      <View className="bg-gray-50 p-4 rounded-2xl mb-3">
        <Text className="text-gray-500 text-xs text-right mb-1">الخدمة</Text>
        <Text className="text-gray-900 font-bold text-right">{booking.listing?.title ?? '—'}</Text>
      </View>

      <View className="bg-gray-50 p-4 rounded-2xl mb-3">
        <Text className="text-gray-500 text-xs text-right mb-1">الحالة</Text>
        <Text className="text-gray-900 font-bold text-right">{booking.status ?? '—'}</Text>
      </View>

      <View className="bg-gray-50 p-4 rounded-2xl mb-3">
        <Text className="text-gray-500 text-xs text-right mb-1">المبلغ</Text>
        <Text className="text-primary font-black text-right">{booking.totalAmount ?? '—'} DA</Text>
      </View>
    </ScrollView>
  );
}

