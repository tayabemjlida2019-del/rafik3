import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home, ClipboardList, User } from 'lucide-react-native';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#003580',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: true,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 18,
          color: '#111827',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6',
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          headerTitle: 'الـرفيق',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center ${focused ? 'bg-primary/10 rounded-xl px-4 py-1' : ''}`}>
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: t('bookings'),
          headerTitle: 'حجوزاتي',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center ${focused ? 'bg-primary/10 rounded-xl px-4 py-1' : ''}`}>
              <ClipboardList size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          headerTitle: 'حسابي',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center ${focused ? 'bg-primary/10 rounded-xl px-4 py-1' : ''}`}>
              <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
