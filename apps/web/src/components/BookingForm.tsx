'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface BookingFormProps {
    listing: {
        id: string;
        basePrice: number;
        type: string;
    };
}

export default function BookingForm({ listing }: BookingFormProps) {
    const router = useRouter();
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = end.getTime() - start.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const nights = calculateNights();
    const subtotal = nights * listing.basePrice;
    const total = subtotal; // Simplified for now

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/bookings', {
                listingId: listing.id,
                checkIn,
                checkOut,
                guests,
                paymentMethod: 'CASH', // Default for now
            });

            router.push('/bookings');
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل في إنشاء الحجز. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="premium-card p-10 sticky top-28 shadow-2xl bg-white border border-gray-100">
            <div className="space-y-1 mb-8">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#111827]">{(listing.basePrice ?? 0).toLocaleString()}</span>
                    <span className="text-[#9CA3AF] text-sm font-bold uppercase tracking-widest">ددج / ليلة</span>
                </div>
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    مـتوفر حالـياً
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <div className="group">
                        <label className="block text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2 group-focus-within:text-[#833AB4] transition-colors">تاريخ الوصول</label>
                        <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-0 focus:ring-2 focus:ring-[#833AB4]/20 transition-all font-bold text-[#111827]"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2 group-focus-within:text-[#833AB4] transition-colors">تاريخ المغادرة</label>
                        <input
                            type="date"
                            required
                            min={checkIn || new Date().toISOString().split('T')[0]}
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-0 focus:ring-2 focus:ring-[#833AB4]/20 transition-all font-bold text-[#111827]"
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2 group-focus-within:text-[#833AB4] transition-colors">عدد الضيوف</label>
                    <input
                        type="number"
                        min="1"
                        required
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-0 focus:ring-2 focus:ring-[#833AB4]/20 transition-all font-bold text-[#111827]"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 text-rose-600 text-xs rounded-2xl border border-rose-100 font-bold">
                        {error}
                    </div>
                )}

                {nights > 0 && (
                    <div className="space-y-4 py-8 border-t border-gray-100">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-500">{listing.basePrice.toLocaleString()} دج × {nights} ليالي</span>
                            <span className="text-[#111827]">{subtotal.toLocaleString()} دج</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-black text-[#111827] pt-4">
                            <span>الإجمالي</span>
                            <span className="text-[#833AB4]">{total.toLocaleString()} دج</span>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || (listing.type !== 'TAXI' && nights <= 0)}
                    className="btn-action w-full py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-blue-500/20"
                >
                    {loading ? 'جاري مـعالجة الطلب...' : 'احجز هـذه الإقـامة'}
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest pt-4">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    دفع آمن مـضمون بواسطة نظام الرفيق
                </div>
            </form>
        </div>
    );
}
