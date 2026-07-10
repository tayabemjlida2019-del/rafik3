'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import PremiumNavbar from '@/components/PremiumNavbar';
import dynamic from 'next/dynamic';

const AlgeriaMap3D = dynamic(() => import('@/components/AlgeriaMap3D'), { ssr: false });
const DateRangePicker = dynamic(() => import('@/components/DateRangePicker'), { ssr: false });
import { useRouter } from 'next/navigation';

// Star Rating Component
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-blue-500' : 'text-slate-700'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            <span className="text-xs text-slate-500 mr-1">({rating})</span>
        </div>
    );
}

// Feature data for services
const services = [
    {
        icon: '­ƒÅá',
        image: '/images/homes.jpg',
        title: '┘âÏ▒ÏºÏí Ïº┘ä┘à┘åÏºÏ▓┘ä',
        description: 'Ï┤┘é┘é ┘ê┘à┘åÏºÏ▓┘ä ┘à┘üÏ▒┘êÏ┤Ï® ┘ä┘äÏÑ┘èÏ¼ÏºÏ▒ ┘éÏÁ┘èÏ▒ Ïº┘ä┘àÏ»┘ë Ï¿Ï¼┘êÏ»Ï® Ï╣Ïº┘ä┘èÏ® ┘êÏúÏ│Ï╣ÏºÏ▒ ┘àÏ»Ï▒┘êÏ│Ï®',
        color: 'from-slate-700 to-slate-800',
        href: '/homes',
        available: true,
    },
    {
        icon: '­ƒÅ¿',
        image: '/images/hotels.jpg',
        title: 'Ï¡Ï¼Ï▓ Ïº┘ä┘ü┘åÏºÏ»┘é',
        description: 'Ïú┘üÏÂ┘ä Ïº┘ä┘ü┘åÏºÏ»┘é ┘êÏº┘ä┘à┘åÏ¬Ï¼Ï╣ÏºÏ¬ Ï╣Ï¿Ï▒ Ïº┘ä┘éÏÀÏ▒ Ïº┘ä┘êÏÀ┘å┘è ┘äÏÂ┘àÏº┘å Ï▒ÏºÏ¡Ï¬┘â┘à',
        color: 'from-blue-700 to-blue-800',
        href: '/hotels',
        available: true,
    },
    {
        icon: '­ƒì▓',
        image: '/images/food.jpg',
        title: 'Ïº┘ä┘àÏú┘â┘ê┘äÏºÏ¬',
        description: 'ÏúÏÀ┘ÇÏ¿Ïº┘é ÏúÏÁ┘Ç┘è┘äÏ® Ï¬ÏÁ┘ä ÏÑ┘ä┘ë Ï¿ÏºÏ¿ ┘à┘åÏ▓┘ä┘â Ï¿┘à┘åÏ¬┘ç┘ë Ïº┘äÏ│Ï▒Ï╣Ï® ┘êÏº┘äÏºÏ¡Ï¬Ï▒Ïº┘ü┘èÏ®',
        color: 'from-slate-600 to-slate-700',
        href: '/food',
        available: true,
    },
    {
        icon: '­ƒÜò',
        image: '/images/taxi.jpg',
        title: 'Ï│┘èÏºÏ▒ÏºÏ¬ Ïº┘äÏúÏ¼Ï▒Ï®',
        description: 'Ï¬┘å┘é┘ä Ï¿┘à┘åÏ¬┘ç┘ë Ïº┘äÏ│┘ç┘ê┘äÏ® ┘àÏ╣ Ï│ÏºÏª┘é┘è┘å ┘àÏ¡Ï¬Ï▒┘ü┘è┘å ┘ê┘à┘êÏ½┘ê┘é┘è┘å ┘ü┘è Ïú┘è ┘ê┘éÏ¬',
        color: 'from-blue-600 to-blue-700',
        href: '/taxi',
        available: true,
    },
];

const featureIcons: Record<string, string> = {
    wifi: '­ƒôÂ',
    parking: '­ƒà┐´©Å',
    sea_view: '­ƒîè',
    air_conditioning: 'ÔØä´©Å',
    kitchen: '­ƒì│',
    pool: '­ƒÅè',
    gym: '­ƒÆ¬',
    traditional_courtyard: '­ƒÅø´©Å',
    terrace: '­ƒîç',
    bay_view: '­ƒîà',
};

