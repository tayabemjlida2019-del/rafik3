'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import DashboardNavbar from '@/components/DashboardNavbar';

interface Stats {
    totalUsers: number;
    totalProviders: number;
    pendingListings: number;
    totalRevenue: number;
    payoutsPending: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/dashboard/stats');
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch admin stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const statCards = [
        { label: 'إجمالي المستخدمين', value: stats?.totalUsers || 0, icon: '👥', color: 'blue' },
        { label: 'مزودي الخدمات', value: stats?.totalProviders || 0, icon: '🏨', color: 'emerald' },
        { label: 'خدمات بانتظار المراجعة', value: stats?.pendingListings || 0, icon: '⏳', color: 'amber', href: '/admin/listings' },
        { label: 'إجمالي الإيرادات', value: `${(stats?.totalRevenue || 0).toLocaleString()} دج`, icon: '💰', color: 'blue' },
        { label: 'مستحقات معلقة', value: stats?.payoutsPending || 0, icon: '💸', color: 'rose', href: '/admin/payouts' },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <DashboardNavbar />

            <main className="section-padding py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-[#E8EAED] mb-2 tracking-tight">لوحة الإدارة المركزية</h1>
                    <p className="text-[#9AA0A6] font-medium">مرحباً بك، لديك تحكم كامل في جميع العمليات المالية والمحتوى.</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {statCards.map((card, idx) => (
                        <div key={idx} className="dashboard-card p-8 group hover:scale-[1.02] transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[#9AA0A6] text-xs font-black uppercase tracking-widest">{card.label}</span>
                                <span className="text-2xl group-hover:scale-125 transition-transform">{card.icon}</span>
                            </div>
                            <p className="text-4xl font-black text-[#E8EAED] tracking-tight">{card.value}</p>
                            {card.href && (
                                <Link
                                    href={card.href}
                                    className="inline-flex items-center gap-2 mt-4 text-[10px] font-black text-blue-500 hover:text-blue-400 tracking-widest uppercase"
                                >
                                    عرض التفاصيل ➔
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="dashboard-card p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/20">
                        <h3 className="text-xl font-black text-white mb-4">إدارة العمليات المالية</h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">قم بمراجعة المدفوعات الواردة من المستخدمين، وتأكيد تحويل المستحقات لمزودي الخدمات عبر CCP أو Baridimob.</p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/admin/payments" className="btn-blue text-[11px] px-8 py-3">مراجعة المدفوعات</Link>
                            <Link href="/admin/payouts" className="btn-outline text-[11px] px-8 py-3 border-blue-500/30">جدول المستحقات</Link>
                        </div>
                    </div>

                    <div className="dashboard-card p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/20">
                        <h3 className="text-xl font-black text-white mb-4">التحقق من المحتوى والمزودين</h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">مراجعة طلبات انضمام الشركات الجديدة، وتدقيق منشورات الخدمات (فنادق، سيارات، منازل) قبل نشرها.</p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/admin/providers" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black px-8 py-3 transition-all">إدارة المزودين</Link>
                            <Link href="/admin/listings" className="btn-outline text-[11px] px-8 py-3 border-emerald-500/30">تدقيق الخدمات</Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
