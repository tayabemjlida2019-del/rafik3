import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import api from '../../src/api/client';
import { Calendar, MapPin, ChevronLeft } from 'lucide-react-native';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#10b981',
  COMPLETED: '#3b82f6',
  CANCELLED_BY_USER: '#ef4444',
  CANCELLED_BY_PROVIDER: '#ef4444',
};

const STATUS_AR: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED_BY_USER: 'ملغي من قبلك',
  CANCELLED_BY_PROVIDER: 'ملغي من المزود',
};

export default function BookingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings/user');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBookings} colors={['#10b981']} />}
    >
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <TouchableOpacity
            key={booking.id}
            activeOpacity={0.8}
            className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-gray-100"
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 items-end">
                <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={1}>
                  {booking.listing?.title}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-gray-400 text-xs">{booking.listing?.city}</Text>
                  <MapPin size={12} color="#9ca3af" />
                </View>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${STATUS_COLORS[booking.status] || '#9ca3af'}20` }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: STATUS_COLORS[booking.status] || '#9ca3af' }}
                >
                  {STATUS_AR[booking.status] || booking.status}
                </Text>
              </View>
            </View>

            <View className="border-t border-b border-gray-50 py-4 flex-row justify-between mb-4">
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-[10px] mb-1">المبلغ الإجمالي</Text>
                <Text className="text-primary font-bold">{booking.totalPrice} دج</Text>
              </View>
              <View className="w-[1px] bg-gray-50" />
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-[10px] mb-1">تاريخ الحجز</Text>
                <Text className="text-gray-900 font-bold text-xs">
                  {new Date(booking.checkIn).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-gray-400 text-[10px]">الرقم المرجعي: {booking.reference}</Text>
              <TouchableOpacity className="bg-gray-50 px-4 py-2 rounded-xl">
                <Text className="text-gray-600 font-bold text-xs">عرض التفاصيل</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      ) : !loading ? (
        <View className="py-20 items-center">
          <Text className="text-6xl mb-4">📅</Text>
          <Text className="text-gray-900 font-bold text-lg mb-2">{t('no_bookings_yet')}</Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-2xl mt-4"
            onPress={() => router.push('/(tabs)')}
          >
            <Text className="text-white font-bold">استكشف الخدمات</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}
