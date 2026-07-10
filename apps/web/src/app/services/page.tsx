'use client';

import React from 'react';
import Link from 'next/link';
import PremiumNavbar from '@/components/PremiumNavbar';

// Modern Evolution Styling Constants
const COLORS = {
    glass: 'bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl',
    gold: 'bg-gradient-to-br from-[#C6A75E] to-[#8C6B2E] text-transparent bg-clip-text',
    dark: '#020617',
};

const categories = [
    {
        id: 'real-estate',
        titleAr: 'الـعقـارات الـفاخـرة',
        titleEn: 'Luxury Real Estate',
        image: '/images/homes.jpg',
        icon: '🏠',
        desc: 'اكتشف أرقى الفيلات والقصور في أكثر المناطق تميزاً في الجزائر.',
        count: '150+ مـكان',
        href: '/homes',
        size: 'md:col-span-2 md:row-span-2'
    },
    {
        id: 'aviation',
        titleAr: 'الـطيران الـخاص',
        titleEn: 'Private Aviation',
        image: '/images/hero.jpg', 
        icon: '✈️',
        desc: 'تجربة حجز طيران مخصصة لك، نصل بك أينما تريد بأمان ورقي.',
        count: 'خـدمة مـتوفرة',
        href: '/taxi',
        size: 'md:col-span-1 md:row-span-1'
    },
    {
        id: 'yachts',
        titleAr: 'الـيخـوت والـبحـر',
        titleEn: 'Yachts & Marine',
        image: '/images/hotels.jpg', 
        icon: '🛥️',
        desc: 'استمتع بسحر مياه المتوسط على متن أفخم اليخوت المجهزة.',
        count: 'قـريباً وحـصرياً',
        href: '#',
        size: 'md:col-span-1 md:row-span-1'
    },
    {
        id: 'experience',
        titleAr: 'تـجارب مـصممة',
        titleEn: 'Bespoke Experiences',
        image: '/images/zellige-bg.png',
        icon: '✨',
        desc: 'تجارب سياحية وثقافية فريدة مصممة خصيصاً لذوقكم الرفيع.',
        count: 'مـسـارات مـخـتـارة',
        href: '/food',
        size: 'md:col-span-2 md:row-span-1'
    }
];

export default function ServicesCatalogPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-[#C6A75E]/30 font-sans">
            <PremiumNavbar />

            <main className="pt-32 pb-40 section-padding">
                {/* Header Section */}
                <div className="max-w-7xl mx-auto mb-20 text-center md:text-right">
                    <div className="inline-block px-5 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C6A75E]">
                            Services Catalog — كـتالوج الـخدمات
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight font-serif">
                        جـمال الإخـتيار <br /> <span className={COLORS.gold}>وفـخامة الـتجربة</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 font-light max-w-3xl md:ml-0 md:mr-auto leading-relaxed">
                        استكشف عالم &quot;الرفيق&quot; المصمم بعناية فائقة ليلبي تطلعاتكم. <br className="hidden md:block" />
                        من البر إلى البحر، نحن وجهتكم الموثوقة للتميز.
                    </p>
                </div>

                {/* Bento Grid Concept */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 ">
                    {categories.map((cat) => (
                        <Link 
                            href={cat.href}
                            key={cat.id}
                            className={`${cat.size} group relative rounded-[48px] overflow-hidden ${COLORS.glass} hover:border-[#C6A75E]/40 transition-all duration-700 hover:shadow-[#C6A75E]/10 flex flex-col`}
                        >
                            {/* Background Image with Gradient */}
                            <div className="absolute inset-0 z-0">
                                <img 
                                    src={cat.image} 
                                    alt={cat.titleAr}
                                    className="w-full h-full object-cover opacity-30 group-hover:scale-110 group-hover:opacity-50 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 p-12 mt-auto text-right">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C6A75E] border-b border-[#C6A75E]/30 pb-1">
                                        {cat.count}
                                    </span>
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-3xl group-hover:bg-[#C6A75E] transition-all duration-500 group-hover:scale-110">
                                        {cat.icon}
                                    </div>
                                </div>
                                <h3 className="text-2xl md:text-4xl font-black mb-4 font-serif">{cat.titleAr}</h3>
                                <p className="text-slate-400 text-sm md:text-lg leading-relaxed mb-8 max-w-md ml-auto">
                                    {cat.desc}
                                </p>
                                <div className="flex items-center justify-end gap-3 text-xs font-black uppercase tracking-[0.3em] text-white opacity-40 group-hover:opacity-100 transition-opacity">
                                    اسـتـعـرض كـافة الـتفـاصـيـل
                                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </div>
                            </div>

                            {/* Hover Accent */}
                            <div className="absolute top-0 right-0 w-2 h-0 bg-[#C6A75E] group-hover:h-full transition-all duration-700"></div>
                        </Link>
                    ))}
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
