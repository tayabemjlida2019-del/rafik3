import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import api from '../src/api/client';
import { ChevronLeft, MapPin, Navigation, Car, Info } from 'lucide-react-native';
import Button from '../src/components/Button';
import Input from '../src/components/Input';

const carTypes = [
    { id: 'STANDARD', title: 'عادية', icon: '🚗', price: 1.0 },
    { id: 'LUXURY', title: 'فخمة', icon: '✨', price: 1.8 },
    { id: 'VAN', title: 'عائلية', icon: '🚐', price: 1.5 },
];

export default function TaxiScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [selectedCar, setSelectedCar] = useState('STANDARD');
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestTaxi = async () => {
        if (!pickup || !destination) {
            Alert.alert(t('error'), 'يرجى تحديد موقع الانطلاق والوجهة');
            return;
        }

        setIsLoading(true);
        try {
            // In a real app, we would find a taxi provider
            // For now, we create a specialized booking
            await api.post('/bookings', {
                listingId: 'taxi-service-id', // Placeholder or dynamic
                checkIn: new Date().toISOString(),
                checkOut: new Date().toISOString(),
                metadata: {
                    type: 'TAXI_REQUEST',
                    pickup,
                    destination,
                    carType: selectedCar,
                },
                paymentMethod: 'CASH',
            });

            Alert.alert(
                t('success'),
                'تم طلب سيارة الأجرة بنجاح! سيتم التواصل معك قريباً من قبل السائق.',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/two') }]
            );
        } catch (error) {
            Alert.alert(t('error'), 'فشل طلب سيارة الأجرة، يرجى المحاولة مرة أخرى');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="bg-primary/5 px-6 pt-14 pb-8 rounded-b-[40px]">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center mb-6 shadow-sm">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-3xl font-black text-gray-900 text-right">اطلب تاكسي</Text>
                <Text className="text-gray-500 text-right mt-1">سائقك الموثوق على بعد ضغطة واحدة</Text>
            </View>

            <View className="px-6 py-8">
                {/* Location Inputs */}
                <View className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100">
                    <View className="relative">
                        <View className="absolute left-[14px] top-[24px] bottom-[24px] w-[2px] bg-gray-200 border-dashed border-l border-gray-300" />

                        <View className="flex-row items-center justify-end mb-6">
                            <Input
                                placeholder="موقع الانطلاق"
                                value={pickup}
                                onChangeText={setPickup}
                                containerClassName="flex-1 mr-4 h-12"
                            />
                            <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center">
                                <View className="w-3 h-3 rounded-full bg-emerald-500" />
                            </View>
                        </View>

                        <View className="flex-row items-center justify-end">
                            <Input
                                placeholder="إلى أين تذهب؟"
                                value={destination}
                                onChangeText={setDestination}
                                containerClassName="flex-1 mr-4 h-12"
                            />
                            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                                <MapPin size={16} color="#059669" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Car Types */}
                <Text className="text-lg font-bold text-gray-900 mb-4 text-right">اختر نوع السيارة</Text>
                <View className="flex-row justify-between mb-10">
                    {carTypes.map((car) => (
                        <TouchableOpacity
                            key={car.id}
                            onPress={() => setSelectedCar(car.id)}
                            className={`flex-1 mx-1 p-4 rounded-2xl border-2 items-center justify-center ${selectedCar === car.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-gray-50 border-transparent'
                                }`}
                        >
                            <Text className="text-3xl mb-2">{car.icon}</Text>
                            <Text className={`font-bold text-xs ${selectedCar === car.id ? 'text-primary' : 'text-gray-500'}`}>
                                {car.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Estimation Info */}
                <View className="flex-row items-center justify-end bg-blue-50 p-4 rounded-2xl mb-10">
                    <Text className="text-blue-700 text-xs text-right flex-1 mr-3 leading-5">
                        السعر النهائي يحدده السائق بناءً على المسافة الفعلية والوقت.
                    </Text>
                    <Info size={18} color="#1d4ed8" />
                </View>

                <Button
                    title="تأكيد الطلب"
                    onPress={handleRequestTaxi}
                    isLoading={isLoading}
                    className="h-14 rounded-2xl"
                />
            </View>
        </ScrollView>
    );
}
