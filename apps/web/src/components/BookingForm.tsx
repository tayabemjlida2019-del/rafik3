'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface BookingFormProps {
    listing: {
        id: string;
        basePrice: number;
        type: string;
        title?: string;
        avgRating?: number;
        totalReviews?: number;
    };
}

export default function BookingForm({ listing }: BookingFormProps) {
    const router = useRouter();
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [rooms, setRooms] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showGuestPicker, setShowGuestPicker] = useState(false);

    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = end.getTime() - start.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const nights = calculateNights();
    const subtotal = nights * listing.basePrice;
    const serviceFee = Math.round(subtotal * 0.05);
    const total = subtotal + serviceFee;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/bookings', {
                listingId: listing.id,
                checkIn,
                checkOut,
                guests,
                paymentMethod: 'CASH',
            });
            toast.success('تم إنشاء حجزك بنجاح! 🎉');
            router.push('/my-bookings');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'فشل في إنشاء الحجز. حاول مجدداً.');
        } finally {
            setLoading(false);
        }
    };

    const ratingLabel = (rating: number) => {
        if (rating >= 9) return 'استثنائي';
        if (rating >= 8) return 'ممتاز';
        if (rating >= 7) return 'رائع جداً';
        if (rating >= 6) return 'جيد';
        return 'مقبول';
    };

    const displayRating = listing.avgRating || 8.7;

    return (
        <div className="bg-gradient-to-b from-[#111827] to-[#0d1220] border border-white/[0.06] rounded-[28px] overflow-hidden sticky top-28 shadow-2xl shadow-black/60 group">
            {/* Top Rating Bar */}
            <div className="bg-[#003580]/30 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#003580] rounded-lg rounded-bl-none flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-900/40">
                        {displayRating.toFixed(1)}
                    </div>
                    <div>
                        <div className="text-white font-bold text-sm">{ratingLabel(displayRating)}</div>
                        <div className="text-slate-400 text-[10px] font-semibold">{listing.totalReviews || 47} تقييم</div>
                    </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-500 transition-all text-white/40">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
            </div>

            {/* Main Content */}
            <div className="p-6 sm:p-8">
                {/* Price Display */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">يبدأ من</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white tracking-tight">{(listing.basePrice ?? 0).toLocaleString()}</span>
                            <span className="text-slate-400 text-sm font-bold">دج</span>
                            <span className="text-slate-500 text-xs font-medium mr-1">/ ليلة</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        متـوفر
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-0">
                    {/* Date Inputs — Booking.com Style Connected Fields */}
                    <div className="border border-white/10 rounded-2xl overflow-hidden mb-4 hover:border-[#C6A75E]/40 transition-colors focus-within:border-[#C6A75E]/60 focus-within:shadow-lg focus-within:shadow-[#C6A75E]/5">
                        <div className="grid grid-cols-2 divide-x divide-white/10" style={{ direction: 'ltr' }}>
                            <div className="p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative">
                                <label className="block text-[9px] font-black text-[#C6A75E] uppercase tracking-[0.2em] mb-1.5">تاريخ الوصول</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    className="w-full bg-transparent text-white font-bold text-sm outline-none appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                <label className="block text-[9px] font-black text-[#C6A75E] uppercase tracking-[0.2em] mb-1.5">تاريخ المغادرة</label>
                                <input
                                    type="date"
                                    required
                                    min={checkIn || new Date().toISOString().split('T')[0]}
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    className="w-full bg-transparent text-white font-bold text-sm outline-none appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Guests & Rooms Row */}
                        <div className="border-t border-white/10 p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer relative"
                             onClick={() => setShowGuestPicker(!showGuestPicker)}>
                            <label className="block text-[9px] font-black text-[#C6A75E] uppercase tracking-[0.2em] mb-1.5">الضيوف والغرف</label>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold text-sm">{guests} ضيوف · {rooms} غرفة</span>
                                <svg className={`w-4 h-4 text-slate-400 transition-transform ${showGuestPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>

                            {/* Dropdown Picker */}
                            {showGuestPicker && (
                                <div className="absolute left-0 right-0 top-full z-50 bg-[#151a2d] border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/60 mt-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white font-bold text-sm">عدد الضيوف</span>
                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 text-lg">−</button>
                                                <span className="text-white font-black w-6 text-center">{guests}</span>
                                                <button type="button" onClick={() => setGuests(Math.min(10, guests + 1))} className="w-9 h-9 rounded-full bg-[#003580] text-white flex items-center justify-center hover:bg-[#002b66] transition-all active:scale-90 shadow-lg shadow-blue-900/30 text-lg">+</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white font-bold text-sm">عدد الغرف</span>
                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 text-lg">−</button>
                                                <span className="text-white font-black w-6 text-center">{rooms}</span>
                                                <button type="button" onClick={() => setRooms(Math.min(5, rooms + 1))} className="w-9 h-9 rounded-full bg-[#003580] text-white flex items-center justify-center hover:bg-[#002b66] transition-all active:scale-90 shadow-lg shadow-blue-900/30 text-lg">+</button>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setShowGuestPicker(false)} className="w-full mt-5 bg-white/5 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-white/10 transition-all">تم</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    {nights > 0 && (
                        <div className="bg-white/[0.03] rounded-2xl p-5 mb-5 border border-white/5 space-y-4 animate-fade-in">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-medium">{listing.basePrice.toLocaleString()} دج × {nights} {nights === 1 ? 'ليلة' : 'ليالي'}</span>
                                <span className="text-white font-bold">{subtotal.toLocaleString()} دج</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                    رسوم الخدمة
                                    <span className="w-3.5 h-3.5 rounded-full bg-white/10 text-white/60 text-[8px] flex items-center justify-center cursor-help" title="رسوم خدمة المنصة 5%">؟</span>
                                </span>
                                <span className="text-white font-bold">{serviceFee.toLocaleString()} دج</span>
                            </div>
                            <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                                <span className="text-lg font-black text-white">الإجمالي</span>
                                <div className="text-left">
                                    <span className="text-2xl font-black text-[#C6A75E]">{total.toLocaleString()}</span>
                                    <span className="text-sm text-slate-400 font-bold mr-1">دج</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA Button */}
                    <button
                        type="submit"
                        disabled={loading || (listing.type !== 'TAXI' && nights <= 0)}
                        className="w-full bg-[#003580] hover:bg-[#002b66] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/30 active:scale-[0.98] disabled:opacity-30 disabled:grayscale relative overflow-hidden group/btn"
                    >
                        <div className="absolute inset-0 bg-gradient-to-l from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="relative z-10">
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    جاري المعالجة...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    تأكـيد الـحجز الآن
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Trust Signals */}
                    <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-emerald-400 px-4 py-3 bg-emerald-500/[0.06] rounded-xl border border-emerald-500/10">
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            إلغاء مجاني — لن يتم خصم أي مبلغ
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-blue-400 px-4 py-3 bg-blue-500/[0.06] rounded-xl border border-blue-500/10">
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            الدفع الآمن — بطريقة مضمونة 100%
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-[#C6A75E] px-4 py-3 bg-[#C6A75E]/[0.06] rounded-xl border border-[#C6A75E]/10">
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            أفضل سعر مضمون على الرفيق
                        </div>
                    </div>

                    {/* Urgency Signal */}
                    <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold text-orange-400 bg-orange-500/[0.06] border border-orange-500/10 px-4 py-3 rounded-xl">
                        <span className="text-base">🔥</span>
                        <span>آخر حجز تم قبل 3 ساعات — الطلب مرتفع!</span>
                    </div>
                </form>
            </div>
        </div>
    );
}
