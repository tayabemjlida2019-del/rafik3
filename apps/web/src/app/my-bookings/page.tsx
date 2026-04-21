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

const bookings = [
    {
        id: 'REF-2026-X1',
        title: 'فـيلا الـجزائـر - الـقصبة',
        type: 'عـقارات',
        image: '/images/homes.jpg',
        dates: '12 أفـريـل - 15 أفـريـل 2026',
        amount: '360,000 دج',
        status: 'CONFIRMED',
        statusLabel: 'مـؤكـد',
        statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    },
    {
        id: 'REF-2026-T9',
        title: 'طـيـران خـاص - وهران',
        type: 'طـيران',
        image: '/images/hero.jpg',
        dates: '20 فـيفـري 2026',
        amount: '250,000 دج',
        status: 'PENDING',
        statusLabel: 'قـيـد الـتـأكيـد',
        statusColor: 'bg-[#C6A75E]/20 text-[#C6A75E] border-[#C6A75E]/40'
    },
    {
        id: 'REF-2025-A4',
        title: 'شـقـة عـصرية - سـيدي فـرج',
        type: 'عـقارات',
        image: '/images/hotels.jpg',
        dates: '01 جـوان - 05 جـوان 2025',
        amount: '85,000 دج',
        status: 'PAST',
        statusLabel: 'سـابـق',
        statusColor: 'bg-slate-500/20 text-slate-400 border-white/10'
    }
];

export default function MyBookingsPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-[#C6A75E]/30 font-sans">
            <PremiumNavbar />

            <main className="pt-32 pb-40 section-padding max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-20 text-right">
                    <div className="inline-block px-5 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C6A75E]">
                            Dashboard — حـجوزاتـي
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black font-serif leading-tight">تـابـع <span className={COLORS.gold}>رحـلـتـك مـعـنا</span></h1>
                    <p className="text-xl text-slate-400 font-light mt-6">مـتخصصـون في إدارة تـفـاصيـل الـرفـاهـيـة الـخـاصـة بـكم.</p>
                </div>

                {/* Bookings List */}
                <div className="space-y-8">
                    {bookings.map((booking) => (
                        <div 
                            key={booking.id}
                            className={`${COLORS.glass} rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 hover:border-[#C6A75E]/30 transition-all duration-700 group`}
                        >
                            {/* Visual Representation */}
                            <div className="w-full md:w-64 h-48 rounded-[32px] overflow-hidden relative shrink-0">
                                <img src={booking.image} alt={booking.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-6 right-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                        {booking.id}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-6 text-right w-full">
                                <div className="flex flex-wrap items-center justify-end gap-4">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${booking.statusColor}`}>
                                        {booking.statusLabel}
                                    </span>
                                    <span className="text-[10px] font-black text-[#C6A75E] uppercase tracking-[0.3em] border-b border-[#C6A75E]/30 pb-1">
                                        {booking.type}
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black font-serif">{booking.title}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-400">
                                    <div className="flex items-center justify-end gap-3 truncate">
                                        <span className="font-bold text-white text-right">{booking.dates}</span>
                                        <span>📅 الـفـتـرة :</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        <span className={`font-black text-xl text-white`}>{booking.amount}</span>
                                        <span>💰 الـتـكـلـفـة :</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
                                    <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                                        تـحمـيل الإيـصـال
                                    </button>
                                    <Link href="/support" className="px-8 py-3 bg-[#C6A75E] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-[#C6A75E]/20 hover:scale-105 transition-all">
                                        الـتـواصـل مـع الـدعم
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State Mockup */}
                <div className="mt-24 text-center opacity-30">
                    <p className="text-sm font-black uppercase tracking-[0.5em]">--- نهاية القائمة ---</p>
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
