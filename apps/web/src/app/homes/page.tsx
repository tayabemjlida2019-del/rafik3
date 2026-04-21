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
    sea_view: '🌊 إطلالة بحرية',
    air_conditioning: '❄️ تكييف',
    kitchen: '🍳 مطبخ',
    pool: '🏊 مسبح',
};

function RatingBadge({ score, reviews }: { score: number; reviews: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-white">تقييم الضيوف</span>
                <span className="text-[9px] text-slate-400">{reviews.toLocaleString()} تقييم</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#C6A75E] flex items-center justify-center text-white font-black text-xs">
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

function HomesContent() {
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
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
            const params: any = { type: 'HOME' };
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
            <div className="lg:w-80 shrink-0">
                <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 sticky top-28 shadow-2xl">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">🔍</span>
                        تخصيص البحث
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-[#C6A75E] mb-3">الولاية</label>
                            <select
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-[#C6A75E]/20 transition-all text-sm font-bold text-white appearance-none outline-none"
                            >
                                <option value="" className="bg-[#020617]">كل الولايات الجزائرية</option>
                                {wilayas.map((w) => (
                                    <option key={w} value={w} className="bg-[#020617]">{w}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-[#C6A75E]">نطاق السعر (دج)</label>
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    placeholder="من"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-white/20 outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="إلى"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-white/20 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-[#C6A75E] mb-3 block">ترتيب النتائج</label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white appearance-none outline-none"
                            >
                                <option value="rating_desc" className="bg-[#020617]">الأعلى تقييماً</option>
                                <option value="price_asc" className="bg-[#020617]">الأقل سعراً</option>
                                <option value="price_desc" className="bg-[#020617]">الأعلى سعراً</option>
                                <option value="newest" className="bg-[#020617]">أحدث الإقامات</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setFilters({ city: '', minPrice: '', maxPrice: '', sortBy: 'rating_desc' })}
                            className="w-full py-4 text-[#C6A75E] text-xs font-black uppercase tracking-widest hover:bg-white/5 rounded-xl transition-all"
                        >
                            إعادة تـعيين الـفلتر
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-8">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                        {loading ? 'جاري جرد الإقامات...' : `تم العثور على ${total} نتيجة`}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] h-[500px] animate-pulse"></div>
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {listings.map((listing) => (
                            <Link
                                key={listing.id}
                                href={`/homes/${listing.id}`}
                                className="bg-[#111827] border border-white/5 rounded-[40px] overflow-hidden group transition-all duration-700 hover:border-[#C6A75E]/30 hover:translate-y-[-10px] shadow-2xl"
                            >
                                <div className="relative h-72 bg-[#020617] flex items-center justify-center overflow-hidden">
                                    {listing.images?.[0] ? (
                                        <img
                                            src={listing.images[0].thumbnailUrl || listing.images[0].url}
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <span className="text-7xl opacity-30">🏠</span>
                                    )}

                                    {/* Favorite Button */}
                                    <button
                                        onClick={(e) => { e.preventDefault(); toggleFavorite(listing.id); }}
                                        className="absolute top-5 left-5 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#C6A75E] transition-all z-10"
                                    >
                                        <svg className={`w-5 h-5 ${favorites.has(listing.id) ? 'fill-white' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>

                                    <div className="absolute top-5 right-5 flex flex-col gap-2">
                                        {listing.provider?.kycStatus === 'VERIFIED' && (
                                            <span className="bg-[#C6A75E] text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md">
                                                موثق ✅
                                            </span>
                                        )}
                                        <span className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                                            {listing.metadata?.rooms || '—'} غرف
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-[#C6A75E] text-xs font-bold">
                                            <span className="w-1.5 h-1.5 bg-[#C6A75E] rounded-full"></span>
                                            {listing.city}
                                        </div>
                                        <RatingBadge score={listing.avgRating || 8.8} reviews={listing.totalReviews || 0} />
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-[#C6A75E] transition-colors line-clamp-1 leading-snug">
                                        {listing.title}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {listing.metadata?.amenities?.slice(0, 3).map((f: string) => (
                                            <span key={f} className="text-[10px] bg-white/5 border border-white/5 text-slate-400 px-3 py-1.5 rounded-xl">
                                                {featureLabels[f] || f}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-black text-white">
                                                {listing.basePrice.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] font-bold text-[#C6A75E] uppercase tracking-widest">دج / ليلة</span>
                                        </div>
                                        <div className="w-14 h-14 rounded-full bg-[#003580] text-white flex items-center justify-center group-hover:bg-[#C6A75E] transition-all duration-500 shadow-xl">
                                            <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10">
                        <div className="text-7xl mb-6">🏜️</div>
                        <h3 className="text-2xl font-black text-white mb-2">لا تـوجد نـتائج مـطابقة</h3>
                        <p className="text-slate-400 font-light">جرب تغيير فلاتر البحث لاستكشاف المزيد من الخيارات.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function HomesPage() {
    return (
        <div className="min-h-screen bg-[#0a0e1a]">
            <PremiumNavbar />

            <div className="pt-24">
                {/* Header Section */}
                <div className="relative py-20 overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#003580]/20 to-transparent"></div>
                    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#C6A75E]/5 blur-[150px] rounded-full"></div>

                    <div className="section-padding relative">
                        <div className="max-w-4xl">
                            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 mb-6">
                                <span className="text-[10px] font-black text-[#C6A75E] uppercase tracking-[0.3em]">منازل عصرية في الجزائر</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
                                إقامات <span className="text-[#C6A75E]">فاخرة</span> لكل الأذواق
                            </h1>
                            <p className="text-slate-400 text-xl font-light max-w-2xl leading-relaxed">
                                اكتشف مجموعة مختارة من المنازل والشقق المجهزة، من الاستوديوهات العصرية إلى الفيلات الواسعة، مع ضمان الجودة والأمان.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="section-padding py-12">
                    <Suspense fallback={<div className="text-center py-20 text-white">جاري تحميل الإقامات...</div>}>
                        <HomesContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
