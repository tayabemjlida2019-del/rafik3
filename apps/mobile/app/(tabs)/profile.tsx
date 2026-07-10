import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import useAuthStore from '../../src/store/authStore';
import { User, LogOut, ChevronLeft, Settings, ShieldCheck, HelpCircle, CreditCard, Globe } from 'lucide-react-native';
import Button from '../../src/components/Button';

export default function ProfileScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            t('logout'),
            'هل أنت متأكد من تسجيل الخروج؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'خروج',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header / Avatar Section */}
            <View className="items-center py-10 bg-white border-b border-gray-100">
                <View className="w-24 h-24 rounded-3xl bg-primary/10 items-center justify-center mb-4 border-2 border-primary/20">
                    <User size={44} color="#003580" />
                </View>
                <Text className="text-xl font-black text-gray-900 mb-0.5">{user?.fullName || 'ضيف الرفيق'}</Text>
                <Text className="text-gray-400 text-xs font-medium">{user?.email}</Text>

                <View className="mt-3 flex-row items-center bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20">
                    <Text className="text-primary text-[10px] font-black uppercase tracking-widest">
                        {user?.role === 'PROVIDER' ? '🏢 مزود خدمة موثق' : '👤 مستخدم'}
                    </Text>
                </View>
            </View>

            <View className="px-6 py-6">
                {/* Account Section */}
                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3 text-right">إعدادات الحساب</Text>

                <View className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6" style={{ elevation: 1 }}>
                    <ProfileMenuItem
                        icon={<Settings size={18} color="#003580" />}
                        title="تعديل الملف الشخصي"
                        onPress={() => { }}
                    />
                    <View className="h-[1px] bg-gray-50 mx-5" />
                    <ProfileMenuItem
                        icon={<CreditCard size={18} color="#003580" />}
                        title="طرق الدفع"
                        onPress={() => { }}
                    />
                    <View className="h-[1px] bg-gray-50 mx-5" />
                    <ProfileMenuItem
                        icon={<ShieldCheck size={18} color="#003580" />}
                        title="الأمان والخصوصية"
                        onPress={() => { }}
                    />
                    <View className="h-[1px] bg-gray-50 mx-5" />
                    <ProfileMenuItem
                        icon={<Globe size={18} color="#003580" />}
                        title="اللغة والإعدادات"
                        onPress={() => { }}
                    />
                </View>

                {/* Support Section */}
                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3 text-right">الدعم والمساعدة</Text>

                <View className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6" style={{ elevation: 1 }}>
                    <ProfileMenuItem
                        icon={<HelpCircle size={18} color="#003580" />}
                        title="مركز المساعدة"
                        onPress={() => { }}
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center justify-center py-4 bg-red-50 px-6 rounded-2xl border border-red-100"
                    activeOpacity={0.8}
                >
                    <LogOut size={18} color="#ef4444" />
                    <Text className="text-red-500 font-black mr-2.5 text-sm">تسجيل الخروج</Text>
                </TouchableOpacity>

                {/* Provider CTA */}
                {user?.role !== 'PROVIDER' && (
                    <View className="mt-8 p-6 bg-primary rounded-3xl" style={{ elevation: 4, shadowColor: '#003580' }}>
                        <Text className="text-white text-base font-black mb-1 text-right">هل أنت مزود خدمة؟ 🏢</Text>
                        <Text className="text-white/60 text-xs mb-5 text-right leading-5">
                            انضم إلينا الآن وابدأ في تقديم خدماتك عبر منصة الرفيق وزيادة أرباحك بشكل موثوق.
                        </Text>
                        <Button
                            title="سجل كمزود الآن"
                            variant="accent"
                            onPress={() => router.push('/(auth)/register-provider')}
                        />
                    </View>
                )}

                {/* App Version */}
                <View className="items-center mt-8">
                    <Text className="text-gray-300 text-[10px] font-medium">النسخة 1.0.0 — الرفيق © 2026</Text>
                </View>
            </View>
        </ScrollView>
    );
}

function ProfileMenuItem({ icon, title, onPress }: { icon: any, title: string, onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center justify-between py-4 px-5"
        >
            <ChevronLeft size={16} color="#d1d5db" />
            <View className="flex-row items-center flex-1 justify-end">
                <Text className="text-gray-700 font-bold text-sm mr-3">{title}</Text>
                <View className="bg-primary/5 p-2.5 rounded-xl">
                    {icon}
                </View>
            </View>
        </TouchableOpacity>
    );
}
