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

interface SearchFilters {
    city: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
}

const featureLabels: Record<string, string> = {
    wifi: '📶 واي فاي',
    parking: '🅿️ موقف',
    pool: '🏊 مسبح',
    gym: '💪 صالة رياضة',
    breakfast: '🍳 إفطار',
    air_conditioning: '❄️ تكييف',
    restaurant: '🍴 مطعم',
    spa: '🧖 سبا',
    room_service: '🛌 خدمة غرف',
};

function RatingBadge({ score, reviews }: { score: number; reviews: number }) {
    const label = score >= 9 ? 'استثنائي' : score >= 8 ? 'ممتاز' : score >= 7 ? 'جيد جداً' : 'جيد';
    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white">{label}</span>
                <span className="text-[10px] text-slate-400">{reviews.toLocaleString()} تقييم</span>
            </div>
            <div className="w-9 h-9 rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-[#003580] flex items-center justify-center text-white font-black text-sm">
                {score.toFixed(1)}
            </div>
        </div>
    );
}

const wilayas = [
    'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار', 'البليدة', 'البويرة',
    'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر العاصمة', 'الجلفة', 'جيجل', 'سطيف', 'سعيدة',
    'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة', 'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة',
    'وهران', 'البيض', 'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
    'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان',
];

