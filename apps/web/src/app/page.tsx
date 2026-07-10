'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import PremiumNavbar from '@/components/PremiumNavbar';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { BrandLogoStacked } from '@/components/BrandLogoLockup';
import DestinationSelect from '@/components/DestinationSelect';

const DateRangePicker = dynamic(() => import('@/components/DateRangePicker'), { ssr: false });

/* ═══════════════════════════════════════
   DATA
   ═══════════════════════════════════════ */

const SERVICE_TABS = [
    { id: 'stays', icon: '🏨', label: 'الإقامات', active: true },
    { id: 'taxi', icon: '🚕', label: 'تاكسي المطار', active: true },
    { id: 'food', icon: '🍽️', label: 'المأكولات', active: true },
    { id: 'attractions', icon: '🎭', label: 'المعالم السياحية', active: false },
    { id: 'car', icon: '🚗', label: 'استئجار سيارة', active: false },
];

const TRUST_SIGNALS = [
    { icon: '💳', title: 'احجز الآن، ادفع لاحقاً', desc: 'إلغاء مجاني على معظم الغرف' },
    { icon: '🏠', title: 'أكثر من 500 مكان إقامة', desc: 'فنادق وبيوت ضيافة وشقق وأكثر' },
    { icon: '⭐', title: '10,000+ تقييم من مسافرين', desc: 'احصل على معلومات موثوقة من ضيوف حقيقيين' },
    { icon: '🎧', title: 'خدمة عملاء على مدار الساعة', desc: 'نحن هنا لتقديم المساعدة في أي وقت' },
];

const DESTINATIONS = [
    { name: 'الجزائر العاصمة', image: '/images/destinations/algiers.png', properties: 124, badge: 'الأكثر طلباً' },
    { name: 'وهران', image: '/images/destinations/oran.png', properties: 89, badge: null },
    { name: 'قسنطينة', image: '/images/destinations/constantine.png', properties: 67, badge: null },
    { name: 'غرداية', image: '/images/destinations/ghardaia.png', properties: 45, badge: 'تراث عالمي' },
    { name: 'جيجل', image: '/images/destinations/jijel.png', properties: 78, badge: 'شواطئ ساحرة' },
    { name: 'بجاية', image: '/images/destinations/bejaia.png', properties: 56, badge: null },
];

const PROPERTY_TYPES = [
    { icon: '🏨', name: 'فنادق', count: 230, color: '#003580' },
    { icon: '🏠', name: 'شقق مفروشة', count: 180, color: '#0071c2' },
    { icon: '🏡', name: 'فيلات', count: 65, color: '#00a698' },
    { icon: '🕌', name: 'رياضات تقليدية', count: 42, color: '#c6a75e' },
    { icon: '🏘️', name: 'بيوت ضيافة', count: 95, color: '#7c3aed' },
];

const DEALS = [
    {
        title: 'عرض الربيع الجزائري',
        desc: 'خصم يصل إلى 25% على الإقامات في المدن الساحلية',
        discount: 25,
        image: '/images/destinations/jijel.png',
        deadline: 'ينتهي بعد 3 أيام',
        tag: 'عرض حصري',
    },
    {
        title: 'باقة شهر العسل',
        desc: 'إقامة فاخرة + عشاء رومانسي + خدمة VIP',
        discount: 15,
        image: '/images/destinations/oran.png',
        deadline: 'ينتهي بعد 7 أيام',
        tag: 'الأكثر مبيعاً',
    },
    {
        title: 'اكتشف الصحراء',
        desc: 'رحلة ثلاثة أيام إلى غرداية مع إقامة وتنقل',
        discount: 20,
        image: '/images/destinations/ghardaia.png',
        deadline: 'ينتهي بعد 5 أيام',
        tag: 'مغامرة',
    },
];

/* ═══════════════════════════════════════
   RATING BADGE (Booking.com style)
   ═══════════════════════════════════════ */
