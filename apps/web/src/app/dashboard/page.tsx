'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardNavbar from '@/components/DashboardNavbar';

interface Booking {
    id: string;
    bookingRef: string;
    status: string;
    totalAmount: number;
    providerPayout: number;
    checkIn: string;
    checkOut: string;
    user: { fullName: string; phone: string };
    listing: { title: string };
}

interface Balance {
    pendingBalance: number;
    totalPaid: number;
    currency: string;
    pendingPayoutsCount: number;
}

export default function ProviderDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [balance, setBalance] = useState<Balance | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [bookingsRes, balanceRes] = await Promise.all([
                api.get('/bookings/provider'),
                api.get('/payments/provider/balance')
            ]);
            setBookings(bookingsRes.data.data || []);
            setBalance(balanceRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleComplete = async (id: string) => {
        if (!confirm('هل تأكدت من إتمام الخدمة للزبون؟ سيتم تحويل المستحقات لرصيدك.')) return;
        try {
            await api.patch(`/bookings/${id}/complete`);
            fetchData();
        } catch (err) {
            alert('فشل في تحديث الحالة');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <DashboardNavbar />

            <main className="section-padding py-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="dashboard-card p-8 group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[#9AA0A6] text-xs font-black uppercase tracking-widest">المستحقات المعلقة</span>
                            <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">⏳</span>
                        </div>
                        <p className="text-4xl font-black text-[#E8EAED] tracking-tight">{balance?.pendingBalance.toLocaleString()} <span className="text-sm text-[#C6A75E]">دج</span></p>
                        <div className="mt-4 pt-4 border-t border-blue-500/5 text-[10px] text-slate-400 font-bold">
                            سيتم تحويلها بعد مراجعة إتمام المهام
                        </div>
                    </div>

                    <div className="dashboard-card p-8 group bg-gradient-to-br from-slate-800 to-slate-900">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[#C6A75E] text-xs font-black uppercase tracking-widest">إجمالي الأرباح المدفوعة</span>
                            <span className="text-2xl group-hover:scale-125 transition-transform duration-500">💰</span>
                        </div>
                        <p className="text-4xl font-black text-[#E8EAED] tracking-tight">{balance?.totalPaid.toLocaleString()} <span className="text-sm text-[#C6A75E]">دج</span></p>
                        <div className="mt-4 pt-4 border-t border-blue-500/5 text-[10px] text-slate-400 font-bold">
                            تم تحويلها فعلياً عبر CCP / Baridimob
                        </div>
                    </div>

                    <div className="dashboard-card p-8 group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[#9AA0A6] text-xs font-black uppercase tracking-widest">إجمالي الطلبات</span>
                            <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">📋</span>
                        </div>
                        <p className="text-4xl font-black text-[#E8EAED] tracking-tight">{bookings.length}</p>
                        <div className="mt-4 pt-4 border-t border-blue-500/5 text-[10px] text-slate-400 font-bold">
                            منذ انضمامك للمنصة
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="dashboard-card overflow-hidden">
                    <div className="p-8 border-b border-blue-500/10 flex justify-between items-center bg-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                            <h2 className="text-xl font-black text-[#E8EAED]">طلبات الحجز والعمليات الأخيرة</h2>
                        </div>
                        <span className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase">
                            {bookings.length} عملية نشطة
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-800/30 border-b border-blue-500/5">
                                    <th className="px-8 py-5">المرجع / الخدمة</th>
                                    <th className="px-8 py-5">الزبون</th>
                                    <th className="px-8 py-5">التاريخ</th>
                                    <th className="px-8 py-5">نصيب المزود</th>
                                    <th className="px-8 py-5 text-center">الحالة</th>
                                    <th className="px-8 py-5">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-500/5">
                                {bookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-8 py-6">
                                            <p className="text-[10px] font-black text-blue-500 font-mono tracking-widest">{b.bookingRef}</p>
                                            <p className="font-bold text-[#E8EAED] mt-1 group-hover:text-white transition-colors">{b.listing.title}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-[#E8EAED]">{b.user.fullName}</p>
                                            <p className="text-[#9AA0A6] text-xs mt-1">{b.user.phone}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[#E8EAED] text-sm">{new Date(b.checkIn).toLocaleDateString('ar-DZ')}</p>
                                            <p className="text-[#9AA0A6] text-[10px] font-bold mt-1">إلى {new Date(b.checkOut).toLocaleDateString('ar-DZ')}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-blue-500 text-lg">{b.providerPayout.toLocaleString()} دج</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm ${b.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500' :
                                                b.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400' :
                                                    b.status === 'ESCROW_HELD' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-[#9AA0A6]/10 text-[#9AA0A6]'
                                                }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {(b.status === 'CONFIRMED' || b.status === 'ESCROW_HELD') && (
                                                <button
                                                    onClick={() => handleComplete(b.id)}
                                                    className="btn-blue whitespace-nowrap text-[11px] px-6 py-2.5"
                                                >
                                                    إتمام الخدمة ✅
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
