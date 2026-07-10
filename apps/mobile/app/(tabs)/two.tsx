import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import api from '../../src/api/client';
import { MapPin, Calendar, ChevronLeft } from 'lucide-react-native';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  PENDING: { color: '#f59e0b', bg: '#fef3c7', label: 'قيد الانتظار', icon: '⏳' },
  CONFIRMED: { color: '#003580', bg: '#dbeafe', label: 'مؤكد', icon: '✅' },
  COMPLETED: { color: '#10b981', bg: '#d1fae5', label: 'مكتمل', icon: '🎉' },
  CANCELLED_BY_USER: { color: '#ef4444', bg: '#fee2e2', label: 'ملغي من قبلك', icon: '❌' },
  CANCELLED_BY_PROVIDER: { color: '#ef4444', bg: '#fee2e2', label: 'ملغي من المزود', icon: '❌' },
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
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBookings} colors={['#003580']} />}
    >
      {/* Stats Bar */}
      {bookings.length > 0 && (
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-primary/5 rounded-2xl p-4 items-center border border-primary/10">
            <Text className="text-2xl font-black text-primary">{bookings.length}</Text>
            <Text className="text-gray-500 text-[10px] font-bold mt-0.5">إجمالي الحجوزات</Text>
          </View>
          <View className="flex-1 bg-emerald-50 rounded-2xl p-4 items-center border border-emerald-100">
            <Text className="text-2xl font-black text-emerald-600">{bookings.filter(b => b.status === 'CONFIRMED').length}</Text>
            <Text className="text-gray-500 text-[10px] font-bold mt-0.5">مؤكدة</Text>
          </View>
          <View className="flex-1 bg-amber-50 rounded-2xl p-4 items-center border border-amber-100">
            <Text className="text-2xl font-black text-amber-600">{bookings.filter(b => b.status === 'PENDING').length}</Text>
            <Text className="text-gray-500 text-[10px] font-bold mt-0.5">قيد الانتظار</Text>
          </View>
        </View>
      )}

      {bookings.length > 0 ? (
        bookings.map((booking) => {
          const config = STATUS_CONFIG[booking.status] || { color: '#9ca3af', bg: '#f3f4f6', label: booking.status, icon: '📋' };
          return (
            <TouchableOpacity
              key={booking.id}
              activeOpacity={0.85}
              className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
              style={{ elevation: 2 }}
            >
              {/* Header */}
              <View className="flex-row justify-between items-start mb-4">
                <View
                  className="flex-row items-center px-3 py-1.5 rounded-xl"
                  style={{ backgroundColor: config.bg }}
                >
                  <Text className="text-xs mr-1">{config.icon}</Text>
                  <Text className="text-xs font-bold" style={{ color: config.color }}>
                    {config.label}
                  </Text>
                </View>
                <View className="flex-1 items-end mr-3">
                  <Text className="text-base font-black text-gray-900 mb-0.5" numberOfLines={1}>
                    {booking.listing?.title}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-gray-400 text-xs">{booking.listing?.city}</Text>
                    <MapPin size={10} color="#9ca3af" />
                  </View>
                </View>
              </View>

              {/* Info Row */}
              <View className="bg-gray-50 rounded-2xl p-4 flex-row justify-between mb-4">
                <View className="items-center flex-1">
                  <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-1">المبلغ</Text>
                  <Text className="text-primary font-black text-base">{booking.totalPrice?.toLocaleString()} دج</Text>
                </View>
                <View className="w-[1px] bg-gray-200" />
                <View className="items-center flex-1">
                  <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-1">التاريخ</Text>
                  <Text className="text-gray-900 font-bold text-xs">
                    {new Date(booking.checkIn).toLocaleDateString('ar-DZ')}
                  </Text>
                </View>
                <View className="w-[1px] bg-gray-200" />
                <View className="items-center flex-1">
                  <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-1">الدفع</Text>
                  <Text className="text-gray-900 font-bold text-xs">
                    {booking.paymentMethod === 'CASH' ? 'نقداً' : 'إلكتروني'}
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View className="flex-row items-center justify-between">
                <TouchableOpacity className="bg-primary/5 px-4 py-2.5 rounded-xl flex-row items-center border border-primary/10">
                  <Text className="text-primary font-bold text-xs">عرض التفاصيل</Text>
                </TouchableOpacity>
                <Text className="text-gray-300 text-[9px] font-medium">#{booking.reference}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      ) : !loading ? (
        <View className="py-24 items-center bg-white rounded-3xl border border-gray-100 mt-4" style={{ elevation: 1 }}>
          <View className="w-20 h-20 bg-primary/5 rounded-3xl items-center justify-center mb-5">
            <Text className="text-4xl">📅</Text>
          </View>
          <Text className="text-gray-900 font-black text-lg mb-2">{t('no_bookings_yet')}</Text>
          <Text className="text-gray-400 text-xs mb-6">لم تقم بأي حجوزات بعد</Text>
          <TouchableOpacity
            className="bg-primary px-8 py-3.5 rounded-2xl"
            style={{ elevation: 3, shadowColor: '#003580' }}
            onPress={() => router.push('/(tabs)')}
          >
            <Text className="text-white font-black text-sm">استكشف الخدمات</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}
