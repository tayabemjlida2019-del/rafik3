'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardNavbar from '@/components/DashboardNavbar';

interface Transaction {
    id: string;
    amount: number;
    receiptUrl: string;
    status: string;
    createdAt: string;
    booking: {
        bookingRef: string;
        listing: { title: string };
    };
}

export default function AdminPaymentsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchPending = async () => {
        try {
            const { data } = await api.get('/payments/transactions');
            setTransactions(data.data.filter((t: any) => t.status === 'VERIFICATION_REQUIRED'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleVerify = async (id: string, approved: boolean) => {
        setActionLoading(id);
        try {
            await api.patch(`/payments/${id}/verify`, { approved });
            setTransactions(transactions.filter(t => t.id !== id));
        } catch (err) {
            alert('فشل في معالجة الطلب');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#121417] flex items-center justify-center">
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
                            <h1 className="text-3xl font-black text-[#E8EAED]">مراجعة مدفوعات المنصة</h1>
                            <p className="text-[#9AA0A6] text-sm mt-1">تأكيد إيصالات CCP و Baridimob المسجلة</p>
                        </div>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div className="dashboard-card p-24 text-center border-dashed border-[#C6A75E]/20">
                        <div className="text-6xl mb-6 grayscale opacity-50 group-hover:grayscale-0 transition-all">✨</div>
                        <h2 className="text-2xl font-black text-[#E8EAED]">لا توجد مدفوعات معلقة</h2>
                        <p className="text-[#9AA0A6] mt-2">لقد قمت بمراجعة جميع الطلبات الحالية، العمل ممتاز!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {transactions.map((t) => (
                            <div key={t.id} className="dashboard-card overflow-hidden group">
                                <div className="aspect-video bg-black relative overflow-hidden">
                                    <img
                                        src={t.receiptUrl}
                                        alt="Receipt"
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">
                                        إيصال تسجيل
                                    </div>
                                </div>
                                <div className="p-8 space-y-8 bg-gradient-to-b from-transparent to-black/20">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-blue-500 text-[10px] font-black tracking-[0.2em] uppercase font-mono">{t.booking.bookingRef}</p>
                                            <h3 className="text-xl font-black text-[#E8EAED] mt-2 leading-tight">{t.booking.listing.title}</h3>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[#9AA0A6] text-[10px] font-black uppercase tracking-widest">المبلغ الصافي</p>
                                            <p className="text-3xl font-black text-[#C6A75E] mt-1">{t.amount.toLocaleString()} <span className="text-xs">دج</span></p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => handleVerify(t.id, true)}
                                            disabled={!!actionLoading}
                                            className="btn-blue flex-1 py-4 text-xs tracking-widest"
                                        >
                                            {actionLoading === t.id ? 'جاري التأكيد...' : 'تأكيد الـدفع ✅'}
                                        </button>
                                        <button
                                            onClick={() => handleVerify(t.id, false)}
                                            disabled={!!actionLoading}
                                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black text-[10px] py-4 rounded-xl border border-red-500/20 transition-all active:scale-95 disabled:opacity-50 tracking-widest"
                                        >
                                            رفض العملية ❌
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
