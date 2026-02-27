'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function PremiumNavbar() {
    const pathname = usePathname();
    const { user, isAuthenticated, logout, loadUser } = useAuthStore();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        loadUser();
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadUser]);

    const navLinks = [
        { name: 'الـرئيسية', href: '/' },
        { name: 'الـفنادق', href: '/hotels' },
        { name: 'الإقـامات', href: '/homes' },
        { name: 'حجوزاتي', href: '/bookings', protected: true },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${scrolled
            ? 'bg-[#121417]/80 backdrop-blur-2xl border-b border-[#C6A75E]/10 py-5 shadow-[0_10px_40px_rgba(0,0,0,0.4)]'
            : 'bg-transparent py-8'
            }`}>
            <div className="section-padding flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#C6A75E] to-[#8C6B2E] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(198,167,94,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        ر
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white tracking-widest leading-none">الـرفـيـق</span>
                        <span className="text-[10px] text-[#C6A75E] font-bold uppercase tracking-[0.4em] mt-1">EXCELLENCE</span>
                    </div>
                </Link>

                <div className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        (!link.protected || isAuthenticated) && (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-500 relative py-2 ${pathname === link.href ? 'text-[#C6A75E]' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {link.name}
                                {pathname === link.href && (
                                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C6A75E] to-transparent rounded-full shadow-[0_0_10px_#C6A75E]"></span>
                                )}
                            </Link>
                        )
                    ))}
                </div>

                {/* Auth Actions */}
                <div className="hidden lg:flex items-center gap-6">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-white text-xs font-black">{user?.fullName}</span>
                                <button
                                    onClick={() => logout()}
                                    className="text-rose-400 text-[10px] font-black uppercase tracking-widest hover:text-rose-300 transition-colors"
                                >
                                    تـسجيل الخروج
                                </button>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl border border-white/5 shadow-inner">
                                👤
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-6">
                            <Link href="/login" className="text-white/60 hover:text-white text-xs font-black transition-all uppercase tracking-widest">
                                دخـول
                            </Link>
                            <Link href="/register" className="btn-gold text-[10px] py-3.5 px-8 shadow-2xl uppercase tracking-[0.2em]">
                                انـضـم لـلـنـخـبة
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl"
                >
                    {mobileMenuOpen ? '×' : '☰'}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[72px] bg-[#111827] z-[99] p-8 animate-in slide-in-from-top duration-500">
                    <div className="space-y-6">
                        {navLinks.map((link) => (
                            (!link.protected || isAuthenticated) && (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block text-2xl font-black ${pathname === link.href ? 'text-white' : 'text-white/40'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            )
                        ))}

                        <div className="pt-8 border-t border-white/5 space-y-6">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl">👤</div>
                                    <div className="flex-1">
                                        <div className="text-white font-black text-xl">{user?.fullName}</div>
                                        <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-rose-400 font-bold uppercase tracking-widest text-sm mt-1">تـسجيل الخروج</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-white/50 text-xl font-bold">تـسجيل الـدخول</Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-action block w-full text-center py-4 text-sm">انضم إلينا</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
