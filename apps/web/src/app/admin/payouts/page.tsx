'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardNavbar from '@/components/DashboardNavbar';

interface PayoutTransaction {
    id: string;
    amount: number;
    payoutAmount: number;
    payoutStatus: string;
    createdAt: string;
    booking: {
        bookingRef: string;
        listing: { title: string };
        provider: {
            businessName: string;
            user: { fullName: string; email: string };
            ccpAccount?: string;
            bankAccount?: string;
        };
    };
}

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<PayoutTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [reference, setReference] = useState<string>('');

    const fetchPendingPayouts = async () => {
        try {
            const { data } = await api.get('/admin/finance/payouts/pending');
            setPayouts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingPayouts();
    }, []);

    const handleCompletePayout = async (id: string) => {
        if (!reference) {
            alert('يرجى إدخال رقم العملية المرجعي');
            return;
        }

        setActionLoading(id);
        try {
            await api.patch(`/admin/finance/payouts/${id}/complete`, { reference });
            setPayouts(payouts.filter(p => p.id !== id));
            setReference('');
        } catch (err) {
            alert('فشل في معالجة الطلب');
        } finally {
            setActionLoading(null);
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
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                        <div>
                            <h1 className="text-3xl font-black text-[#E8EAED]">إدارة مستحقات المزودين</h1>
                            <p className="text-[#9AA0A6] text-sm mt-1">تحويل المبالغ المستأمنة (Escrow) بعد إتمام الخدمات</p>
                        </div>
                    </div>
                </div>

                {payouts.length === 0 ? (
                    <div className="dashboard-card p-24 text-center border-dashed border-blue-500/20">
                        <div className="text-6xl mb-6 grayscale opacity-40">💰</div>
                        <h2 className="text-2xl font-black text-[#E8EAED]">لا توجد مستحقات معلقة حالياً</h2>
                        <p className="text-[#9AA0A6] mt-2">سيتم إدراج المبالغ هنا بمجرد اكتمال الحجوزات وتأكيد الدفع من قبل المسؤول.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {payouts.map((p) => (
                            <div key={p.id} className="dashboard-card p-8 group">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                                    {/* Provider Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-[#9AA0A6] text-[10px] font-black uppercase tracking-[0.2em]">بيانات المستلم (المزود)</h3>
                                        <div>
                                            <p className="text-xl font-black text-[#E8EAED] leading-tight">{p.booking.provider.businessName}</p>
                                            <p className="text-blue-500 font-bold text-xs mt-1">{p.booking.provider.user.fullName}</p>
                                        </div>
                                        <div className="p-5 bg-black/40 rounded-2xl border border-blue-500/10 flex items-center justify-between group-hover:border-blue-500/30 transition-colors">
                                            <div>
                                                <p className="text-[10px] text-[#9AA0A6] font-bold mb-1 tracking-widest uppercase">رقم الحساب CCP</p>
                                                <p className="font-mono text-[#E8EAED] text-lg font-bold tracking-wider">{p.booking.provider.ccpAccount || 'غير متوفر'}</p>
                                            </div>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(p.booking.provider.ccpAccount || '')}
                                                className="w-10 h-10 rounded-xl bg-blue-500/5 text-blue-500 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center text-sm"
                                                title="نسخ رقم الحساب"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>

                                    {/* Booking Info */}
                                    <div className="space-y-4 lg:border-x border-blue-500/5 lg:px-12">
                                        <h3 className="text-[#9AA0A6] text-[10px] font-black uppercase tracking-[0.2em]">تفاصيل الحجز</h3>
                                        <div>
                                            <p className="text-[10px] font-black text-blue-500 font-mono tracking-widest">{p.booking.bookingRef}</p>
                                            <p className="font-bold text-[#E8EAED] mt-1">{p.booking.listing.title}</p>
                                        </div>
                                        <div className="flex justify-between items-end bg-slate-800 p-4 rounded-xl border border-blue-500/5">
                                            <div>
                                                <p className="text-[9px] text-[#9AA0A6] font-bold uppercase">إجمالي الحجز</p>
                                                <p className="text-sm font-bold text-gray-400">{p.amount.toLocaleString()} دج</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] text-[#C6A75E] font-bold uppercase">صافي التحويل</p>
                                                <p className="text-2xl font-black text-blue-500 tracking-tight">{p.payoutAmount.toLocaleString()} دج</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex flex-col gap-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="رقم مرجع العملية البنكية"
                                                className="w-full bg-black/40 border border-[#C6A75E]/10 rounded-2xl px-6 py-4 text-sm text-[#E8EAED] focus:outline-none focus:border-[#C6A75E] transition-colors placeholder:text-[#9AA0A6]/40"
                                                value={reference}
                                                onChange={(e) => setReference(e.target.value)}
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs opacity-30">REF</span>
                                        </div>
                                        <button
                                            onClick={() => handleCompletePayout(p.id)}
                                            disabled={!!actionLoading}
                                            className="btn-blue py-4 text-xs tracking-widest flex items-center justify-center gap-3"
                                        >
                                            {actionLoading === p.id ? (
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <span>تأكيد التحويل للمزود</span>
                                                    <span>✅</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
