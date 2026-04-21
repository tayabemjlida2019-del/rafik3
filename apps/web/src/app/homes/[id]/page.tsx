'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Gallery from '@/components/Gallery';
import BookingForm from '@/components/BookingForm';
import PremiumNavbar from '@/components/PremiumNavbar';

// Icons mapping for homes
const featureIcons: Record<string, string> = {
    wifi: '📶',
    parking: '🅿️',
    sea_view: '🌊',
    air_conditioning: '❄️',
    kitchen: '🍳',
    pool: '🏊',
    gym: '💪',
    traditional_courtyard: '🏛️',
    terrace: '🌇',
    garden: '🌿',
    washing_machine: '🧺',
    furnished: '🛋️',
};

const featureLabels: Record<string, string> = {
    wifi: 'واي فاي مجاني',
    parking: 'موقف سيارات',
    sea_view: 'إطلالة على البحر',
    air_conditioning: 'تكييف هوائي',
    kitchen: 'مطبخ مجهز بالكامل',
    pool: 'مسبح خاص',
    gym: 'قاعة رياضة',
    traditional_courtyard: 'وسط دار تقليدي',
    terrace: 'شرفة واسعة',
    garden: 'حديقة خاصة',
    washing_machine: 'غسالة ملابس',
    furnished: 'مفروش بالكامل',
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-[#C6A75E]' : 'text-white/10'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function RatingBadge({ rating, reviews }: { rating: number; reviews: number }) {
    const label = rating >= 9 ? 'استثنائي' : rating >= 8 ? 'ممتاز' : rating >= 7 ? 'رائع جداً' : 'جيد';
    return (
        <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#003580] rounded-lg rounded-bl-none flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-900/40">
                {rating.toFixed(1)}
            </div>
            <div>
                <div className="text-white font-bold text-sm">{label}</div>
                <div className="text-slate-500 text-xs font-medium">{reviews} تقييم</div>
            </div>
        </div>
    );
}

export default function HomeDetailsPage({ params }: { params: { id: string } }) {
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await api.get(`/listings/${params.id}`);
                setListing(data);
            } catch (err) {
                setError('فشل في تحميل تفاصيل الإقامة. يرجى المحاولة مرة أخرى.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-14 h-14 border-4 border-[#C6A75E] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-500 text-sm font-bold animate-pulse">جاري تحميل تفاصيل الإقامة...</span>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center section-padding">
                <div className="text-7xl mb-6">⚠️</div>
                <h2 className="text-2xl font-black text-white mb-3 text-center">{error || 'لم يتم العثور على الإقامة'}</h2>
                <p className="text-slate-500 mb-8 text-center">قد تكون الإقامة غير متاحة أو تم حذفها.</p>
                <Link href="/homes" className="bg-[#003580] hover:bg-[#002b66] text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95">العودة لقائمة الإقامات</Link>
            </div>
        );
    }

    const rating = listing.avgRating || 4.8;
    const reviews = listing.totalReviews || 12;

    return (
        <div className="min-h-screen bg-[#0a0e1a]">
            <PremiumNavbar />

            {/* Breadcrumbs */}
            <div className="pt-24 pb-6 border-b border-white/5">
                <div className="section-padding">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <Link href="/" className="hover:text-[#C6A75E] transition-colors">الـرئيسية</Link>
                        <span className="opacity-30">/</span>
                        <Link href="/homes" className="hover:text-[#C6A75E] transition-colors">الإقـامات</Link>
                        <span className="opacity-30">/</span>
                        <span className="text-white">{listing.title}</span>
                    </div>
                </div>
            </div>

            <main className="section-padding py-10">
                <div className="max-w-[1400px] mx-auto">
                    {/* Header Info */}
                    <div className="mb-10">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                            <div className="space-y-5 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="bg-[#C6A75E]/10 text-[#C6A75E] border border-[#C6A75E]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        🏠 إقامة خاصة
                                    </span>
                                    {listing.isFeatured && (
                                        <span className="bg-white/10 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10">
                                            <span className="text-amber-400">⭐</span> مـنزل مـختار
                                        </span>
                                    )}
                                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">إلغاء مجاني</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">{listing.title}</h1>
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <RatingBadge rating={rating} reviews={reviews} />
                                    <div className="flex items-center gap-2 text-slate-400 font-bold bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl">
                                        <span className="text-lg">📍</span>
                                        {listing.city}، الجزائر
                                    </div>
                                    <StarRating rating={rating} />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white active:scale-90">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                </button>
                                <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-500 transition-all text-white active:scale-90">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Gallery */}
                    <div className="mb-16">
                        <Gallery images={listing.images} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-16">
                            {/* Quick Info Chips */}
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-5 py-3 rounded-2xl">
                                    <span className="text-xl">🛏️</span>
                                    <span className="text-white font-bold text-sm">{listing.metadata?.rooms || listing.metadata?.bedrooms || 3} غرف نوم</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-5 py-3 rounded-2xl">
                                    <span className="text-xl">🚿</span>
                                    <span className="text-white font-bold text-sm">{listing.metadata?.bathrooms || 2} حمام</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-5 py-3 rounded-2xl">
                                    <span className="text-xl">👥</span>
                                    <span className="text-white font-bold text-sm">حتى {listing.metadata?.maxGuests || 8} ضيوف</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-5 py-3 rounded-2xl">
                                    <span className="text-xl">📐</span>
                                    <span className="text-white font-bold text-sm">{listing.metadata?.area || '120'} م²</span>
                                </div>
                                {listing.metadata?.floor && (
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-5 py-3 rounded-2xl">
                                        <span className="text-xl">🏢</span>
                                        <span className="text-white font-bold text-sm">الطابق {listing.metadata.floor}</span>
                                    </div>
                                )}
                            </div>

                            {/* What Makes This Home Special */}
                            <section className="bg-gradient-to-br from-[#C6A75E]/5 to-transparent rounded-3xl p-8 border border-[#C6A75E]/10">
                                <h2 className="text-xl font-black text-[#C6A75E] mb-4 flex items-center gap-3">
                                    <span>✨</span> ما يميز هذا المنزل
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                                        <span className="w-1.5 h-1.5 bg-[#C6A75E] rounded-full"></span>
                                        منزل كامل — كل المساحة لك
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                                        <span className="w-1.5 h-1.5 bg-[#C6A75E] rounded-full"></span>
                                        نظافة استثنائية ومعتمدة
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                                        <span className="w-1.5 h-1.5 bg-[#C6A75E] rounded-full"></span>
                                        تسجيل ذاتي سريع
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                                        <span className="w-1.5 h-1.5 bg-[#C6A75E] rounded-full"></span>
                                        مضيف متجاوب ومتميز
                                    </div>
                                </div>
                            </section>

                            {/* Description */}
                            <section>
                                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-4">
                                    <span className="w-1 h-8 bg-[#003580] rounded-full"></span>
                                    تـفاصيل الإقـامة
                                </h2>
                                <p className="text-lg text-slate-400 font-light leading-[2] whitespace-pre-line">
                                    {listing.description}
                                </p>
                            </section>

                            {/* Features */}
                            <section>
                                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                                    <span className="w-1 h-8 bg-[#C6A75E] rounded-full"></span>
                                    تجهيزات المـنزل
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {listing.metadata?.features?.map((f: string) => (
                                        <div key={f} className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#C6A75E]/30 hover:bg-white/[0.05] transition-all group cursor-default">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                {featureIcons[f] || '💎'}
                                            </div>
                                            <span className="text-white font-bold">{featureLabels[f] || f}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* House Rules */}
                            <section>
                                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                                    <span className="w-1 h-8 bg-orange-500 rounded-full"></span>
                                    قواعد المنزل
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center space-y-2">
                                        <div className="text-2xl">🕐</div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">تسجيل الوصول</div>
                                        <div className="text-white font-bold">بعد 15:00</div>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center space-y-2">
                                        <div className="text-2xl">🕐</div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">تسجيل المغادرة</div>
                                        <div className="text-white font-bold">قبل 11:00</div>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center space-y-2">
                                        <div className="text-2xl">🐾</div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">حيوانات أليفة</div>
                                        <div className="text-white font-bold">غير مسموح</div>
                                    </div>
                                </div>
                            </section>

                            {/* Location */}
                            <section>
                                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                                    <span className="w-1 h-8 bg-emerald-500 rounded-full"></span>
                                    الموقع
                                </h2>
                                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-[#C6A75E]/10 rounded-2xl flex items-center justify-center text-2xl border border-[#C6A75E]/20">📍</div>
                                        <div>
                                            <div className="text-white font-bold text-lg">{listing.city}، الجزائر</div>
                                            <div className="text-slate-500 text-sm">{listing.address || 'حي سكني هادئ'}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">🏪 محلات تجارية قريبة</span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">🏥 مستشفى قريب</span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">🚌 مواصلات عامة</span>
                                    </div>
                                </div>
                            </section>

                            {/* Host Card */}
                            <section className="bg-gradient-to-br from-[#111827] to-[#0a0e1a] rounded-3xl p-10 border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A75E]/10 blur-[100px] rounded-full"></div>
                                <div className="relative flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-24 h-24 bg-white/5 rounded-[28px] flex items-center justify-center text-white text-4xl font-black shadow-2xl border border-white/10 shrink-0 overflow-hidden">
                                        <span className="text-[#C6A75E]">{listing.provider?.businessName?.[0] || 'ر'}</span>
                                    </div>
                                    <div className="flex-1 space-y-3 text-center md:text-right">
                                        <div className="inline-block px-4 py-1.5 bg-[#C6A75E]/10 text-[#C6A75E] rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-1 border border-[#C6A75E]/20">
                                            مـضيف مـوثوق ✅
                                        </div>
                                        <h3 className="text-2xl font-black text-white">{listing.provider?.businessName}</h3>
                                        <p className="text-slate-400 font-light leading-relaxed">
                                            يعمل المضيف على توفير تجربة سكنية مريحة تحاكي بيئة المنزل مع الاهتمام بكافة التفاصيل.
                                        </p>
                                        <div className="flex items-center gap-4 justify-center md:justify-start pt-2">
                                            <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">⚡ معدل الرد: أقل من ساعة</span>
                                            <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">💬 يتحدث: العربية، الفرنسية</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar Booking */}
                        <aside className="relative">
                            <BookingForm listing={listing} />
                        </aside>
                    </div>
                </div>
            </main>

            {/* Bottom CTA for Mobile */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0e1a]/95 backdrop-blur-xl border-t border-white/10 p-4 z-50">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-black text-white">{(listing.basePrice ?? 0).toLocaleString()}</span>
                        <span className="text-slate-400 text-sm font-bold mr-1">دج / ليلة</span>
                    </div>
                    <a href="#booking-section" className="bg-[#003580] hover:bg-[#002b66] text-white font-black py-3.5 px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/30">
                        احجز الآن
                    </a>
                </div>
            </div>
        </div>
    );
}
