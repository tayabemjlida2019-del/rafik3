import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import api from '../../src/api/client';
import useAuthStore from '../../src/store/authStore';
import CategoryItem from '../../src/components/CategoryItem';
import ListingCard from '../../src/components/ListingCard';
import { Search, Bell, MapPin, Shield, Clock, Headphones } from 'lucide-react-native';
import BrandLogo from '../../src/components/BrandLogo';

const categories = [
  { id: 'all', title: 'الكل', icon: '🌟', type: 'ALL' },
  { id: 'hotel', title: 'فنادق', icon: '🏨', type: 'HOTEL' },
  { id: 'home', title: 'شقق', icon: '🏠', type: 'HOME' },
  { id: 'food', title: 'مطاعم', icon: '🍕', type: 'RESTAURANT' },
  { id: 'taxi', title: 'تاكسي', icon: '🚕', type: 'TAXI' },
];

const trustSignals = [
  { icon: '🔒', text: 'احجز الآن، ادفع لاحقاً' },
  { icon: '❌', text: 'إلغاء مجاني' },
  { icon: '⭐', text: '+10K تقييم' },
  { icon: '📞', text: 'دعم 24/7' },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchListings();
  }, [activeCategory]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = activeCategory !== 'all' ? { type: activeCategory.toUpperCase() } : {};
      const response = await api.get('/listings', { params });
      if (response.data && Array.isArray(response.data)) {
        setListings(response.data);
      } else {
        console.warn('API returned non-array listings data:', response.data);
        setListings([]);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchListings} colors={["#003580"]} />}
    >
      {/* Hero Header */}
      <View className="px-6 pt-14 pb-8 bg-primary" style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        {/* Top Bar */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            className="w-11 h-11 rounded-2xl border border-white/20 items-center justify-center bg-white/10"
            onPress={() => router.push('/notifications')}
          >
            <Bell size={20} color="#fff" />
          </TouchableOpacity>
          <BrandLogo variant="full" size="default" />
        </View>

        <View className="mb-4">
          <Text className="text-white/60 text-xs font-medium text-right">{t('welcome')}</Text>
          <Text className="text-2xl font-black text-white text-right">{user?.fullName || 'ضيف الرفيق'}</Text>
        </View>

        {/* Search Bar */}
        <View className="bg-white rounded-2xl flex-row items-center px-4 py-1 shadow-lg" style={{ elevation: 5 }}>
          <Search size={20} color="#003580" />
          <TextInput
            placeholder="ابحث عن فنادق، مطاعم..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-right text-sm font-medium text-gray-900 py-3.5 mr-3"
          />
          <TouchableOpacity className="bg-primary/10 rounded-xl p-2">
            <MapPin size={18} color="#003580" />
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View className="mt-5 bg-white/10 rounded-2xl p-5 border border-white/10">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity className="bg-accent px-5 py-2.5 rounded-xl" style={{ elevation: 2, shadowColor: '#C6A75E' }}>
              <Text className="text-white font-black text-xs">احجز الآن</Text>
            </TouchableOpacity>
            <View className="items-end flex-1 mr-4">
              <Text className="text-white text-base font-bold mb-0.5">اكتشف أفضل الخدمات ✨</Text>
              <Text className="text-white/50 text-[10px]">كل ما تحتاجه في مكان واحد بكل أمان</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Trust Signals Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-5"
        contentContainerStyle={{ paddingHorizontal: 24 }}
      >
        {trustSignals.map((signal, i) => (
          <View key={i} className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2 mr-2.5 border border-gray-100">
            <Text className="text-sm mr-1.5">{signal.icon}</Text>
            <Text className="text-gray-600 text-[10px] font-bold">{signal.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Categories */}
      <View className="mt-7">
        <Text className="text-base font-black text-gray-900 px-6 mb-4 text-right">الفـئات</Text>
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
        <View className="flex-row justify-between items-center mb-5">
          <TouchableOpacity>
            <Text className="text-primary text-xs font-bold">عرض الكل ←</Text>
          </TouchableOpacity>
          <Text className="text-base font-black text-gray-900">أحدث العروض</Text>
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
              isFeatured={item.isFeatured}
              onPress={() => {
                if (item.type === 'HOTEL' || item.type === 'HOME') {
                  router.push(`/hotels/${item.id}`);
                } else if (item.type === 'RESTAURANT') {
                  router.push(`/food/${item.id}`);
                } else if (item.type === 'TAXI') {
                  router.push(`/taxi`);
                }
              }}
            />
          ))
        ) : !loading ? (
          <View className="py-20 items-center bg-gray-50 rounded-3xl">
            <Text className="text-5xl mb-4 opacity-30">🔍</Text>
            <Text className="text-gray-400 font-bold text-sm">{t('no_hotels_found')}</Text>
            <Text className="text-gray-300 text-xs mt-1">حاول تغيير الفئة أو البحث</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