function RatingBadge({ score, reviews }: { score: number; reviews: number }) {
    const label = score >= 9 ? 'استثنائي' : score >= 8 ? 'ممتاز' : score >= 7 ? 'جيد جداً' : 'جيد';
    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white">{label}</span>
                <span className="text-[10px] text-slate-400">{reviews.toLocaleString()} تقييم</span>
            </div>
            <div className="w-9 h-9 rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-[#003580] flex items-center justify-center text-white font-black text-sm">
                {score.toFixed(1)}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════
   COUNTDOWN TIMER
   ═══════════════════════════════════════ */
function CountdownTimer({ days }: { days: number }) {
    const [timeLeft, setTimeLeft] = useState({ d: days, h: 12, m: 45, s: 30 });

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                let { d, h, m, s } = prev;
                s--;
                if (s < 0) { s = 59; m--; }
                if (m < 0) { m = 59; h--; }
                if (h < 0) { h = 23; d--; }
                if (d < 0) return { d: 0, h: 0, m: 0, s: 0 };
                return { d, h, m, s };
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-1.5 direction-ltr">
            {[
                { val: timeLeft.d, label: 'يوم' },
                { val: timeLeft.h, label: 'سا' },
                { val: timeLeft.m, label: 'د' },
                { val: timeLeft.s, label: 'ث' },
            ].map((unit, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[36px] text-center">
                        <span className="text-white font-black text-sm tabular-nums">{String(unit.val).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[8px] text-slate-400 mt-0.5">{unit.label}</span>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════ */
export default function BookingInspiredHomePage() {
    const router = useRouter();
    const [searchCity, setSearchCity] = useState('');
    const [searchDates, setSearchDates] = useState('');
    const [guests, setGuests] = useState(2);
    const [rooms, setRooms] = useState(1);
    const [activeTab, setActiveTab] = useState('stays');
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const destinationsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchFeaturedListings = async () => {
            try {
                const { data } = await api.get('/listings', {
                    params: { limit: 8, sortBy: 'rating_desc' }
                });
                setListings(data.data || []);
            } catch {
                setListings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedListings();
    }, []);

    const handleSearch = () => {
        const query = new URLSearchParams();
        if (searchCity) query.set('city', searchCity);
        if (searchDates) query.set('dates', searchDates);
        if (guests) query.set('guests', String(guests));
        router.push(activeTab === 'taxi' ? `/taxi?${query}` : activeTab === 'food' ? `/food?${query}` : `/homes?${query}`);
    };

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const scrollDestinations = (dir: 'left' | 'right') => {
        destinationsRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden font-sans">
            <PremiumNavbar />

            {/* ═══════ HERO + SEARCH ═══════ */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                {/* Hero Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#003580] via-[#001d4a]/90 to-[#0a0e1a]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,167,94,0.08)_0%,transparent_60%)]"></div>
                    {/* Animated particles */}
                    <div className="absolute w-96 h-96 rounded-full bg-[#C6A75E]/5 blur-[120px] top-[-10%] right-[10%] animate-float-slow"></div>
                    <div className="absolute w-72 h-72 rounded-full bg-[#003580]/30 blur-[100px] bottom-[10%] left-[5%] animate-float-slower"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Hero Text */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2.5 mb-8">
                            <span className="w-2 h-2 bg-[#C6A75E] rounded-full animate-pulse shadow-[0_0_10px_#C6A75E]"></span>
                            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#C6A75E]">
                                الرفيق — منصة الحجز الجزائرية الأولى
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black mb-6 leading-[1.1] tracking-tight">
                            <span className="block">ابحث عن إقامتك</span>
                            <span className="block bg-gradient-to-r from-[#C6A75E] to-[#e8d5a0] bg-clip-text text-transparent">
                                المثالية في الجزائر
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-200/70 max-w-2xl mx-auto font-light">
                            استكشف العروض على الفنادق والمنازل وأكثر من ذلك بكثير
                        </p>
                    </div>

                    {/* ═══ SERVICE TABS (Booking-style) ═══ */}
                    <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                        {SERVICE_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => tab.active && setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'bg-white/15 border-white/30 text-white shadow-lg shadow-white/5'
                                        : tab.active
                                            ? 'border-white/10 text-white/60 hover:bg-white/5 hover:text-white/80'
                                            : 'border-white/5 text-white/30 cursor-not-allowed'
                                }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                {tab.label}
                                {!tab.active && <span className="text-[9px] bg-white/10 rounded px-1.5 py-0.5">قريباً</span>}
                            </button>
                        ))}
                    </div>

                    {/* ═══ SEARCH BAR (Booking.com inspired) ═══ */}
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-[#C6A75E] p-1 rounded-2xl shadow-[0_20px_60px_rgba(198,167,94,0.3)]">
                            <div className="bg-[#1a1f2e] rounded-xl p-1 flex flex-col lg:flex-row items-stretch gap-0">
                                {/* Destination */}
                                <div className="flex-[1.5] group relative transition-all">
                                    <div 
                                        className="flex items-center gap-4 px-6 py-5 rounded-2xl hover:bg-white/5 transition-all cursor-text" 
                                        onClick={() => document.getElementById('dest-input')?.focus()}
                                    >
                                        <div className="w-11 h-11 rounded-2xl bg-[#003580]/30 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                                            🏨
                                        </div>
                                        <div className="flex flex-col flex-1 text-right">
                                            <label className="text-[10px] font-black text-[#C6A75E] uppercase tracking-[0.2em] mb-1">ما هي وجهتك؟</label>
                                            <DestinationSelect value={searchCity} onChange={setSearchCity} />
                                        </div>
                                    </div>
                                </div>

                                {/* Separator */}
                                <div className="hidden lg:flex items-center"><div className="w-px h-12 bg-white/10"></div></div>

                                {/* Date */}
                                <div className="flex-1 group relative transition-all">
                                    <div className="flex items-center gap-4 px-6 py-5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer">
                                        <div className="w-11 h-11 rounded-2xl bg-[#003580]/30 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                                            📅
                                        </div>
                                        <div className="flex flex-col flex-1 text-right">
                                            <label className="text-[10px] font-black text-[#C6A75E] uppercase tracking-[0.2em] mb-1">تاريخ الإقامة</label>
                                            <DateRangePicker value={searchDates} onChange={setSearchDates} />
                                        </div>
                                    </div>
                                </div>


                                {/* Separator */}
                                <div className="hidden lg:flex items-center"><div className="w-px h-12 bg-white/10"></div></div>

                                {/* Guests & Rooms */}
                                <div className="flex-1 flex items-center gap-4 px-6 py-5 rounded-xl hover:bg-white/5 transition-all">
                                    <div className="w-11 h-11 rounded-xl bg-[#003580]/30 flex items-center justify-center text-xl shrink-0">
                                        👥
                                    </div>
                                    <div className="flex flex-col flex-1 text-right">
                                        <label className="text-[10px] font-bold text-[#C6A75E] uppercase tracking-[0.2em] mb-1">الأفراد · الغرف</label>
                                        <div className="flex items-center gap-3 text-white text-sm">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C6A75E] transition-colors font-bold text-xs">−</button>
                                                <span className="font-bold min-w-[16px] text-center">{guests}</span>
                                                <button onClick={() => setGuests(guests + 1)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C6A75E] transition-colors font-bold text-xs">+</button>
                                            </div>
                                            <span className="text-slate-500">·</span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C6A75E] transition-colors font-bold text-xs">−</button>
                                                <span className="font-bold min-w-[16px] text-center">{rooms}</span>
                                                <button onClick={() => setRooms(rooms + 1)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C6A75E] transition-colors font-bold text-xs">+</button>
                                            </div>
                                            <span className="text-xs text-slate-500">غرفة</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Search Button */}
                                <div className="p-2 flex items-center">
                                    <button
                                        onClick={handleSearch}
                                        className="bg-[#003580] hover:bg-[#00264d] text-white font-black px-10 py-4 lg:px-8 rounded-xl transition-all duration-300 shadow-lg shadow-[#003580]/40 hover:shadow-xl active:scale-95 flex items-center gap-3 w-full lg:w-auto justify-center text-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        ابحث
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ TRUST SIGNALS BAR ═══════ */}
            <section className="py-10 bg-[#0f1424] border-y border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {TRUST_SIGNALS.map((signal, i) => (
                            <div key={i} className="flex items-start gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C6A75E]/20 to-[#C6A75E]/5 border border-[#C6A75E]/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                    {signal.icon}
                                </div>
                                <div className="text-right">
                                    <h4 className="text-sm font-bold text-white mb-1">{signal.title}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">{signal.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ TRENDING DESTINATIONS ═══════ */}
            <section className="py-16 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-right">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">الوجهات الرائجة 🔥</h2>
                            <p className="text-slate-400 text-sm">وجهات مفضلة لدى المسافرين الجزائريين</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => scrollDestinations('right')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white">
                                →
                            </button>
                            <button onClick={() => scrollDestinations('left')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white">
                                ←
                            </button>
                        </div>
                    </div>

                    <div
                        ref={destinationsRef}
                        className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {DESTINATIONS.map((dest, i) => (
                            <Link
                                key={i}
                                href={`/homes?city=${encodeURIComponent(dest.name)}`}
                                className="relative min-w-[280px] md:min-w-[320px] h-[380px] rounded-3xl overflow-hidden group snap-start shrink-0"
                            >
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                {dest.badge && (
                                    <div className="absolute top-4 right-4 bg-[#C6A75E] text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
                                        {dest.badge}
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="text-2xl font-black text-white mb-1">{dest.name}</h3>
                                    <p className="text-sm text-white/70">{dest.properties} مكان إقامة</p>
                                    <div className="mt-3 flex items-center gap-2 text-[#C6A75E] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span>استكشف الآن</span>
                                        <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ BROWSE BY PROPERTY TYPE ═══════ */}
            <section className="py-16 bg-[#0f1424]/50 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-right mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">تصفح حسب نوع مكان الإقامة</h2>
                        <p className="text-slate-400 text-sm">اختر نوع الإقامة المفضل لديك</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {PROPERTY_TYPES.map((type, i) => (
                            <Link
                                key={i}
                                href={`/homes?type=${type.name}`}
                                className="group bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center hover:border-white/20 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">
                                    {type.icon}
                                </div>
                                <h3 className="font-bold text-white text-base mb-1">{type.name}</h3>
                                <p className="text-xs text-slate-400">{type.count} مكان إقامة</p>
                                <div className="mt-3 w-full h-1 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700 group-hover:w-full w-0" style={{ backgroundColor: type.color }}></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ DEALS & OFFERS ═══════ */}
            <section className="py-16 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between mb-10">
                        <div className="text-right">
                            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">عروض محدودة المدة</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">عروض لا تُفوّت 🎁</h2>
                            <p className="text-slate-400 text-sm">وفّر المال مع عروضنا الحصرية</p>
                        </div>
                        <Link href="/homes" className="hidden md:flex items-center gap-2 text-[#C6A75E] text-sm font-bold hover:gap-3 transition-all">
                            عرض جميع العروض
                            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {DEALS.map((deal, i) => (
                            <Link
                                key={i}
                                href="/homes"
                                className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/5 hover:border-[#C6A75E]/30 transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img src={deal.image} alt={deal.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent"></div>

                                    {/* Discount Badge */}
                                    <div className="absolute top-4 left-4 bg-red-500 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-lg shadow-red-500/30">
                                        −{deal.discount}%
                                    </div>

                                    {/* Tag */}
                                    <div className="absolute top-4 right-4 bg-[#C6A75E] text-white text-[10px] font-black px-3 py-1 rounded-lg">
                                        {deal.tag}
                                    </div>
                                </div>

                                <div className="p-6 text-right">
                                    <h3 className="text-xl font-black text-white mb-2 group-hover:text-[#C6A75E] transition-colors">{deal.title}</h3>
                                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{deal.desc}</p>
                                    <div className="flex items-center justify-between">
                                        <CountdownTimer days={i === 0 ? 3 : i === 1 ? 7 : 5} />
                                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full">{deal.deadline}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ FEATURED LISTINGS ═══════ */}
            <section className="py-16 bg-[#0f1424]/50 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between mb-10">
                        <div className="text-right">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">إقامات تليق بكم ✨</h2>
                            <p className="text-slate-400 text-sm">أماكن إقامة مختارة بعناية من فريق الرفيق</p>
                        </div>
                        <Link href="/hotels" className="hidden md:flex items-center gap-2 text-[#C6A75E] text-sm font-bold hover:gap-3 transition-all">
                            استكشف كافة القائمة
                            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-[420px] rounded-2xl bg-white/5 animate-pulse"></div>
                            ))
                        ) : listings.length > 0 ? (
                            listings.slice(0, 4).map((listing) => (
                                <Link
                                    key={listing.id}
                                    href={`/${listing.type === 'HOTEL' ? 'hotels' : 'homes'}/${listing.id}`}
                                    className="group rounded-2xl overflow-hidden bg-[#151a2d] border border-white/5 hover:border-[#C6A75E]/30 transition-all duration-500 hover:-translate-y-2 flex flex-col"
                                >
                                    {/* Image */}
                                    <div className="relative h-52 overflow-hidden bg-[#1a1f2e]">
                                        {listing.images?.[0] ? (
                                            <img
                                                src={listing.images[0].thumbnailUrl || listing.images[0].url}
                                                alt={listing.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">
                                                {listing.type === 'HOTEL' ? '🏨' : '🏠'}
                                            </div>
                                        )}

                                        {/* Heart Favorite */}
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(listing.id); }}
                                            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all z-10"
                                        >
                                            <svg className={`w-5 h-5 transition-colors ${favorites.has(listing.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>

                                        {/* Badges */}
                                        {listing.isFeatured && (
                                            <div className="absolute top-3 right-3 bg-[#C6A75E] text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg">
                                                موصى به
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 text-right flex flex-col flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <RatingBadge score={listing.rating || 8.5} reviews={listing.reviewCount || 127} />
                                            <div className="flex-1 text-right mr-3">
                                                <div className="flex items-center gap-1.5 text-[#C6A75E] text-[10px] font-bold mb-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    {listing.city}
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#C6A75E] transition-colors line-clamp-2 flex-1">
                                            {listing.title}
                                        </h3>

                                        {/* Features */}
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {(listing.features || []).slice(0, 3).map((f: string, idx: number) => (
                                                <span key={idx} className="text-[10px] bg-white/5 text-slate-400 px-2 py-1 rounded-md">
                                                    {f === 'wifi' ? '📶 واي فاي' : f === 'parking' ? '🅿️ موقف' : f === 'pool' ? '🏊 مسبح' : f === 'air_conditioning' ? '❄️ تكييف' : f}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Price */}
                                        <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                                            <div className="text-left">
                                                <span className="text-xs text-slate-500 block">يبدأ من</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-white">{(listing.basePrice ?? 0).toLocaleString()}</span>
                                                    <span className="text-xs text-slate-400">دج / ليلة</span>
                                                </div>
                                            </div>
                                            <div className="bg-[#003580]/10 text-[#4a9eff] text-[10px] font-bold px-3 py-1 rounded-lg">
                                                إلغاء مجاني
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            /* Placeholder cards when no listings */
                            [
                                { title: 'فندق الأوراسي', city: 'الجزائر', price: 12000, rating: 8.7, emoji: '🏨' },
                                { title: 'شقة فاخرة على البحر', city: 'وهران', price: 8500, rating: 9.1, emoji: '🏠' },
                                { title: 'رياض تقليدي', city: 'غرداية', price: 6000, rating: 9.4, emoji: '🕌' },
                                { title: 'فيلا مع مسبح', city: 'جيجل', price: 15000, rating: 8.9, emoji: '🏡' },
                            ].map((item, i) => (
                                <Link
                                    key={i}
                                    href="/homes"
                                    className="group rounded-2xl overflow-hidden bg-[#151a2d] border border-white/5 hover:border-[#C6A75E]/30 transition-all duration-500 hover:-translate-y-2 flex flex-col"
                                >
                                    <div className="relative h-52 bg-gradient-to-br from-[#1a2040] to-[#0f1424] flex items-center justify-center">
                                        <span className="text-7xl opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500">{item.emoji}</span>
                                        <button className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center z-10">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                        {i === 0 && <div className="absolute top-3 right-3 bg-[#C6A75E] text-white text-[10px] font-black px-3 py-1 rounded-lg">موصى به</div>}
                                    </div>
                                    <div className="p-5 text-right flex flex-col flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <RatingBadge score={item.rating} reviews={Math.floor(Math.random() * 500 + 50)} />
                                            <div className="flex-1 text-right mr-3">
                                                <div className="flex items-center gap-1.5 text-[#C6A75E] text-[10px] font-bold mb-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    {item.city}
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#C6A75E] transition-colors flex-1">{item.title}</h3>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-1 rounded-md">📶 واي فاي</span>
                                            <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-1 rounded-md">❄️ تكييف</span>
                                            <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-1 rounded-md">🅿️ موقف</span>
                                        </div>
                                        <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                                            <div className="text-left">
                                                <span className="text-xs text-slate-500 block">يبدأ من</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-white">{item.price.toLocaleString()}</span>
                                                    <span className="text-xs text-slate-400">دج / ليلة</span>
                                                </div>
                                            </div>
                                            <div className="bg-[#003580]/10 text-[#4a9eff] text-[10px] font-bold px-3 py-1 rounded-lg">إلغاء مجاني</div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════ WHY RAFIIK SECTION ═══════ */}
            <section className="py-20 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                            لماذا <span className="bg-gradient-to-r from-[#C6A75E] to-[#e8d5a0] bg-clip-text text-transparent">الرفيق</span>؟
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">منصتكم الموثوقة لتجربة سياحية لا تُنسى في الجزائر</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                icon: '🔍',
                                title: 'ابحث واختر',
                                desc: 'تصفح مئات العقارات المختارة بعناية عبر 48 ولاية جزائرية مع فلاتر ذكية وصور حقيقية.',
                            },
                            {
                                step: '02',
                                icon: '🔒',
                                title: 'احجز بأمان',
                                desc: 'نظام حجز متطور يضمن خصوصيتكم ومعاملاتكم بأمان تام واحترافية عالية.',
                            },
                            {
                                step: '03',
                                icon: '✨',
                                title: 'عش التجربة',
                                desc: 'استمتع بإقامة استثنائية مع ضمان الجودة ودعم متوفر على مدار الساعة.',
                            },
                        ].map((item) => (
                            <div key={item.step} className="relative group">
                                <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-3xl p-10 hover:border-[#C6A75E]/30 transition-all duration-500 hover:-translate-y-2 text-center">
                                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-[#003580] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[#003580]/30">
                                        {item.step}
                                    </div>
                                    <div className="text-6xl mb-8 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                                    <h3 className="text-2xl font-black text-white mb-4 group-hover:text-[#C6A75E] transition-colors">{item.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ STATS BAR ═══════ */}
            <section className="py-16 bg-gradient-to-r from-[#003580] to-[#001d4a] relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(198,167,94,0.08),transparent_60%)]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { val: '500+', label: 'إقامة موثقة', icon: '🏠' },
                            { val: '48', label: 'ولاية مغطاة', icon: '🗺️' },
                            { val: '10K+', label: 'عميل سعيد', icon: '😊' },
                            { val: '4.9', label: 'متوسط التقييم', icon: '⭐' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center group">
                                <div className="text-3xl mb-3">{stat.icon}</div>
                                <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-500">
                                    {stat.val}
                                </div>
                                <div className="text-sm text-blue-200/60 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ NEWSLETTER (Booking-style) ═══════ */}
            <section className="py-16 relative z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-16">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">وفّر المال واحصل على أفضل العروض!</h2>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto">سجّل بريدك الإلكتروني وسنرسل لك أفضل الصفقات والعروض الحصرية مباشرة</p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="أدخل بريدك الإلكتروني"
                                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-500 outline-none focus:border-[#C6A75E]/50 transition-colors text-right"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button className="bg-[#003580] hover:bg-[#00264d] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-[#003580]/30 active:scale-95 shrink-0">
                                اشترك الآن
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-4">يمكنك إلغاء الاشتراك في أي وقت. نحن نحترم خصوصيتك.</p>
                    </div>
                </div>
            </section>

            {/* ═══════ CTA SECTION ═══════ */}
            <section className="py-20 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,167,94,0.05),transparent_70%)]"></div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black mb-6">
                        ابدأ مسيرتك في عالم{' '}
                        <span className="bg-gradient-to-r from-[#C6A75E] to-[#e8d5a0] bg-clip-text text-transparent">الرفيق</span>
                    </h2>
                    <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
                        كن جزءاً من مجتمع المسافرين واحظى بتجربة مستخدم لم تسبقها مثيل في الجزائر.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/register" className="bg-[#C6A75E] hover:bg-[#b5963f] text-white font-bold px-12 py-5 rounded-2xl transition-all shadow-lg shadow-[#C6A75E]/20 active:scale-95 text-lg">
                            سـجل الآن مجاناً
                        </Link>
                        <Link href="/register?type=provider" className="bg-white/10 border border-white/10 hover:bg-white/15 text-white font-bold px-12 py-5 rounded-2xl transition-all active:scale-95 text-lg">
                            اعرض عقارك على الرفيق
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════ RICH FOOTER (Booking-style) ═══════ */}
            <footer className="py-20 bg-[#070a14] border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
                        {/* Brand */}
                        <div className="col-span-2 md:col-span-1 text-right">
                            <Link href="/" className="inline-flex flex-col items-end group hover:opacity-90 transition-opacity mb-6">
                                <BrandLogoStacked size="default" />
                            </Link>
                            <p className="text-sm text-slate-500 leading-7 mt-4">
                                منصتكم الأولى لحجز الإقامات والخدمات السياحية في الجزائر.
                            </p>
                        </div>

                        {/* خدماتنا */}
                        <div className="text-right">
                            <h4 className="text-white font-bold mb-6 text-sm">خدماتنا</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><Link href="/hotels" className="hover:text-[#C6A75E] transition-colors">الفنادق والمنتجعات</Link></li>
                                <li><Link href="/homes" className="hover:text-[#C6A75E] transition-colors">الإقامات الخاصة</Link></li>
                                <li><Link href="/food" className="hover:text-[#C6A75E] transition-colors">التجارب الموسيقية</Link></li>
                                <li><Link href="/taxi" className="hover:text-[#C6A75E] transition-colors">التنقل الفاخر</Link></li>
                            </ul>
                        </div>

                        {/* الدعم */}
                        <div className="text-right">
                            <h4 className="text-white font-bold mb-6 text-sm">الدعم والمساعدة</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><Link href="/faq" className="hover:text-[#C6A75E] transition-colors">الأسئلة الشائعة</Link></li>
                                <li><Link href="/contact" className="hover:text-[#C6A75E] transition-colors">اتصل بنا</Link></li>
                                <li><Link href="/terms" className="hover:text-[#C6A75E] transition-colors">شروط الاستخدام</Link></li>
                                <li><Link href="/privacy" className="hover:text-[#C6A75E] transition-colors">سياسة الخصوصية</Link></li>
                            </ul>
                        </div>

                        {/* الشركة */}
                        <div className="text-right">
                            <h4 className="text-white font-bold mb-6 text-sm">الشركة</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><Link href="/about" className="hover:text-[#C6A75E] transition-colors">من نحن</Link></li>
                                <li><Link href="/careers" className="hover:text-[#C6A75E] transition-colors">وظائف</Link></li>
                                <li><Link href="/press" className="hover:text-[#C6A75E] transition-colors">الصحافة</Link></li>
                                <li><Link href="/register?type=provider" className="hover:text-[#C6A75E] transition-colors">اعرض عقارك</Link></li>
                            </ul>
                        </div>

                        {/* التواصل */}
                        <div className="text-right">
                            <h4 className="text-white font-bold mb-6 text-sm">تواصلوا معنا</h4>
                            <div className="space-y-3 text-sm text-slate-500">
                                <p>📧 support@rafiik.dz</p>
                                <p>📞 +213 555 123 456</p>
                                <div className="flex gap-3 justify-end mt-4">
                                    {['Facebook', 'Instagram', 'Twitter'].map((s) => (
                                        <a key={s} href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-[#C6A75E]/10 hover:text-[#C6A75E] hover:border-[#C6A75E]/20 transition-all text-xs font-bold">
                                            {s[0]}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-xs text-slate-600">
                            © 2026 الرفيق — جميع الحقوق محفوظة. صنع بـ ❤️ في الجزائر 🇩🇿
                        </p>
                        <div className="flex gap-6 text-xs text-slate-600">
                            <span>DZD - دينار جزائري</span>
                            <span>العربية</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ═══════ GLOBAL STYLES ═══════ */}
            <style jsx global>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                @keyframes float-slower {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(20px) scale(0.95); }
                }
                .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
                .animate-float-slower { animation: float-slower 14s ease-in-out infinite; }

                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

                .direction-ltr { direction: ltr; }
                .tabular-nums { font-variant-numeric: tabular-nums; }
            `}</style>
        </div>
    );
}
