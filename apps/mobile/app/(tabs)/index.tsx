import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import api from '../../src/api/client';
import useAuthStore from '../../src/store/authStore';
import CategoryItem from '../../src/components/CategoryItem';
import ListingCard from '../../src/components/ListingCard';

const categories = [
  { id: 'all', title: 'الكل', icon: '🌟', type: 'ALL' },
  { id: 'hotel', title: 'فنادق', icon: '🏨', type: 'HOTEL' },
  { id: 'home', title: 'شقق', icon: '🏠', type: 'HOME' },
  { id: 'food', title: 'مطاعم', icon: '🍕', type: 'RESTAURANT' },
  { id: 'taxi', title: 'تاكسي', icon: '🚕', type: 'TAXI' },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchListings();
  }, [activeCategory]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = activeCategory !== 'all' ? { type: activeCategory.toUpperCase() } : {};
      const response = await api.get('/listings', { params });
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchListings} colors={["#10b981"]} />}
    >
      {/* Header */}
      <View className="px-6 pt-16 pb-6 bg-primary/5">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            className="w-12 h-12 rounded-full border border-gray-100 items-center justify-center bg-white"
            onPress={() => router.push('/notifications')}
          >
            <Text className="text-2xl">🔔</Text>
            {/* Unread badge would go here */}
          </TouchableOpacity>
          <View className="items-end">
            <Text className="text-gray-500 text-sm font-medium">{t('welcome')}</Text>
            <Text className="text-2xl font-black text-gray-900">{user?.fullName || 'ضيف الرفيق'}</Text>
          </View>
        </View>

        {/* Hero Card */}
        <View className="bg-emerald-600 rounded-3xl p-6 shadow-xl shadow-emerald-500/30">
          <Text className="text-white text-lg font-bold mb-1">اكتشف أفضل الخدمات</Text>
          <Text className="text-emerald-100 text-xs mb-4">كل ما تحتاجه في مكان واحد بكل أمان</Text>
          <TouchableOpacity className="bg-white self-start px-4 py-2 rounded-xl">
            <Text className="text-emerald-600 font-bold text-xs">احجز الآن</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View className="mt-8">
        <Text className="text-lg font-bold text-gray-900 px-6 mb-4">الفئات</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              title={cat.title}
              icon={cat.icon}
              isActive={activeCategory === cat.id}
              onPress={() => setActiveCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Listings Section */}
      <View className="mt-8 px-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-bold text-gray-900">أحدث العروض</Text>
          <TouchableOpacity>
            <Text className="text-primary text-sm font-bold">عرض الكل</Text>
          </TouchableOpacity>
        </View>

        {listings.length > 0 ? (
          listings.map((item) => (
            <ListingCard
              key={item.id}
              title={item.title}
              city={item.city}
              price={item.basePrice || item.price}
              rating={item.avgRating}
              type={item.type}
              imageUrl={item.images?.[0]?.url}
              onPress={() => {
                if (item.type === 'HOTEL' || item.type === 'HOME') {
                  router.push(`/hotels/${item.id}`);
                } else if (item.type === 'TAXI') {
                  router.push(`/taxi`);
                }
              }}
            />
          ))
        ) : !loading ? (
          <View className="py-20 items-center">
            <Text className="text-4xl mb-4">🔍</Text>
            <Text className="text-gray-400 font-medium">{t('no_hotels_found')}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
