'use client';

import React from 'react';
import PremiumNavbar from '@/components/PremiumNavbar';

// Modern Evolution Styling Constants
const COLORS = {
    glass: 'bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl',
    gold: 'bg-gradient-to-br from-[#C6A75E] to-[#8C6B2E] text-transparent bg-clip-text',
    dark: '#020617',
};

const userData = {
    name: 'أحمد الـجزائري',
    email: 'ahmed@rafiik.dz',
    phone: '+213 555 12 34 56',
    membership: 'Premium Gold Member',
    balance: '450,000 دج',
    joinedDate: 'جانفي 2026',
    avatar: 'أ'
};

const transactions = [
    { id: 'TX-102', date: '04 أفـريـل', type: 'حـجز فيلا', amount: '-120,000 دج', status: 'COMPLETED' },
    { id: 'TX-101', date: '01 أفـريـل', type: 'شـحن مـحفظة', amount: '+200,000 دج', status: 'COMPLETED' },
    { id: 'TX-100', date: '28 مـارس', type: 'طـيـران خـاص', amount: '-250,000 دج', status: 'COMPLETED' },
];

export default function UserProfilePage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-[#C6A75E]/30 font-sans">
            <PremiumNavbar />

            <main className="pt-32 pb-40 section-padding max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Left Sidebar: Profile Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className={`${COLORS.glass} rounded-[48px] p-12 text-center relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6A75E]/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
                            
                            <div className="relative z-10">
                                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#C6A75E] to-[#8C6B2E] rounded-[32px] flex items-center justify-center text-4xl font-black shadow-2xl">
                                    {userData.avatar}
                                </div>
                                <h2 className="text-3xl font-black mb-2 font-serif">{userData.name}</h2>
                                <p className="text-[#C6A75E] text-[10px] font-black uppercase tracking-[0.4em] mb-8">{userData.membership}</p>
                                
                                <div className="space-y-4 text-sm text-slate-400">
                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <span className="text-white font-bold">{userData.joinedDate}</span>
                                        <span>تـاريخ الإنـضمام :</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <span className="text-white font-bold">{userData.phone}</span>
                                        <span>رقم الـهاتف :</span>
                                    </div>
                                </div>

                                <button className="w-full mt-12 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                                    تـعديـل الـملف الـشـخصي
                                </button>
                            </div>
                        </section>

                        {/* E-Wallet Preview */}
                        <section className={`${COLORS.glass} rounded-[48px] p-12 relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent`}>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-4xl mb-6">💳</span>
                                <h3 className="text-xl font-black mb-2 font-serif text-[#C6A75E]">الـمحـفـظة الـإلـكـتـرونيـة</h3>
                                <p className="text-slate-500 text-xs mb-8 uppercase tracking-[0.2em]">Available Balance</p>
                                <div className="text-4xl font-black mb-10 tracking-tight">{userData.balance}</div>
                                <button className="w-full py-5 bg-[#C6A75E] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all active:scale-95">
                                    تـعـبـئة الـرصـيـد +
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-12">
                        
                        {/* Membership Progress Mock */}
                        <section className={`${COLORS.glass} rounded-[48px] p-16 relative overflow-hidden`}>
                            <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-10">
                                <div className="text-right flex-1">
                                    <h3 className="text-3xl font-black mb-4 font-serif">الـعضـويـة <span className={COLORS.gold}>الـذهبيـة</span></h3>
                                    <p className="text-slate-400 font-light text-lg mb-8">لقد نـفذت 12 طـلبـاً هذا الـعام. أنـت على بـعد خـطـوتيـن مـن عـضـوية الـألـماس.</p>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-4/5 h-full bg-gradient-to-r from-[#C6A75E] to-[#8C6B2E] rounded-full"></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                        <span>DIAMOND</span>
                                        <span>GOLD</span>
                                    </div>
                                </div>
                                <div className="w-32 h-32 flex-shrink-0 animate-pulse">
                                    <span className="text-7xl">🏆</span>
                                </div>
                            </div>
                        </section>

                        {/* Recent Transactions Table-like UI */}
                        <section>
                            <div className="flex items-center justify-between mb-10 px-6">
                                <button className="text-[10px] font-black text-[#C6A75E] uppercase tracking-widest border-b border-[#C6A75E]/30 pb-1">عرض الكل</button>
                                <h3 className="text-2xl font-black font-serif">آخـر الـعـملـيات</h3>
                            </div>
                            
                            <div className="space-y-4">
                                {transactions.map((tx) => (
                                    <div 
                                        key={tx.id}
                                        className={`${COLORS.glass} p-8 rounded-[32px] flex items-center justify-between group hover:border-white/20 transition-all`}
                                    >
                                        <div className="text-right">
                                            <div className={`text-lg font-black ${tx.amount.startsWith('+') ? 'text-emerald-400' : 'text-white'}`}>
                                                {tx.amount}
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-500 tracking-wider">REF: {tx.id}</div>
                                        </div>

                                        <div className="flex-1 px-12 text-right">
                                            <div className="text-lg font-bold">{tx.type}</div>
                                            <div className="text-xs text-slate-400">{tx.date}</div>
                                        </div>

                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl group-hover:bg-white/10 transition-colors">
                                            {tx.amount.startsWith('+') ? '💸' : '🛒'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Quick Settings Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: '🔔', label: 'الـتـنبـيهات' },
                                { icon: '🛡️', label: 'الـخصوصيـة' },
                                { icon: '💳', label: 'الـبطاقات' },
                                { icon: '🚪', label: 'تـسجيل الخروج' },
                            ].map((s) => (
                                <button key={s.label} className={`${COLORS.glass} py-10 rounded-[32px] hover:bg-white/5 transition-all text-center flex flex-col items-center gap-3`}>
                                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{s.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
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
