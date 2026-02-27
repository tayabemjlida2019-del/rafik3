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
    { id: 'TRADITIONAL', label: '🍟 مأكولات تقليدية' },
    { id: 'FAST_FOOD', label: '🍕 أكل سريع' },
    { id: 'ORIENTAL', label: '🥙 شرقي' },
    { id: 'SWEETS', label: '🍰 حلويات' },
];

const wilayas = [
    'الجزائر العاصمة', 'وهران', 'قسنطينة', 'عنابة', 'باتنة', 'سطيف',
    'بجاية', 'تلمسان', 'بليدة', 'تيزي وزو', 'جيجل', 'سكيكدة',
];

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
            {count !== undefined && <span className="text-sm text-gray-400">({count})</span>}
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
                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-4">خدمات الطعام</div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                المـأكولات والـمطاعم
                            </h1>
                            <p className="text-slate-400 text-lg font-normal max-w-2xl leading-relaxed">
                                اطلب أشهى الأطباق من أفضل المطاعم الجزائرية، <br className="hidden md:block" /> تجربة سهلة وموثوقة تصلك حيثما كنت بضغطة زر.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-white rounded-[32px] border border-gray-100 p-8 sticky top-28 shadow-sm">
                            <h3 className="text-xl font-black text-[#111827] mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm">🔍</span>
                                تخصيص البحث
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                                    <select
                                        value={filters.city}
                                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                        className="input-field text-sm focus:border-orange-500"
                                    >
                                        <option value="">كل المدن</option>
                                        {wilayas.map((w) => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع المأكولات</label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                        className="input-field text-sm focus:border-orange-500"
                                    >
                                        <option value="">كل الأنواع</option>
                                        {foodTypes.map((t) => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ترتيب حسب</label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                        className="input-field text-sm focus:border-orange-500"
                                    >
                                        <option value="rating_desc">الأعلى تقييماً</option>
                                        <option value="newest">الأحدث</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => setFilters({ city: '', category: '', sortBy: 'rating_desc' })}
                                    className="w-full py-4 text-orange-600 text-xs font-black uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all"
                                >
                                    إعادة تـعيين الـفلتر
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-600 text-sm">{loading ? 'جاري البحث...' : `${total} مطعم متاح`}</p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="card animate-pulse">
                                        <div className="h-48 bg-gray-200"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : listings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {listings.map((listing) => (
                                    <Link key={listing.id} href={`/food/${listing.id}`} className="premium-card group">
                                        <div className="relative h-48 bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center overflow-hidden">
                                            {listing.images?.[0] ? (
                                                <img
                                                    src={listing.images[0].thumbnailUrl || listing.images[0].url}
                                                    alt={listing.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <span className="text-5xl">🍲</span>
                                            )}
                                            {listing.provider?.kycStatus === 'VERIFIED' && (
                                                <div className="absolute top-3 right-3">
                                                    <span className="badge bg-emerald-50 text-emerald-700 text-xs shadow-sm">✅ موثق</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                                                <span>📍</span>
                                                <span>{listing.city}</span>
                                            </div>

                                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                                                {listing.title}
                                            </h3>

                                            <StarRating rating={listing.avgRating} count={listing.totalReviews} />

                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-sm text-gray-500">متوسط السعر:</span>
                                                    <span className="text-lg font-bold text-orange-600">{listing.basePrice.toLocaleString()} دج</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <div className="text-6xl mb-4">🍲</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد مطاعم حالياً</h3>
                                <p className="text-gray-500 text-sm">جرب تغيير الفلاتر أو البحث في مدينة أخرى</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FoodPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                </div>
            </div>
        }>
            <FoodContent />
        </Suspense>
    );
}
