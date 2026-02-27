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
    gym: '💪 صالة رياضة',
    traditional_courtyard: '🏛️ فناء تقليدي',
    terrace: '🌇 شرفة',
    bay_view: '🌅 إطلالة',
    garden: '🌿 حديقة',
    washing_machine: '🧺 غسالة',
    furnished: '🛋️ مفروش',
    parking_nearby: '🅿️ موقف قريب',
};

function StarRating({ rating, count }: { rating: number; count?: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            <span className="text-sm text-gray-500 mr-1">{rating}</span>
            {count !== undefined && (
                <span className="text-sm text-gray-400">({count})</span>
            )}
        </div>
    );
}

const wilayas = [
    'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار', 'البليدة', 'البويرة',
    'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر العاصمة', 'الجلفة', 'جيجل', 'سطيف', 'سعيدة',
    'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة', 'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة',
    'وهران', 'البيض', 'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
    'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان', 'تيميمون', 'برج باجي مختار',
    'أولاد جلال', 'بني عباس', 'عين صالح', 'عين قزام', 'تقرت', 'جانت', 'المغير', 'المنيعة'
];

function HomesContent() {
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
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

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <PremiumNavbar />

            <div className="pt-24">
                {/* Content Header */}
                <div className="bg-slate-900 py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-noise opacity-5"></div>
                    <div className="absolute inset-0 geometric-overlay opacity-20"></div>
                    <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full"></div>

                    <div className="section-padding relative">
                        <div className="max-w-4xl">
                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-4">كراء المنازل</div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                مـنازل وإقـامات عصرية
                            </h1>
                            <p className="text-slate-400 text-lg font-normal max-w-2xl leading-relaxed">
                                اكتشف مجموعة مختارة من المنازل والشقق المجهزة في جميع أنحاء الوطن، <br className="hidden md:block" /> مع ضمان الجودة والأمان في كل عملية حجز.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="section-padding py-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Modern Filters Sidebar */}
                        <div className="lg:w-80 shrink-0">
                            <div className="bg-white rounded-[32px] border border-gray-100 p-8 sticky top-28 shadow-sm">
                                <h3 className="text-xl font-black text-[#111827] mb-8 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm">🔍</span>
                                    تخصيص البحث
                                </h3>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-[#9CA3AF]">المـدينة</label>
                                        <select
                                            value={filters.city}
                                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-0 focus:ring-2 focus:ring-[#833AB4]/20 transition-all text-sm font-bold text-[#111827]"
                                        >
                                            <option value="">كل الولايات الجزائرية</option>
                                            {wilayas.map((w) => (
                                                <option key={w} value={w}>{w}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-[#9CA3AF]">نـطاق الـسعر (دج)</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="number"
                                                placeholder="مـن"
                                                value={filters.minPrice}
                                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                                className="w-full px-4 py-4 rounded-xl bg-gray-50 border-0 text-sm font-bold"
                                            />
                                            <input
                                                type="number"
                                                placeholder="إلى"
                                                value={filters.maxPrice}
                                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                                className="w-full px-4 py-4 rounded-xl bg-gray-50 border-0 text-sm font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-[#9CA3AF]">تـرنيب النتـائج</label>
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-0 text-sm font-bold"
                                        >
                                            <option value="rating_desc">الأعلى تقييماً</option>
                                            <option value="price_asc">الأقل سعراً</option>
                                            <option value="price_desc">الأعلى سعراً</option>
                                            <option value="newest">أحدث الإقامات</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setFilters({ city: '', minPrice: '', maxPrice: '', sortBy: 'rating_desc' })}
                                        className="w-full py-4 text-[#833AB4] text-xs font-black uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all"
                                    >
                                        إعادة تـعيين الـفلتر
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-10">
                                <div className="text-xs font-black text-[#9CA3AF] uppercase tracking-[0.2em]">
                                    {loading ? 'جاري جرد الإقامات...' : `تـم العـثور على ${total} نتيجة`}
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[1, 2, 4].map((i) => (
                                        <div key={i} className="bg-white rounded-[32px] h-[450px] animate-pulse"></div>
                                    ))}
                                </div>
                            ) : listings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {listings.map((listing) => (
                                        <Link
                                            key={listing.id}
                                            href={`/homes/${listing.id}`}
                                            className="premium-card group"
                                        >
                                            <div className="relative h-64 bg-[#111827] flex items-center justify-center overflow-hidden">
                                                {listing.images?.[0] ? (
                                                    <img
                                                        src={listing.images[0].thumbnailUrl || listing.images[0].url}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <span className="text-6xl opacity-50">🏠</span>
                                                )}

                                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                                    {listing.provider?.kycStatus === 'VERIFIED' && (
                                                        <span className="bg-emerald-400/90 backdrop-blur-md text-emerald-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                                                            موثق ✅
                                                        </span>
                                                    )}
                                                    <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                        {listing.metadata?.rooms || '—'} غرف
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-8">
                                                <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-bold mb-4">
                                                    <span className="w-1.5 h-1.5 bg-[#833AB4] rounded-full"></span>
                                                    {listing.city}
                                                </div>

                                                <h3 className="text-2xl font-bold text-[#111827] mb-6 group-hover:text-[#833AB4] transition-colors line-clamp-1">
                                                    {listing.title}
                                                </h3>

                                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                                    <div className="flex flex-col">
                                                        <span className="text-2xl font-black text-[#111827]">
                                                            {listing.basePrice.toLocaleString()}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">ددج / ليلة</span>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#111827] group-hover:text-white transition-all">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-32 bg-white rounded-[40px] border border-gray-100">
                                    <div className="text-7xl mb-6">🏜️</div>
                                    <h3 className="text-2xl font-black text-[#111827] mb-2">لا تـوجد نـتائج مـطابقة</h3>
                                    <p className="text-gray-500 font-light">جرب تغيير فلاتر البحث لاستكشاف المزيد من الخيارات.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HomesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري التحميل...</p>
                </div>
            </div>
        }>
            <HomesContent />
        </Suspense>
    );
}
