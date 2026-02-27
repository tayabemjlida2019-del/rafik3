'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import DashboardNavbar from '@/components/DashboardNavbar';
import toast from 'react-hot-toast';

interface Listing {
    id: string;
    title: string;
    type: string;
    status: string;
    basePrice: number;
    city: string;
    images: { url: string }[];
}

export default function ProviderListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchListings = async () => {
        try {
            const { data } = await api.get('/listings/provider/my');
            setListings(data);
        } catch (err) {
            console.error(err);
            toast.error('فشل في تحميل القوائم');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الخدمة نهائياً؟')) return;
        try {
            await api.delete(`/listings/${id}`);
            setListings(listings.filter(l => l.id !== id));
            toast.success('تم حذف الخدمة بنجاح');
        } catch (err) {
            toast.error('فشل في حذف الخدمة');
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
                            <h1 className="text-3xl font-black text-[#E8EAED]">إدارة خدماتي</h1>
                            <p className="text-[#9AA0A6] text-sm mt-1">عرض وتعديل الخدمات النشطة والمعلقة</p>
                        </div>
                    </div>
                    {/* Placeholder for "Add Listing" - could be added later if needed */}
                </div>

                {listings.length === 0 ? (
                    <div className="dashboard-card p-24 text-center border-dashed border-[#C6A75E]/20">
                        <div className="text-6xl mb-6 grayscale opacity-40">📝</div>
                        <h2 className="text-2xl font-black text-[#E8EAED]">لا توجد خدمات مضافة حتى الآن</h2>
                        <p className="text-[#9AA0A6] mt-2 mb-8">ابدأ بإضافة أول خدمة لك لتظهر للزبائن في المنصة.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {listings.map((l) => (
                            <div key={l.id} className="dashboard-card overflow-hidden group">
                                <div className="aspect-[16/10] bg-[#1A1D22] relative overflow-hidden">
                                    {l.images?.[0] ? (
                                        <img
                                            src={l.images[0].url}
                                            alt={l.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl grayscale opacity-20">🖼️</div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${l.status === 'ACTIVE' ? 'bg-emerald-500 text-black' :
                                            l.status === 'PENDING_REVIEW' ? 'bg-[#C6A75E] text-black' : 'bg-red-500 text-white'
                                            }`}>
                                            {l.status === 'ACTIVE' ? 'نشط' : l.status === 'PENDING_REVIEW' ? 'قيد المراجعة' : 'معطل'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-lg border border-white/10">
                                        {l.type}
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <h3 className="text-xl font-black text-[#E8EAED] leading-tight group-hover:text-[#C6A75E] transition-colors">{l.title}</h3>
                                        <p className="text-[#9AA0A6] text-sm mt-2 flex items-center gap-2">
                                            <span>📍</span> {l.city}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-[#C6A75E]/5 pt-6">
                                        <div>
                                            <p className="text-[10px] text-[#9AA0A6] font-bold uppercase tracking-widest">السعر الأساسي</p>
                                            <p className="text-xl font-black text-[#E8EAED]">{l.basePrice.toLocaleString()} <span className="text-xs text-[#C6A75E]">دج</span></p>
                                        </div>
                                        <div className="flex gap-2">
                                            {l.type === 'RESTAURANT' && (
                                                <Link
                                                    href={`/dashboard/listings/${l.id}/menu`}
                                                    className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-blue-500/5"
                                                    title="إدارة المنيو"
                                                >
                                                    🍽️
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => handleDelete(l.id)}
                                                className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-red-500/5"
                                                title="حذف الخدمة"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/${l.type === 'RESTAURANT' ? 'food' : l.type.toLowerCase() + 's'}/${l.id}`}
                                        className="btn-blue w-full flex items-center justify-center gap-2 text-xs py-4"
                                    >
                                        <span>معاينة في الموقع</span>
                                        <span className="text-lg">👁️</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
