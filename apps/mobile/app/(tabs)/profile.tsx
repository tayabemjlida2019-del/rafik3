import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import useAuthStore from '../../src/store/authStore';
import { User, LogOut, ChevronRight, Settings, ShieldCheck, HelpCircle } from 'lucide-react-native';
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
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header / Avatar Section */}
            <View className="items-center py-12 bg-primary/5">
                <View className="w-24 h-24 rounded-full bg-white items-center justify-center shadow-sm border border-gray-100 mb-4">
                    <User size={48} color="#059669" />
                </View>
                <Text className="text-xl font-bold text-gray-900">{user?.fullName || 'ضيف الرفيق'}</Text>
                <Text className="text-gray-500 text-sm">{user?.email}</Text>

                <View className="mt-4 px-3 py-1 bg-primary/10 rounded-full">
                    <Text className="text-primary text-xs font-bold">
                        {user?.role === 'PROVIDER' ? 'مزود خدمة موثق' : 'مستخدم'}
                    </Text>
                </View>
            </View>

            <View className="px-6 py-8">
                {/* Menu Sections */}
                <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 text-right">إعدادات الحساب</Text>

                <ProfileMenuItem
                    icon={<Settings size={20} color="#6b7280" />}
                    title="تعديل الملف الشخصي"
                    onPress={() => { }}
                />
                <ProfileMenuItem
                    icon={<ShieldCheck size={20} color="#6b7280" />}
                    title="الأمان والخصوصية"
                    onPress={() => { }}
                />

                <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-8 mb-4 text-right">الدعم</Text>
                <ProfileMenuItem
                    icon={<HelpCircle size={20} color="#6b7280" />}
                    title="مركز المساعدة"
                    onPress={() => { }}
                />

                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center justify-between py-4 mt-12 bg-red-50 px-6 rounded-2xl"
                >
                    <LogOut size={20} color="#ef4444" />
                    <Text className="text-red-500 font-bold">تسجيل الخروج</Text>
                </TouchableOpacity>

                {user?.role !== 'PROVIDER' && (
                    <View className="mt-12 p-6 bg-emerald-600 rounded-3xl shadow-lg shadow-emerald-500/20">
                        <Text className="text-white text-lg font-bold mb-2 text-right">هل أنت مزود خدمة؟</Text>
                        <Text className="text-emerald-100 text-xs mb-6 text-right leading-5">
                            انضم إلينا الآن وابدأ في تقديم خدماتك عبر منصة الرفيق وزيادة أرباحك بشكل موثوق.
                        </Text>
                        <Button
                            title="سجل كمزود الآن"
                            variant="primary"
                            className="bg-white"
                            onPress={() => router.push('/(auth)/register-provider')}
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

function ProfileMenuItem({ icon, title, onPress }: { icon: any, title: string, onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center justify-between py-5 border-b border-gray-50"
        >
            <ChevronRight size={18} color="#d1d5db" />
            <View className="flex-row items-center flex-1 justify-end">
                <Text className="text-gray-700 font-medium mr-4">{title}</Text>
                <View className="bg-gray-50 p-2 rounded-xl">
                    {icon}
                </View>
            </View>
        </TouchableOpacity>
    );
}