const stats = [
    { value: '500+', label: 'ÏÑ┘éÏº┘àÏ® ┘à┘Ç┘êÏ½┘ê┘éÏ®' },
    { value: '48', label: '┘ê┘äÏº┘èÏ® ┘à┘ÇÏ║ÏÀÏºÏ®' },
    { value: '10K+', label: 'Ï╣┘Ç┘à┘è┘ä ┘à┘ÇÏ│Ï¬┘ü┘èÏ»' },
    { value: '4.9', label: '┘à┘ÇÏ¬┘êÏ│ÏÀ Ïº┘ä┘ÇÏ¬┘é┘è┘è┘à' },
];

export default function HomePage() {
    const router = useRouter();
    const [searchCity, setSearchCity] = useState('');
    const [searchDates, setSearchDates] = useState('');
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const handleSearch = () => {
        const query = new URLSearchParams();
        if (searchCity) query.set('city', searchCity);
        if (searchDates) query.set('dates', searchDates);

        // Navigate to hotels if that's the default or based on some selection
        // For now, let's navigate to hotels page with these filters
        router.push(`/hotels?${query.toString()}`);
    };

    const fetchFeaturedListings = async () => {
        try {
            const { data } = await api.get('/listings', {
                params: { limit: 4, sortBy: 'rating_desc' }
            });
            setListings(data.data || []);
        } catch (error) {
            console.error('Failed to fetch featured listings:', error);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeaturedListings();
    }, []);

    return (
        <div className="min-h-screen bg-[#121417] text-[#E8EAED]">
            <PremiumNavbar />

            {/* Luxury Hero Section */}
            <section className="relative pt-48 pb-40 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/zellige-bg.png"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: 'brightness(0.3) saturate(0.8)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#121417]/80 via-[#121417]/50 to-[#121417]"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#121417]/70 to-transparent"></div>
                </div>

                {/* 3D Map Scene */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[700px] z-0 opacity-60">
                    <AlgeriaMap3D />
                </div>

                {/* Ambient Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#C6A75E]/5 blur-[180px] rounded-full z-0"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#8C6B2E]/5 blur-[180px] rounded-full z-0"></div>

                <div className="relative section-padding z-10">
                    <div className="max-w-5xl mx-auto text-center md:text-right">
                        <div className="inline-flex items-center gap-3 bg-[#1F2329]/80 border border-[#C6A75E]/20 backdrop-blur-xl rounded-full px-8 py-3 mb-12 shadow-2xl">
                            <span className="w-2.5 h-2.5 bg-[#C6A75E] rounded-full animate-pulse shadow-[0_0_10px_#C6A75E]"></span>
                            <span className="text-[#C6A75E] text-[11px] font-black tracking-[0.4em] uppercase">Ïº┘äÏ▒┘ü┘è┘é ÔÇö Ï¬Ï¼Ï▒Ï¿Ï® ÏºÏ│Ï¬Ï½┘åÏºÏª┘èÏ® ┘üÏºÏ«Ï▒Ï®</span>
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black text-white mb-10 leading-[1.1] tracking-tighter">
                            <span className="block mb-4">Ïº┘âÏ¬Ï┤┘ü Ï▒┘é┘è┘æ</span>
                            <span className="metallic-gold block">Ïº┘äÏÂ┘èÏº┘üÏ® Ïº┘äÏ¼Ï▓ÏºÏªÏ▒┘èÏ®</span>
                        </h1>

                        <p className="text-2xl md:text-3xl text-slate-400 mb-20 max-w-4xl md:ml-0 md:mr-auto font-light leading-relaxed">
                            Ï¿┘êÏºÏ¿Ï¬┘â┘à Ïº┘äÏ¡ÏÁÏ▒┘èÏ® ┘äÏúÏ▒┘é┘ë Ïº┘ä┘ü┘åÏºÏ»┘é ┘êÏº┘äÏ«Ï»┘àÏºÏ¬ ┘ü┘è ┘é┘äÏ¿ Ïº┘äÏ¼Ï▓ÏºÏªÏ▒. <br className="hidden md:block" /> Ï¬Ï¼Ï▒Ï¿Ï® Ï▒┘é┘à┘èÏ® ┘àÏÁ┘à┘àÏ® Ï¿ÏúÏ╣┘ä┘ë ┘àÏ╣Ïº┘è┘èÏ▒ Ïº┘äÏ▒┘é┘è ┘êÏº┘äÏ¼┘àÏº┘ä┘èÏ®.
                        </p>

                        {/* Luxury Search Bar */}
                        <div className="max-w-4xl mx-auto md:ml-0 md:mr-auto mb-24 glass-luxury rounded-[28px] p-4 flex flex-col md:flex-row items-center gap-4 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-[#C6A75E]/10">
                            <div className="flex-1 w-full px-10 py-6 flex items-center gap-5 border-b md:border-b-0 md:border-l border-white/5 group">
                                <span className="text-3xl opacity-80 group-hover:scale-110 transition-transform">­ƒôì</span>
                                <div className="flex flex-col items-start w-full text-right">
                                    <span className="text-[11px] font-black text-[#C6A75E] uppercase tracking-[0.3em] mb-2 opacity-80">Ïº┘ä┘êÏ¼┘çÏ® Ïº┘ä┘àÏ«Ï¬ÏºÏ▒Ï®</span>
                                    <input
                                        type="text"
                                        placeholder="Ïº┘ä┘éÏÁÏ¿Ï®Ïî ┘ê┘çÏ▒Ïº┘åÏî ┘éÏ│┘åÏÀ┘è┘åÏ®..."
                                        className="bg-transparent border-none outline-none text-white placeholder:text-slate-600 w-full font-bold text-xl"
                                        value={searchCity}
                                        onChange={(e) => setSearchCity(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 w-full px-10 py-6 flex items-center gap-5 text-right group">
                                <span className="text-3xl opacity-80 group-hover:scale-110 transition-transform">­ƒôà</span>
                                <div className="flex flex-col items-start w-full">
                                    <span className="text-[11px] font-black text-[#C6A75E] uppercase tracking-[0.3em] mb-2 opacity-80">Ï¬ÏºÏ▒┘èÏ« Ïº┘äÏÑ┘éÏº┘àÏ®</span>
                                    <DateRangePicker
                                        value={searchDates}
                                        onChange={setSearchDates}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSearch}
                                className="btn-gold w-full md:w-auto text-xl py-6 px-16 group relative overflow-hidden"
                            >
                                <span className="relative z-10">ÏºÏ¿Ï»Ïú Ïº┘äÏ▒Ï¡┘äÏ®</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-8">
                            <Link
                                href="/homes"
                                className="bg-slate-100 text-slate-950 font-bold py-4.5 px-12 rounded-xl transition-all duration-300 hover:bg-white text-lg group shadow-xl"
                            >
                                <span className="flex items-center gap-3">
                                    Ï¼┘ÇÏ▒Ï¿ Ïº┘äÏ«Ï»┘àÏºÏ¬ Ïº┘äÏó┘å
                                    <svg className="w-6 h-6 group-hover:translate-x-[-6px] transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </span>
                            </Link>

                            <Link href="#services" className="text-slate-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-[0.2em] border-b border-transparent hover:border-slate-400 pb-1">
                                ÏºÏ│Ï¬Ï╣┘ÇÏ▒ÏÂ ┘âÏº┘üÏ® Ïº┘äÏ«Ï»┘àÏºÏ¬
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Transition */}
            <div className="bg-[#1A1D22] border-y border-[#C6A75E]/10 py-24 relative overflow-hidden">
                <div className="zellige-pattern absolute inset-0 opacity-[0.02]"></div>
                <div className="section-padding relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center group border-l border-white/5 last:border-l-0 px-8">
                                <div className="text-5xl md:text-7xl font-black mb-4 group-hover:scale-110 transition-transform duration-700 tracking-tighter metallic-gold">
                                    {stat.value}
                                </div>
                                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-[#C6A75E] transition-colors">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <section id="services" className="py-40 relative bg-[#1A1D22]">
                <div className="zellige-pattern absolute inset-0 opacity-[0.02]"></div>
                <div className="section-padding relative">
                    <div className="flex flex-col md:flex-row-reverse items-start justify-between mb-24 gap-12">
                        <div className="max-w-3xl text-right">
                            <div className="inline-block px-5 py-2 bg-[#C6A75E]/10 border border-[#C6A75E]/20 text-[#C6A75E] rounded-lg text-[11px] font-black uppercase tracking-[0.4em] mb-8">
                                ÏúÏ▒┘é┘ë Ïº┘äÏ«Ï»┘àÏºÏ¬ Ïº┘ä┘àÏ«Ï¬ÏºÏ▒Ï®
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white mb-10">
                                Ï¬Ï¼Ï▒Ï¿Ï® Ï▒┘üÏº┘ç┘èÏ® ┘àÏÀ┘ä┘éÏ®
                            </h2>
                            <p className="text-2xl text-slate-400 leading-relaxed font-light">
                                ┘åÏ│Ï╣┘ë Ï»ÏºÏª┘àÏº┘ï ┘äÏ▒Ï¿ÏÀ┘â┘à Ï¿ÏúÏ╣┘ä┘ë ┘àÏ│Ï¬┘ê┘èÏºÏ¬ Ïº┘äÏ¼┘êÏ»Ï® ┘ü┘è Ïº┘äÏ¼Ï▓ÏºÏªÏ▒. <br className="hidden md:block" /> ┘à┘å Ïº┘ä┘ü┘åÏºÏ»┘é Ïº┘äÏ╣Ï▒┘è┘éÏ® ÏÑ┘ä┘ë Ïº┘äÏ«Ï»┘àÏºÏ¬ Ïº┘äÏ┤Ï«ÏÁ┘èÏ®Ïî "Ïº┘äÏ▒┘ü┘è┘é" ┘ç┘ê ┘êÏ¼┘çÏ¬┘â┘à ┘ä┘äÏ¬┘à┘èÏ▓.
                            </p>
                        </div>
                        <div className="h-px bg-[#C6A75E]/20 w-48 hidden md:block mt-24"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {services.map((service) => (
                            <Link
                                key={service.title}
                                href={service.href}
                                className={`card-3d group p-0 overflow-hidden flex flex-col items-center text-center ${!service.available ? 'grayscale opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <div className="w-full h-64 relative overflow-hidden group">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F2329] via-[#1F2329]/20 to-transparent"></div>
                                    <div className="absolute bottom-8 right-8 w-16 h-16 rounded-2xl glass-luxury flex items-center justify-center text-3xl shadow-2xl border-[#C6A75E]/20 group-hover:border-[#C6A75E]/60 transition-all duration-500">
                                        <span className="relative z-10">{service.icon}</span>
                                    </div>
                                </div>

                                <div className="p-12 pt-8">
                                    <h3 className="text-3xl font-black text-white mb-5 group-hover:text-[#C6A75E] transition-all tracking-tight">{service.title}</h3>
                                    <p className="text-slate-400 leading-relaxed mb-10 font-normal text-[15px] line-clamp-2">{service.description}</p>

                                    {service.available ? (
                                        <div className="flex items-center gap-4 text-[#C6A75E] font-black text-[11px] uppercase tracking-[0.34em] mt-auto group-hover:gap-6 transition-all border-b border-[#C6A75E]/20 pb-2">
                                            ÏºÏ│┘ÇÏ¬┘Ç┘â┘ÇÏ┤┘ü Ïº┘ä┘ÇÏ╣┘ÇÏº┘ä┘Ç┘à
                                            <svg className="w-5 h-5 group-hover:translate-x-[-8px] transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 mt-auto">┘éÏ▒┘èÏ¿Ïº┘ï ┘êÏ¡ÏÁÏ▒┘èÏº┘ï</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Listings */}
            <section className="py-40 bg-[#121417] relative">
                <div className="topographic-lines absolute inset-0 opacity-[0.03]"></div>
                <div className="section-padding relative z-10">
                    <div className="flex items-center justify-between mb-24">
                        <div className="text-right">
                            <div className="inline-block px-4 py-1.5 bg-[#C6A75E]/10 border border-[#C6A75E]/20 text-[#C6A75E] rounded-lg text-[11px] font-black uppercase tracking-[0.3em] mb-6">
                                ÏºÏ«┘ÇÏ¬┘Ç┘èÏºÏ▒ÏºÏ¬ Ïº┘ä┘å┘ÇÏ«┘ÇÏ¿┘ÇÏ®
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white">ÏÑ┘é┘ÇÏº┘àÏºÏ¬ Ï¬┘Ç┘ä┘è┘Ç┘é Ï¿┘Ç┘â</h2>
                        </div>
                        <Link href="/hotels" className="hidden md:flex items-center gap-4 text-[#C6A75E] font-black text-xs uppercase tracking-[0.3em] hover:gap-6 transition-all group">
                            ÏºÏ│Ï¬┘â┘ÇÏ┤┘ü ┘â┘ÇÏº┘ü┘ÇÏ® Ïº┘ä┘é┘ÇÏºÏª┘àÏ®
                            <svg className="w-5 h-5 rotate-180 group-hover:translate-x-[-8px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="card-3d h-[500px] animate-pulse"></div>
                            ))
                        ) : listings.length > 0 ? (
                            listings.map((listing) => (
                                <Link
                                    key={listing.id}
                                    href={`/${listing.type === 'HOTEL' ? 'hotels' : 'homes'}/${listing.id}`}
                                    className="card-3d overflow-hidden group border-white/5 flex flex-col h-full bg-[#1F2329]"
                                >
                                    <div className="relative h-72 bg-[#1A1D22] flex items-center justify-center overflow-hidden">
                                        {listing.images?.[0] ? (
                                            <img
                                                src={listing.images[0].thumbnailUrl || listing.images[0].url}
                                                alt={listing.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100"
                                            />
                                        ) : (
                                            <span className="text-8xl opacity-30">{listing.type === 'HOTEL' ? '­ƒÅ¿' : '­ƒÅá'}</span>
                                        )}
                                        {/* Badges */}
                                        <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
                                            {listing.isFeatured && (
                                                <span className="bg-[#C6A75E] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">┘à┘êÏÁ┘ë Ï¿┘ç</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-10 text-right flex flex-col flex-1">
                                        <div className="flex items-center gap-2 text-[#C6A75E] text-[11px] font-black uppercase tracking-[0.3em] mb-5">
                                            <span className="w-2.5 h-2.5 bg-[#C6A75E] rounded-full shadow-[0_0_10px_#C6A75E]"></span>
                                            {listing.city}
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-8 group-hover:text-[#C6A75E] transition-colors line-clamp-2 leading-tight flex-1">
                                            {listing.title}
                                        </h3>
                                        <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-3xl font-black text-white">{(listing.basePrice ?? 0).toLocaleString()}</span>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Ï»Ï¼ / ┘ä┘è┘äÏ®</span>
                                            </div>
                                            <div className="w-14 h-14 rounded-2xl border border-white/5 flex items-center justify-center text-slate-400 group-hover:bg-[#C6A75E] group-hover:text-white transition-all duration-500">
                                                <svg className="w-7 h-7 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center glass-luxury rounded-3xl border-[#C6A75E]/10">
                                <p className="text-slate-400 font-bold tracking-widest">┘äÏº Ï¬┘êÏ¼Ï» Ï╣Ï▒┘êÏÂ Ï¬┘ä┘è┘é Ï¿┘üÏ«Ïº┘àÏ¬┘â┘à Ï¡Ïº┘ä┘èÏº┘ï</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-48 relative bg-[#1A1D22]">
                <div className="section-padding relative">
                    <div className="text-center md:text-right mb-32 max-w-4xl mx-auto md:mr-0">
                        <div className="text-[11px] font-black text-[#C6A75E] uppercase tracking-[0.4em] mb-6">Ï▒Ï¡┘Ç┘äÏ¬┘Ç┘â ┘à┘ÇÏ╣┘Ç┘åÏº</div>
                        <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tight">
                            Ï¿┘ÇÏ│┘ÇÏºÏÀ┘ÇÏ® ┘ü┘è Ïº┘ä┘ÇÏ¬┘ÇÏ╣┘ÇÏº┘à┘ä <br /> <span className="metallic-gold">Ï▒┘é┘è┘æ ┘ü┘è Ïº┘äÏ«Ï»┘àÏ®</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-7xl mx-auto">
                        {[
                            { step: 'I', icon: '­ƒÆÄ', title: 'ÏºÏ«┘ÇÏ¬┘ÇÏ▒ Ïº┘ä┘ÇÏ¬┘Ç┘à┘è┘ÇÏ▓', description: 'Ï¬ÏÁ┘üÏ¡ ┘åÏ«Ï¿Ï® ┘à┘å Ïº┘ä┘êÏ¼┘çÏºÏ¬ ┘êÏº┘äÏ«Ï»┘àÏºÏ¬ Ïº┘ä┘àÏ«Ï¬ÏºÏ▒Ï® Ï¿Ï╣┘åÏº┘èÏ® ┘äÏ¬┘äÏ¿┘è Ï░┘ê┘é┘â┘à Ïº┘äÏ▒┘ü┘èÏ╣.' },
                            { step: 'II', icon: '­ƒùØ´©Å', title: 'Ï¡┘ÇÏ¼Ï▓ Ïó┘à┘Ç┘å', description: '┘åÏ©Ïº┘à Ï¡Ï¼Ï▓ ┘àÏ¬ÏÀ┘êÏ▒ ┘èÏÂ┘à┘å Ï«ÏÁ┘êÏÁ┘èÏ¬┘â┘à ┘ê┘àÏ╣Ïº┘à┘äÏºÏ¬┘â┘à Ï¿Ïú┘àÏº┘å Ï¬Ïº┘à ┘êÏºÏ¡Ï¬Ï▒Ïº┘ü┘èÏ®.' },
                            { step: 'III', icon: 'Ô£¿', title: 'Ï╣┘ÇÏ┤ Ïº┘ä┘ÇÏ¬Ï¼┘ÇÏ▒Ï¿Ï®', description: 'ÏºÏ│Ï¬┘àÏ¬Ï╣ Ï¿Ï«Ï»┘àÏºÏ¬┘åÏº Ïº┘äÏºÏ│Ï¬Ï½┘åÏºÏª┘èÏ® ┘àÏ╣ ÏÂ┘àÏº┘å Ïº┘äÏ¼┘êÏ»Ï® ┘êÏº┘äÏº┘çÏ¬┘àÏº┘à Ï¿ÏúÏ»┘é Ïº┘äÏ¬┘üÏºÏÁ┘è┘ä.' },
                        ].map((item) => (
                            <div key={item.step} className="card-3d p-16 flex flex-col justify-between group overflow-hidden bg-[#1F2329]">
                                <div className="absolute top-0 right-0 p-10 text-9xl font-black text-white/5 -translate-y-12 translate-x-12 group-hover:translate-x-6 transition-transform">{item.step}</div>
                                <div className="text-7xl mb-12 block text-right relative z-10 filter grayscale group-hover:grayscale-0 transition-all duration-700">{item.icon}</div>
                                <h3 className="text-3xl font-black text-white mb-8 text-right relative z-10 group-hover:text-[#C6A75E] transition-all">{item.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-normal text-right text-[15px] relative z-10">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#121417] text-slate-500 py-40 border-t border-[#C6A75E]/10 relative overflow-hidden">
                <div className="zellige-pattern absolute inset-0 opacity-[0.03]"></div>
                <div className="section-padding relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-24">
                        <div className="space-y-10 text-right">
                            <Link href="/" className="flex items-center gap-4 justify-end">
                                <div className="flex flex-col">
                                    <span className="text-4xl font-black text-white tracking-widest leading-none">Ïº┘ä┘ÇÏ▒┘ü┘Ç┘è┘Ç┘é</span>
                                    <span className="text-[11px] text-[#C6A75E] font-bold uppercase tracking-[0.5em] mt-2 text-left">EXCELLENCE</span>
                                </div>
                                <div className="w-14 h-14 bg-gradient-to-br from-[#C6A75E] to-[#8C6B2E] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl">Ï▒</div>
                            </Link>
                            <p className="text-[15px] leading-8 font-light max-w-xs ml-auto text-slate-400">
                                ┘å┘ÇÏÁ┘à┘à Ï«┘ÇÏ»┘àÏºÏ¬ ┘ä┘ÇÏ¬┘Ç┘äÏ¿┘è ÏúÏ╣┘Ç┘ä┘ë ┘à┘ÇÏ╣Ïº┘è┘Ç┘èÏ▒ Ïº┘ä┘Ç┘ü┘ÇÏ«Ïº┘à┘ÇÏ® ┘êÏº┘ä┘ÇÏ▒┘é┘è┘æ ┘ü┘Ç┘è Ïº┘ä┘ÇÏ¼Ï▓ÏºÏª┘ÇÏ▒. Ï▒┘ü┘é┘ÇÏ¬┘â┘à Ïº┘äÏ»ÏºÏª┘àÏ® ┘å┘ÇÏ¡┘ê Ïº┘ä┘ÇÏ¬┘à┘è┘ÇÏ▓.
                            </p>
                        </div>
                        <div className="text-right">
                            <h4 className="text-white font-black mb-12 uppercase tracking-[0.3em] text-[11px]">Ïº┘äÏ«┘ÇÏ»┘àÏºÏ¬</h4>
                            <ul className="space-y-8 text-[14px] font-bold tracking-wide">
                                <li><Link href="/hotels" className="hover:text-[#C6A75E] transition-all">Ïº┘ä┘Ç┘ü┘åÏºÏ»┘é ┘êÏº┘ä┘Ç┘à┘Ç┘åÏ¬Ï¼┘ÇÏ╣ÏºÏ¬</Link></li>
                                <li><Link href="/homes" className="hover:text-[#C6A75E] transition-all">Ïº┘äÏÑ┘é┘ÇÏº┘àÏºÏ¬ Ïº┘ä┘ÇÏ«┘ÇÏºÏÁÏ®</Link></li>
                                <li><Link href="/food" className="hover:text-[#C6A75E] transition-all">Ïº┘ä┘ÇÏ¬┘ÇÏ¼┘ÇÏºÏ▒Ï¿ Ïº┘ä┘Ç┘à┘êÏ│┘è┘é┘Ç┘èÏ®</Link></li>
                                <li><Link href="/taxi" className="hover:text-[#C6A75E] transition-all">Ïº┘ä┘ÇÏ¬┘Ç┘å┘é┘Ç┘ä Ïº┘ä┘Ç┘ü┘ÇÏºÏ«┘ÇÏ▒</Link></li>
                            </ul>
                        </div>
                        <div className="text-right">
                            <h4 className="text-white font-black mb-12 uppercase tracking-[0.3em] text-[11px]">Ïº┘ä┘Ç┘à┘ÇÏ▒┘âÏ▓</h4>
                            <ul className="space-y-8 text-[14px] font-bold tracking-wide">
                                <li><Link href="/about" className="hover:text-[#C6A75E] transition-all">Ï▒Ïñ┘è┘ÇÏ¬┘åÏº</Link></li>
                                <li><Link href="/register?type=provider" className="hover:text-[#C6A75E] transition-all">Ïº┘å┘ÇÏÂ┘à ┘â┘Ç┘à┘ÇÏ▓┘êÏ»</Link></li>
                                <li><Link href="/contact" className="hover:text-[#C6A75E] transition-all">ÏºÏ¬┘ÇÏÁ┘ä Ï¿┘Ç┘å┘ÇÏº</Link></li>
                            </ul>
                        </div>
                        <div className="text-right">
                            <h4 className="text-white font-black mb-12 uppercase tracking-[0.3em] text-[11px]">Ïº┘ä┘ÇÏ¬┘êÏºÏÁ┘Ç┘ä</h4>
                            <div className="glass-luxury p-10 rounded-[24px] border-[#C6A75E]/10">
                                <p className="text-[13px] mb-6 leading-7 text-slate-400">Ï¬┘êÏºÏÁ┘ä┘êÏº ┘àÏ╣ ┘üÏ▒┘è┘é Ïº┘ä┘åÏ«Ï¿Ï® ┘ä┘ÇÏ¬┘Ç┘ä┘é┘è Ïº┘ä┘ÇÏ»Ï╣┘Ç┘à Ïº┘äÏºÏ│Ï¬Ï½┘åÏºÏª┘è</p>
                                <Link href="/support" className="text-[#C6A75E] font-black text-[11px] uppercase tracking-[0.4em] border-b border-[#C6A75E]/30 pb-2 hover:border-[#C6A75E] transition-all">Ïº┘â┘ÇÏ¬┘ÇÏ┤┘ü Ïº┘ä┘Ç┘à┘ÇÏ▓┘èÏ» ÔåÉ</Link>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/5 mt-40 pt-16 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex gap-14 grayscale opacity-50">
                            <span className="text-[11px] font-black uppercase tracking-[0.4em]">LinkedIn</span>
                            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Instagram</span>
                            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Behance</span>
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] metallic-gold">
                            ┬® 2026 Ïº┘äÏ▒┘ü┘è┘é  ÔÇö  Ï¬┘ÇÏ¼┘ÇÏ▒Ï¿Ï® Ïº┘ä┘å┘ÇÏ«┘ÇÏ¿Ï® ┘ü┘Ç┘è Ïº┘ä┘ÇÏ¼Ï▓ÏºÏªÏ▒ ­ƒç®­ƒç┐
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
