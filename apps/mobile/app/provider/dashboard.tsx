import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Users, Star, Plus, MapPin, ChevronLeft, LayoutDashboard, Hotel, List, User } from 'lucide-react-native';
import api from '../../src/api/client';
import useAuthStore from '../../src/store/authStore';
import { Colors } from '../../src/constants/Theme';

interface Booking {
    id: string;
    bookingRef: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    user: {
        fullName: string;
        phone: string;
    };
    listing: {
        title: string;
    };
}

interface Listing {
    id: string;
    title: string;
    type: string;
    basePrice: number;
    status: string;
    images: { url: string }[];
}

export default function ProviderDashboardScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { provider, user } = useAuthStore();

    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [balance, setBalance] = useState<any>(null);
    const [stats, setStats] = useState({
        totalBookings: provider?.totalBookings || 0,
        avgRating: provider?.avgRating || 0,
        revenue: 0,
        activeListings: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [bookingsRes, listingsRes, balanceRes] = await Promise.all([
                api.get('/bookings/provider'),
                api.get('/listings/provider'),
                api.get('/payments/provider/balance')
            ]);

            const bookings = bookingsRes.data.data;
            const listings = listingsRes.data;

            setRecentBookings(bookings.slice(0, 5));
            setMyListings(listings);
            setBalance(balanceRes.data);

            const revenue = bookings
                .filter((b: any) => b.status === 'COMPLETED')
                .reduce((sum: number, b: any) => sum + b.totalAmount, 0);

            const activeListings = listings.filter((l: any) => l.status === 'ACTIVE').length;

            setStats({
                totalBookings: provider?.totalBookings || bookings.length,
                avgRating: provider?.avgRating || 0,
                revenue,
                activeListings,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-amber-600 bg-amber-50';
            case 'CONFIRMED': return 'text-blue-600 bg-blue-50';
            case 'COMPLETED': return 'text-emerald-600 bg-emerald-50';
            case 'REJECTED':
            case 'CANCELLED_BY_USER':
            case 'CANCELLED_BY_PROVIDER': return 'text-rose-600 bg-rose-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return t('status_pending');
            case 'CONFIRMED': return t('status_confirmed');
            case 'COMPLETED': return t('status_completed');
            default: return t('status_cancelled');
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={() => {
                    setIsRefreshing(true);
                    fetchData();
                }} colors={[Colors.primary]} />
            }
        >
            <View className="bg-primary pt-14 pb-10 px-6 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                        <ChevronLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-white">{t('dashboard')}</Text>
                    <View className="w-10" />
                </View>

                <View className="flex-row items-center justify-between mb-8">
                    <View>
                        <Text className="text-white/70 text-sm font-medium">{t('welcome_back')}</Text>
                        <Text className="text-2xl font-bold text-white">{user?.fullName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/profile')} className="w-12 h-12 bg-white/30 rounded-full items-center justify-center">
                        <User size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View className="bg-emerald-600 rounded-3xl p-6 mb-8 shadow-lg shadow-emerald-200">
                    <Text className="text-emerald-100 text-sm font-medium mb-1">{t('pending_balance') || 'Pending Balance'}</Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-white text-3xl font-black">{balance?.pendingBalance?.toLocaleString() || '0'}</Text>
                        <Text className="text-emerald-100 text-sm font-bold ml-2">DA</Text>
                    </View>
                    <View className="h-px bg-emerald-500/30 my-4" />
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-emerald-200 text-xs">{t('total_paid') || 'Total Paid'}</Text>
                            <Text className="text-white font-bold">{balance?.totalPaid?.toLocaleString() || '0'} DA</Text>
                        </View>
                        <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-full">
                            <Text className="text-white text-xs font-bold">{t('withdraw') || 'Withdraw'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View className="px-6 -mt-6">
                <View className="flex-row flex-wrap justify-between">
                    <StatCard
                        label={t('revenue')}
                        value={`${stats.revenue} DA`}
                        icon={<TrendingUp size={20} color={Colors.primary} />}
                    />
                    <StatCard
                        label={t('total_bookings')}
                        value={stats.totalBookings.toString()}
                        icon={<Users size={20} color={Colors.primary} />}
                    />
                    <StatCard
                        label={t('active_listings')}
                        value={stats.activeListings.toString()}
                        icon={<LayoutDashboard size={20} color={Colors.primary} />}
                    />
                    <StatCard
                        label={t('avg_rating')}
                        value={stats.avgRating.toFixed(1)}
                        icon={<Star size={20} color={Colors.primary} />}
                    />
                </View>

                <TouchableOpacity
                    className="bg-white p-4 rounded-2xl flex-row items-center justify-between shadow-sm border border-gray-100 mb-8"
                    onPress={() => router.push('/provider/listings/new')}
                >
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mr-3">
                            <Plus size={20} color={Colors.primary} />
                        </View>
                        <Text className="text-gray-900 font-bold">{t('add_listing')}</Text>
                    </View>
                    <ChevronLeft size={20} color="#9ca3af" style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>

                <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <TouchableOpacity onPress={() => router.push('/provider/bookings' as any)}>
                            <Text className="text-primary font-bold">{t('manage')}</Text>
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-900">{t('recent_bookings')}</Text>
                    </View>

                    {recentBookings.length === 0 ? (
                        <View className="bg-white p-8 rounded-2xl items-center justify-center border border-dashed border-gray-300">
                            <Text className="text-gray-400">{t('no_bookings_yet')}</Text>
                        </View>
                    ) : (
                        recentBookings.map((booking) => (
                            <TouchableOpacity
                                key={booking.id}
                                className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100"
                                onPress={() => router.push({ pathname: '/provider/bookings/[id]' as any, params: { id: booking.id } } as any)}
                            >
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className={`px-2 py-1 rounded-lg ${getStatusColor(booking.status)}`}>
                                        <Text className="text-xs font-bold">{getStatusLabel(booking.status)}</Text>
                                    </View>
                                    <Text className="text-gray-900 font-bold">{booking.user.fullName}</Text>
                                </View>
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-primary font-bold">{booking.totalAmount} DA</Text>
                                    <Text className="text-gray-500 text-xs">{booking.listing.title}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View className="mb-20">
                    <View className="flex-row justify-between items-center mb-4">
                        <TouchableOpacity onPress={() => router.push('/provider/listings')}>
                            <Text className="text-primary font-bold">{t('manage')}</Text>
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-900">{t('my_listings')}</Text>
                    </View>

                    {myListings.length === 0 ? (
                        <View className="bg-white p-8 rounded-2xl items-center justify-center border border-dashed border-gray-300">
                            <Text className="text-gray-400">{t('no_listings_yet')}</Text>
                        </View>
                    ) : (
                        myListings.map((listing) => (
                            <View key={listing.id} className="bg-white p-3 rounded-2xl mb-3 flex-row items-center border border-gray-100 shadow-sm">
                                <View className="flex-1 mr-3 items-end">
                                    <Text className="text-gray-900 font-bold mb-1">{listing.title}</Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-gray-500 text-xs mr-1">{listing.basePrice} DA/{t('night')}</Text>
                                        <Hotel size={12} color="#9ca3af" />
                                    </View>
                                </View>
                                <Image
                                    source={{ uri: listing.images?.[0]?.url || 'https://via.placeholder.com/60' }}
                                    className="w-16 h-16 rounded-xl"
                                />
                            </View>
                        ))
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: any }) {
    return (
        <View className="bg-white p-4 rounded-2xl w-[48%] mb-4 shadow-sm border border-gray-100">
            <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mb-3">
                {icon}
            </View>
            <Text className="text-gray-500 text-xs mb-1">{label}</Text>
            <Text className="text-gray-900 text-lg font-bold">{value}</Text>
        </View>
    );
}
