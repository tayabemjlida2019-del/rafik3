import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronLeft, Calendar, Users, CreditCard, Banknote, Landmark } from 'lucide-react-native';
import api from '../../../src/api/client';
import { Colors } from '../../../src/constants/Theme';
import Button from '../../../src/components/Button';
import Input from '../../../src/components/Input';

export default function BookingScreen() {
    const { id, title, price } = useLocalSearchParams();
    const { t } = useTranslation();
    const router = useRouter();

    const [checkIn, setCheckIn] = useState(new Date());
    const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000)); // Default +1 day
    const [guests, setGuests] = useState('1');
    const [specialRequests, setSpecialRequests] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [isLoading, setIsLoading] = useState(false);

    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showCheckOut, setShowCheckOut] = useState(false);

    const handleBooking = async () => {
        if (checkOut <= checkIn) {
            Alert.alert(t('error'), t('checkout_must_be_after_checkin'));
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/bookings', {
                listingId: id,
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString(),
                guests: parseInt(guests),
                specialRequests,
                paymentMethod,
            });

            Alert.alert(t('success'), t('booking_success_message'), [
                { text: 'OK', onPress: () => router.replace('/(tabs)/two') }
            ]);
        } catch (error: any) {
            const message = error.response?.data?.message || t('booking_failed');
            Alert.alert(t('error'), message);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateTotal = () => {
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return days * Number(price);
    };

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-white px-6 pt-14 pb-4 shadow-sm flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">{t('booking_title')}</Text>
                <View className="w-10" />
            </View>

            <View className="p-6">
                {/* Reservation Details */}
                <Text className="text-lg font-bold text-gray-900 mb-4 text-right">{t('booking_summary')}</Text>
                <View className="bg-gray-50 p-4 rounded-2xl mb-8">
                    <Text className="text-gray-900 font-bold text-right mb-1">{title}</Text>
                    <Text className="text-gray-500 text-right text-sm">{price} {t('night')}</Text>
                </View>

                {/* Date Selection */}
                <View className="flex-row mb-6 justify-between">
                    <TouchableOpacity
                        onPress={() => setShowCheckOut(true)}
                        className="flex-1 bg-gray-50 p-4 rounded-xl items-end"
                    >
                        <Text className="text-gray-500 text-xs mb-1">{t('check_out')}</Text>
                        <Text className="text-gray-900 font-bold">{checkOut.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    <View className="w-4" />
                    <TouchableOpacity
                        onPress={() => setShowCheckIn(true)}
                        className="flex-1 bg-gray-50 p-4 rounded-xl items-end"
                    >
                        <Text className="text-gray-500 text-xs mb-1">{t('check_in')}</Text>
                        <Text className="text-gray-900 font-bold">{checkIn.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                </View>

                {showCheckIn && (
                    <DateTimePicker
                        value={checkIn}
                        mode="date"
                        minimumDate={new Date()}
                        onChange={(event, date) => {
                            setShowCheckIn(false);
                            if (date) setCheckIn(date);
                        }}
                    />
                )}

                {showCheckOut && (
                    <DateTimePicker
                        value={checkOut}
                        mode="date"
                        minimumDate={new Date(checkIn.getTime() + 86400000)}
                        onChange={(event, date) => {
                            setShowCheckOut(false);
                            if (date) setCheckOut(date);
                        }}
                    />
                )}

                {/* Guests */}
                <Input
                    label={t('number_of_guests')}
                    keyboardType="numeric"
                    value={guests}
                    onChangeText={setGuests}
                    placeholder="1"
                />

                {/* Special Requests */}
                <Input
                    label={t('special_requests')}
                    multiline
                    numberOfLines={3}
                    value={specialRequests}
                    onChangeText={setSpecialRequests}
                    placeholder="..."
                    containerClassName="h-32"
                    textAlignVertical="top"
                />

                {/* Payment Methods */}
                <Text className="text-gray-700 font-medium mb-3 text-right">{t('payment_method')}</Text>
                <View className="flex-row flex-wrap justify-end mb-8">
                    <PaymentOption
                        selected={paymentMethod === 'CCP_TRANSFER'}
                        onPress={() => setPaymentMethod('CCP_TRANSFER')}
                        icon={<Landmark size={20} color={paymentMethod === 'CCP_TRANSFER' ? 'white' : Colors.primary} />}
                        label={t('ccp')}
                    />
                    <PaymentOption
                        selected={paymentMethod === 'BARIDIMOB'}
                        onPress={() => setPaymentMethod('BARIDIMOB')}
                        icon={<Banknote size={20} color={paymentMethod === 'BARIDIMOB' ? 'white' : Colors.primary} />}
                        label={t('baridimob')}
                    />
                    <PaymentOption
                        selected={paymentMethod === 'CASH'}
                        onPress={() => setPaymentMethod('CASH')}
                        icon={<CreditCard size={20} color={paymentMethod === 'CASH' ? 'white' : Colors.primary} />}
                        label={t('cash')}
                    />
                </View>

                {/* Total & Submit */}
                <View className="bg-primary/5 p-6 rounded-3xl mb-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-primary text-2xl font-bold">{calculateTotal()}</Text>
                        <Text className="text-gray-700 font-medium">{t('total_price')}</Text>
                    </View>
                    <Button
                        title={t('confirm_booking')}
                        onPress={handleBooking}
                        isLoading={isLoading}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

function PaymentOption({ selected, onPress, icon, label }: { selected: boolean, onPress: () => void, icon: any, label: string }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center justify-end px-4 py-3 rounded-xl mb-3 ml-2 border ${selected ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
        >
            <Text className={`mr-2 font-medium ${selected ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
            {icon}
        </TouchableOpacity>
    );
}
