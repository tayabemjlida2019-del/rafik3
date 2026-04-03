import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme';
import { useAuthStore } from '../stores/auth.store';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import { HotelsScreen, HomesScreen, FoodScreen, TaxiScreen } from '../screens/listings/ListingsScreens';
import ListingDetailScreen from '../screens/listings/ListingDetailScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        primary: theme.colors.primary,
    },
};

const screenOptions = { headerShown: false };

function HomeStack() {
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="Hotels" component={HotelsScreen} />
            <Stack.Screen name="Homes" component={HomesScreen} />
            <Stack.Screen name="Food" component={FoodScreen} />
            <Stack.Screen name="Taxi" component={TaxiScreen} />
            <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
        </Stack.Navigator>
    );
}

function BookingsStack() {
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen name="BookingsMain" component={BookingsScreen} />
        </Stack.Navigator>
    );
}

function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen name="DashboardMain" component={DashboardScreen} />
        </Stack.Navigator>
    );
}

function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
        </Stack.Navigator>
    );
}

function MainTabs() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isProvider = user?.role === 'PROVIDER';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                    paddingTop: 6,
                    paddingBottom: 8,
                    height: 65,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string = 'home';
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
                    else if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                    return <Ionicons name={iconName as any} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: t('home') }} />
            <Tab.Screen name="Bookings" component={BookingsStack} options={{ tabBarLabel: t('bookings') }} />
            {isProvider && <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarLabel: t('dashboard') }} />}
            <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarLabel: t('profile') }} />
        </Tab.Navigator>
    );
}

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

export default function Navigation() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return (
        <NavigationContainer theme={navTheme}>
            {isAuthenticated ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
}
