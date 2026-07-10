'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import PremiumNavbar from '@/components/PremiumNavbar';

interface Listing {
    id: string;
    title: string;
    description: string;
    city: string;
    wilaya: string;
    basePrice: number;
    avgRating: number;
    totalReviews: number;
    metadata: any;
    images: Array<{ url: string; thumbnailUrl: string }>;
    provider: {
        businessName: string;
        avgRating: number;
        kycStatus: string;
    };
}

const foodTypes = [
    { id: 'TRADITIONAL', label: '🥘 أطباق تقليدية' },
    { id: 'FAST_FOOD', label: '🍔 أكل سريع' },
    { id: 'ORIENTAL', label: '🥙 شرقي' },
    { id: 'SWEETS', label: '🍰 حلويات' },
    { id: 'CAFE', label: '☕ مقاهي' },
];

function RatingBadge({ score, reviews }: { score: number; reviews: number }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-white bg-emerald-600 px-2 py-1 rounded-lg shadow-lg">
                {score.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">({reviews}+ رأي)</span>
        </div>
    );
}

function FoodContent() {
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        category: '',
        sortBy: 'rating_desc',
    });

    useEffect(() => {
        fetchListings();
    }, [filters]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params: any = { type: 'RESTAURANT' };
            if (filters.city) params.city = filters.city;
            if (filters.category) params.category = filters.category;
            if (filters.sortBy) params.sortBy = filters.sortBy;

            const { data } = await api.get('/listings', { params });
            setListings(data.data || []);
            setTotal(data.meta?.total || 0);
        } catch {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 py-12 section-padding">
            {/* Sidebar Filters */}
            <div className="lg:w-80 shrink-0">
                <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 sticky top-28 shadow-2xl">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">🍽️</span>
                        تصفية المطاعم
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-[#C6A75E] uppercase mb-3">المدينة</label>
                            <input 
                                type="text"
                                placeholder="مثال: وهران، قسنطينة..."
                                value={filters.city}
                                onChange={(e) => setFilters({...filters, city: e.target.value})}
                                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#C6A75E]/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-[#C6A75E] uppercase mb-3">التصنيف</label>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => setFilters({...filters, category: ''})}
                                    className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold transition-all ${filters.category === '' ? 'bg-[#C6A75E] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                >
                                    كل المطابخ
                                </button>
                                {foodTypes.map(t => (
                                    <button 
                                        key={t.id}
                                        onClick={() => setFilters({...filters, category: t.id})}
                                        className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold transition-all ${filters.category === t.id ? 'bg-[#C6A75E] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white/5 rounded-[40px] h-96 animate-pulse"></div>
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <Link 
                                key={listing.id} 
                                href={`/food/${listing.id}`} 
                                className="bg-[#111827] border border-white/5 rounded-[40px] overflow-hidden group transition-all duration-500 hover:border-[#C6A75E]/30 hover:scale-[1.02] shadow-xl"
                            >
                                <div className="relative h-56 bg-[#020617] overflow-hidden">
                                    {listing.images?.[0] ? (
                                        <img
                                            src={listing.images[0].url}
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🍲</div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase">مفتوح الآن</span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-[#C6A75E] text-[10px] font-bold mb-3">
                                        <span className="w-2 h-2 bg-[#C6A75E] rounded-full"></span>
                                        {listing.city}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#C6A75E] transition-colors line-clamp-1">
                                        {listing.title}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <RatingBadge score={listing.avgRating || 4.5} reviews={listing.totalReviews || 120} />
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">متوسط السعر</span>
                                            <span className="text-white font-black">{listing.basePrice.toLocaleString()} دج</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/5">
                                        <div className="flex gap-2">
                                            <span className="text-[10px] bg-white/5 text-slate-400 px-3 py-1.5 rounded-lg flex items-center gap-1">🛵 توصيل سريع</span>
                                            <span className="text-[10px] bg-white/5 text-slate-400 px-3 py-1.5 rounded-lg flex items-center gap-1">🍽️ حجز طاولة</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white/5 rounded-[40px] border border-white/5">
                        <div className="text-7xl mb-6">🥘</div>
                        <h3 className="text-2xl font-black text-white mb-2">لا توجد مطاعم مطابقة</h3>
                        <p className="text-slate-400">جرب البحث في مدينة أخرى أو تغيير التصنيف.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function FoodPage() {
    return (
        <div className="min-h-screen bg-[#0a0e1a]">
            <PremiumNavbar />
            <div className="pt-24">
                <div className="relative py-20 overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-transparent"></div>
                    <div className="section-padding relative">
                        <div className="max-w-4xl">
                            <div className="inline-flex items-center gap-2 bg-emerald-600/10 border border-emerald-600/20 rounded-full px-4 py-2 mb-6">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">تذوق أفضل الأطباق الجزائرية</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
                                المطــاعم <span className="text-[#C6A75E]">والمذاقات</span>
                            </h1>
                            <p className="text-slate-400 text-xl font-light max-w-2xl leading-relaxed">
                                من الأطباق التقليدية العريقة إلى الأكلات السريعة الحديثة، اكتشف أفضل المطاعم في منطقتك بضغطة زر.
                            </p>
                        </div>
                    </div>
                </div>
                <Suspense fallback={<div className="text-center py-20 text-white">جاري تحميل المطاعم...</div>}>
                    <FoodContent />
                </Suspense>
            </div>
        </div>
    );
}
