'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Gallery from '@/components/Gallery';
import BookingForm from '@/components/BookingForm';
import PremiumNavbar from '@/components/PremiumNavbar';

// Icons mapping for hotels
const amenityIcons: Record<string, string> = {
    wifi: '📶',
    parking: '🅿️',
    pool: '🏊',
    gym: '💪',
    breakfast: '🍳',
    air_conditioning: '❄️',
    restaurant: '🍴',
    spa: '🧖',
    room_service: '🛌',
};

const amenityLabels: Record<string, string> = {
    wifi: 'واي فاي مجاني',
    parking: 'موقف سيارات',
    pool: 'مسبح خارجي',
    gym: 'نادي رياضي',
    breakfast: 'إفطار متضمن',
    air_conditioning: 'تكييف مركزي',
    restaurant: 'مطعم في الفندق',
    spa: 'مركز سبا',
    room_service: 'خدمة غرف',
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
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
        </div>
    );
}

export default function HotelDetailsPage({ params }: { params: { id: string } }) {
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await api.get(`/listings/${params.id}`);
                setListing(data);
            } catch (err) {
                setError('فشل في تحميل تفاصيل الفندق. يرجى المحاولة مرة أخرى.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen section-padding py-12 animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-96 bg-gray-100 rounded-2xl mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-full"></div>
                        <div className="h-6 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-32 bg-gray-100 rounded w-full mt-8"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center section-padding">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-4">{error || 'لم يتم العثور على الفندق'}</h2>
                <Link href="/hotels" className="btn-secondary px-8">العودة إلى القائمة</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {/* Premium Navigation */}
            <PremiumNavbar />

            {/* Breadcrumbs */}
            <div className="pt-28">
                <div className="section-padding py-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                        <Link href="/" className="hover:text-[#833AB4] transition-colors">الـرئيسية</Link>
                        <span className="opacity-30">/</span>
                        <Link href="/hotels" className="hover:text-[#833AB4] transition-colors">الفـنادق</Link>
                        <span className="opacity-30">/</span>
                        <span className="text-[#111827]">{listing.title}</span>
                    </div>
                </div>
            </div>

            <main className="section-padding py-16">
                <div className="max-w-[1400px] mx-auto">
                    {/* Header Info */}
                    <div className="mb-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="space-y-4">
                                <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                                    {listing.metadata?.type || 'فندق عصري'}
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black text-[#111827] leading-tight">{listing.title}</h1>
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 shadow-sm">
                                        <StarRating rating={listing.avgRating} />
                                        <span className="font-black text-amber-900 text-xs">{listing.avgRating}</span>
                                        <span className="text-amber-700/60 text-[10px] uppercase font-bold">({listing.totalReviews} تـقييم)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#9CA3AF] font-bold">
                                        <span className="text-lg">📍</span>
                                        {listing.address ? listing.address + ', ' : ''}{listing.city}, {listing.wilaya}
                                    </div>
                                    {listing.isFeatured && (
                                        <span className="px-4 py-1 bg-[#111827] text-white rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-xl">
                                            الـخيار الـمميز ⭐
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Fast Actions */}
                            <div className="flex gap-4">
                                <button className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-[#111827] hover:border-[#111827] hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                </button>
                                <button className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-rose-50 hover:border-rose-100 hover:text-rose-500 transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Gallery Section */}
                    <div className="mb-24">
                        <Gallery images={listing.images} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-20">
                            {/* Description */}
                            <section>
                                <div className="text-[10px] font-black text-[#833AB4] uppercase tracking-[0.3em] mb-4">نـبذة عن الفـندق</div>
                                <h2 className="text-3xl font-black text-[#111827] mb-8 pb-4 border-b border-gray-100">تـفاصيل الإقـامة</h2>
                                <p className="text-xl text-gray-500 leading-relaxed font-light whitespace-pre-line">
                                    {listing.description}
                                </p>
                            </section>

                            {/* Amenities Grid */}
                            <section>
                                <div className="text-[10px] font-black text-[#833AB4] uppercase tracking-[0.3em] mb-4">المـرافق والخدمات</div>
                                <h2 className="text-3xl font-black text-[#111827] mb-10">مـا تـقدمه هذه المـنشأة لك</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {listing.metadata?.amenities?.map((a: string) => (
                                        <div key={a} className="flex items-center gap-6 p-6 rounded-[24px] bg-white border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
                                            <span className="text-3xl grayscale hover:grayscale-0 transition-all">{amenityIcons[a] || '💎'}</span>
                                            <span className="text-[#111827] font-bold text-lg">{amenityLabels[a] || a}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Provider Card */}
                            <section className="bg-[#111827] rounded-[40px] p-12 text-white relative overflow-hidden group">
                                <div className="absolute inset-0 bg-noise opacity-5"></div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-20 -mt-20"></div>

                                <div className="relative flex flex-col md:flex-row items-center gap-10">
                                    <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[32px] flex items-center justify-center text-white text-5xl font-black shadow-2xl">
                                        🏨
                                    </div>
                                    <div className="flex-1 space-y-3 text-center md:text-right">
                                        <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">شـريك فـندقي مـوثوق</div>
                                        <h3 className="text-3xl font-black">{listing.provider?.businessName}</h3>
                                        <p className="text-white/60 text-lg font-light leading-relaxed">نـلتزم بتقديم أعلى مـعايير الخدمة والاحترافية لـضيوف الرفيق.</p>
                                        <div className="flex items-center justify-center md:justify-start gap-4 mt-6 pt-6 border-t border-white/5">
                                            {listing.provider?.kycStatus === 'VERIFIED' && (
                                                <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                                                    مـؤمن بواسطة مـعايير الرفيق الـصارمة
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Sticky Booking Form */}
                        <aside className="relative">
                            <BookingForm listing={listing} />
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
