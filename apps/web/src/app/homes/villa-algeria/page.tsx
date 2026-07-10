'use client';

import React, { useState } from 'react';
import PremiumNavbar from '@/components/PremiumNavbar';
import dynamic from 'next/dynamic';

const BookingForm = dynamic(() => import('@/components/BookingForm'), { ssr: false });

// Modern Evolution Styling Constants
const COLORS = {
    glass: 'bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl',
    gold: 'bg-gradient-to-br from-[#C6A75E] to-[#8C6B2E] text-transparent bg-clip-text',
    dark: '#020617',
};

const villaData = {
    title: 'فـيلا الـجزائـر - الـقصبة',
    subTitle: 'Villa Al-Djazair - Heritage Collection',
    location: 'الـجزائر العـاصمة، القصبة الـعليا',
    price: 120000,
    rating: 4.9,
    reviews: 42,
    images: [
        '/images/homes.jpg',
        '/images/hotels.jpg',
        '/images/zellige-bg.png',
        '/images/hero.jpg'
    ],
    features: [
        { icon: '🏊', label: 'مسبح خـاص' },
        { icon: '📶', label: 'واي فاي سـريع' },
        { icon: '🏢', label: 'مـكاتب أعـمال' },
        { icon: '🕌', label: 'إطـلالة عـلى الـقصبة' },
        { icon: '🅿️', label: 'مـوقف آمـن' },
        { icon: '❄️', label: 'تـكييف مـتكامل' }
    ],
    description: `تـعتبر "فـيلا الـجزائر" تحفة مـعمارية تـجمع بين عـباقة التاريخ الـقصبة الـعريق وحداثة التصميم الـمعاصر. تـوفر الإقـامة خـصوصية مـطلقة مـع إطـلالات بـانورامية عـلى خـليج الـجزائر.

تـم تـجهيز الـفـيلا بأحدث التقنيات لـضمان راحـة الـنخبة، مـع تـوفير طـاقم خـدمة مـتخصص يـسهر على تلبية كـافة احـتياجاتـكم.`
};

export default function VillaAlgeriaPage() {
    const [activeImage, setActiveImage] = useState(0);

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-[#C6A75E]/30 font-sans">
            <PremiumNavbar />

            <main className="pt-32 pb-40 section-padding max-w-7xl mx-auto">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-16 text-right">
                    <div className="space-y-4">
                        <div className="flex items-center justify-end gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#C6A75E]">
                            <span>Premium Listing</span>
                            <span className="w-1.5 h-1.5 bg-[#C6A75E] rounded-full"></span>
                            <span>Heritage Collection</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black font-serif leading-tight">{villaData.title}</h1>
                        <div className="flex items-center justify-end gap-6 text-slate-400">
                            <span className="flex items-center gap-2">⭐ <b className="text-white">{villaData.rating}</b> ({villaData.reviews} تـقييم)</span>
                            <span className="flex items-center gap-2 text-lg">📍 {villaData.location}</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                        <button className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#C6A75E]/20 hover:border-[#C6A75E]/40 text-[#C6A75E] transition-all">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </button>
                    </div>
                </div>

                {/* Hero Gallery */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[400px] md:h-[600px] mb-20 overflow-hidden rounded-[48px] relative">
                    <div className="lg:col-span-3 h-full overflow-hidden relative group">
                        <img 
                            src={villaData.images[activeImage]} 
                            alt="Villa" 
                            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                    <div className="hidden lg:flex flex-col gap-4 h-full">
                        {villaData.images.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setActiveImage(idx)}
                                className={`flex-1 overflow-hidden relative group ${activeImage === idx ? 'ring-2 ring-[#C6A75E]' : 'opacity-60 hover:opacity-100'} transition-all`}
                            >
                                <img src={img} alt={`${villaData.title} ${idx + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20"></div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                    {/* Content Column */}
                    <div className="lg:col-span-2 space-y-24 text-right">
                        {/* Description */}
                        <section>
                            <h2 className="text-3xl font-black mb-10 pb-6 border-b border-white/5 font-serif">تـفاصيل الإقـامة</h2>
                            <p className="text-xl text-slate-400 leading-relaxed font-light whitespace-pre-line">
                                {villaData.description}
                            </p>
                        </section>

                        {/* Features Grid */}
                        <section>
                            <h2 className="text-3xl font-black mb-12 font-serif">الـخدمات والـمرافق</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {villaData.features.map((f, i) => (
                                    <div key={i} className={`${COLORS.glass} p-8 rounded-[32px] flex items-center justify-between group hover:border-[#C6A75E]/30 transition-all`}>
                                        <span className="text-[#C6A75E] text-2xl group-hover:scale-110 transition-transform">←</span>
                                        <div className="flex items-center gap-6">
                                            <span className="text-lg font-bold">{f.label}</span>
                                            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{f.icon}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Location / Map Placeholder */}
                        <section className={`${COLORS.glass} rounded-[48px] p-20 flex flex-col items-center text-center overflow-hidden relative`}>
                            <div className="absolute inset-0 bg-[#C6A75E]/5 blur-3xl rounded-full scale-150"></div>
                            <div className="relative z-10">
                                <span className="text-7xl mb-8 block">🏛️</span>
                                <h3 className="text-3xl font-black mb-4 font-serif">مـوقع اسـتـثنائي</h3>
                                <p className="text-slate-400 text-lg font-light mb-10">في قـلب الـتـراث، حـيث تـلتقي الـأصـالة بالـفخـامـة.</p>
                                <button className="px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-[#C6A75E] hover:text-white transition-all">
                                    اكـتـشف الـمـنـطـقة
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Booking Form */}
                    <aside className="relative">
                        <div className={`sticky top-28 ${COLORS.glass} rounded-[40px] overflow-hidden`}>
                            <div className="p-10 bg-white/5 border-b border-white/5">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C6A75E] mb-2">سـعر اللـيلة</div>
                                <div className="flex items-baseline justify-end gap-2">
                                    <span className="text-xs text-slate-500 font-bold">دج / ليلة</span>
                                    <span className="text-5xl font-black">{villaData.price.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="p-10">
                                {/* Simplified internal booking form concept */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                        <div className="flex justify-between items-center text-right">
                                            <span className="font-bold">تـحديد الـتـاريـخ</span>
                                            <span className="text-xl">📅</span>
                                        </div>
                                        <div className="text-xs text-slate-500 text-right">اخـتر فـتـرة الإقـامـة الـمنـاسـبـة</div>
                                    </div>

                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                        <div className="flex justify-between items-center text-right">
                                            <span className="font-bold">عـدد الـضيـوف</span>
                                            <span className="text-xl">👥</span>
                                        </div>
                                        <div className="text-xs text-slate-500 text-right">الـحد الأقـصى 8 أشـخـاص</div>
                                    </div>

                                    <button className="w-full py-6 bg-[#C6A75E] text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-[#C6A75E]/30 transition-all active:scale-95">
                                        إحـجز الآن
                                    </button>

                                    <p className="text-[10px] text-center text-slate-500 font-black uppercase tracking-widest pt-4">
                                        * سـوف يـتم الـتـواصـل مـعـكم لـتـأكيـد الـحـجـز
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <style jsx global>{`
                @font-face {
                    font-family: 'Noto Serif Arabic';
                    src: url('https://fonts.googleapis.com/css2?family=Noto+Serif+Arabic:wght@100;900&display=swap');
                }
                .font-serif { font-family: 'Noto Serif Arabic', serif; }
            `}</style>
        </div>
    );
}
