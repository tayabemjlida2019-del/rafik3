import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Bell, BellOff, Info, CheckCircle, XCircle } from 'lucide-react-native';
import api from '../src/api/client';
import { Colors } from '../src/constants/Theme';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'BOOKING_CREATED': return <Bell size={20} color={Colors.primary} />;
            case 'BOOKING_CONFIRMED': return <CheckCircle size={20} color="#10b981" />;
            case 'BOOKING_REJECTED': return <XCircle size={20} color="#ef4444" />;
            default: return <Info size={20} color="#6b7280" />;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long' });
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <View className="px-6 pt-14 pb-4 border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">{t('notifications') || 'التنبيهات'}</Text>
                <View className="w-10" />
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
            >
                {notifications.length === 0 ? (
                    <View className="py-20 items-center px-10">
                        <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                            <BellOff size={40} color="#d1d5db" />
                        </View>
                        <Text className="text-gray-900 font-bold text-lg mb-2">لا توجد تنبيهات</Text>
                        <Text className="text-gray-400 text-center">بمجرد حصولك على تحديثات في حجوزاتك، ستظهر هنا.</Text>
                    </View>
                ) : (
                    notifications.map((n) => (
                        <TouchableOpacity
                            key={n.id}
                            onPress={() => !n.isRead && markAsRead(n.id)}
                            className={`px-6 py-5 border-b border-gray-50 flex-row items-start ${n.isRead ? 'opacity-60' : 'bg-emerald-50/20'}`}
                        >
                            <View className="mr-4 mt-1">
                                {getIcon(n.type)}
                            </View>
                            <View className="flex-1 items-end">
                                <View className="flex-row justify-between items-center w-full mb-1">
                                    <Text className="text-gray-400 text-xs">{formatDate(n.createdAt)}</Text>
                                    <Text className={`font-bold ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</Text>
                                </View>
                                <Text className="text-gray-500 text-sm leading-5 text-right">{n.message}</Text>
                                {!n.isRead && (
                                    <View className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