function HotelsContent() {
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<SearchFilters>({
        city: searchParams.get('city') || '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'rating_desc',
    });

    useEffect(() => {
        fetchListings();
    }, [filters]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params: any = { type: 'HOTEL' };
            if (filters.city) params.city = filters.city;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.sortBy) params.sortBy = filters.sortBy;
            const { data } = await api.get('/listings', { params });
            setListings(data.data || []);
            setTotal(data.meta?.total || 0);
        } catch {
            setListings([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-72 shrink-0">
                <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 sticky top-28">
                    <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#003580]/20 flex items-center justify-center text-sm">🔍</span>
                        الفلترة والتصنيف
                    </h3>

                    <div className="space-y-5">
                        {/* City */}
                        <div>
                            <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">الولاية</label>
                            <select
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white appearance-none focus:ring-2 focus:ring-[#003580]/40 outline-none transition-all"
                            >
                                <option value="" className="bg-[#111827]">كل الولايات</option>
                                {wilayas.map((w) => (
                                    <option key={w} value={w} className="bg-[#111827]">{w}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">السعر (دج/ليلة)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="من"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-white/20 outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="إلى"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-white/20 outline-none"
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">ترتيب حسب</label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white appearance-none outline-none"
                            >
                                <option value="rating_desc" className="bg-[#111827]">الأعلى تقييماً</option>
                                <option value="price_asc" className="bg-[#111827]">الأقل سعراً</option>
                                <option value="price_desc" className="bg-[#111827]">الأعلى سعراً</option>
                                <option value="newest" className="bg-[#111827]">الأحدث</option>
                            </select>
                        </div>

                        {/* Quick Filters */}
                        <div>
                            <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-3">مميزات</label>
                            <div className="flex flex-wrap gap-2">
                                {['📶 واي فاي', '🏊 مسبح', '🅿️ موقف', '❄️ تكييف', '🍳 إفطار'].map((f) => (
                                    <button key={f} className="text-[10px] bg-white/5 border border-white/5 text-slate-400 px-3 py-1.5 rounded-lg hover:border-[#C6A75E]/30 hover:text-white transition-all">
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setFilters({ city: '', minPrice: '', maxPrice: '', sortBy: 'rating_desc' })}
                            className="w-full py-3 text-red-400 text-xs font-bold hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                        >
                            ✕ إعادة تعيين الفلتر
                        </button>
                    </div>
                </div>
            </div>

            {/* Listings Grid */}
            <div className="flex-1">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6 bg-[#111827] rounded-xl px-5 py-3 border border-white/5">
                    <p className="text-slate-400 text-sm font-bold">
                        {loading ? '⏳ جاري البحث...' : `${total} فندق متاح`}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${viewMode === 'grid' ? 'bg-[#003580] text-white' : 'bg-white/5 text-slate-400'}`}
                        >⊞</button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${viewMode === 'list' ? 'bg-[#003580] text-white' : 'bg-white/5 text-slate-400'}`}
                        >☰</button>
                    </div>
                </div>

                {loading ? (
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-5`}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-[#111827] border border-white/5 rounded-2xl h-[380px] animate-pulse"></div>
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-5`}>
                        {listings.map((listing) => (
                            <Link
                                key={listing.id}
                                href={`/hotels/${listing.id}`}
                                className={`bg-[#111827] border border-white/5 rounded-2xl overflow-hidden group transition-all duration-500 hover:border-[#C6A75E]/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/30 ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'}`}
                            >
                                <div className={`relative ${viewMode === 'list' ? 'w-72 shrink-0' : 'h-48'} bg-[#0a0e1a] flex items-center justify-center overflow-hidden`}>
                                    {listing.images?.[0] ? (
                                        <img
                                            src={listing.images[0].thumbnailUrl || listing.images[0].url}
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <span className="text-5xl opacity-20">🏨</span>
                                    )}

                                    {/* Heart */}
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(listing.id); }}
                                        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 hover:bg-black/60"
                                    >
                                        <svg className={`w-4 h-4 ${favorites.has(listing.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>

                                    {listing.provider?.kycStatus === 'VERIFIED' && (
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-[#C6A75E] text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-lg">✅ موثق</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 left-3">
                                        <span className="bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                                            {listing.metadata?.type || 'فندق'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-2">
                                        <RatingBadge score={listing.avgRating || 8.5} reviews={listing.totalReviews || 0} />
                                        <div className="flex items-center gap-1.5 text-[#C6A75E] text-[10px] font-bold flex-1 mr-2">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            {listing.city}
                                            {listing.provider && (
                                                <span className="text-slate-500">· {listing.provider.businessName}</span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#C6A75E] transition-colors line-clamp-2 leading-snug flex-1">
                                        {listing.title}
                                    </h3>

                                    {listing.metadata?.amenities && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {listing.metadata.amenities.slice(0, 3).map((f: string) => (
                                                <span key={f} className="text-[10px] bg-white/5 text-slate-400 px-2 py-1 rounded-md">
                                                    {featureLabels[f] || f}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-end justify-between pt-4 border-t border-white/5 mt-auto">
                                        <div>
                                            <span className="text-xs text-slate-500 block">يبدأ من</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-white">{listing.basePrice.toLocaleString()}</span>
                                                <span className="text-xs text-slate-400">دج / ليلة</span>
                                            </div>
                                        </div>
                                        <div className="bg-[#003580]/10 text-[#4a9eff] text-[10px] font-bold px-2.5 py-1 rounded-lg">
                                            إلغاء مجاني
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-[#111827] rounded-2xl border border-white/5">
                        <div className="text-7xl mb-6">🔍</div>
                        <h3 className="text-2xl font-black text-white mb-2">لا توجد نتائج مطابقة</h3>
                        <p className="text-slate-400 mb-6">جرب تغيير الفلاتر أو البحث في مدينة أخرى.</p>
                        <button
                            onClick={() => setFilters({ city: '', minPrice: '', maxPrice: '', sortBy: 'rating_desc' })}
                            className="bg-[#003580] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#00264d] transition-all"
                        >
                            إعادة تعيين البحث
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function HotelsPage() {
    return (
        <div className="min-h-screen bg-[#0a0e1a]">
            <PremiumNavbar />
            <div className="pt-24">
                {/* Hero Header */}
                <div className="relative py-16 overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#003580]/30 to-transparent"></div>
                    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#C6A75E]/5 blur-[150px] rounded-full"></div>

                    <div className="section-padding relative">
                        <div className="max-w-4xl">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                                <span className="w-2 h-2 bg-[#C6A75E] rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-[#C6A75E] uppercase tracking-widest">خدمات الإقامة الفاخرة</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                                الـفنادق <span className="bg-gradient-to-r from-[#C6A75E] to-[#e8d5a0] bg-clip-text text-transparent">والـمنتجعات</span>
                            </h1>
                            <p className="text-slate-400 text-lg font-light max-w-2xl leading-relaxed">
                                اختر من بين مجموعة متنوعة من الفنادق والمنتجعات السياحية عبر 48 ولاية جزائرية، مع تجربة حجز سلسة وآمنة.
                            </p>

                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 mt-6 text-sm text-slate-500">
                                <Link href="/" className="hover:text-[#C6A75E] transition-colors">الرئيسية</Link>
                                <span>›</span>
                                <span className="text-white">الفنادق والمنتجعات</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-padding py-8">
                    <Suspense fallback={<div className="text-center py-20 text-slate-500">⏳ جاري تحميل العروض...</div>}>
                        <HotelsContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
