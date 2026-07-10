'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { BrandLogoLockup } from '@/components/BrandLogoLockup';

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
        { name: 'الـرئيسية', href: '/', icon: '🏠' },
        { name: 'الـفنادق', href: '/hotels', icon: '🏨' },
        { name: 'الإقـامات', href: '/homes', icon: '🏡' },
        { name: 'المأكولات', href: '/food', icon: '🍽️' },
        { name: 'تاكسي', href: '/taxi', icon: '🚕' },
        { name: 'حجوزاتي', href: '/my-bookings', icon: '📋', protected: true },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
            ? 'bg-[#0a0e1a]/95 backdrop-blur-2xl border-b border-white/5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent py-5'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center group hover:opacity-90 transition-opacity">
                    <BrandLogoLockup variant="full" size="default" />
                </Link>

                {/* Nav Links */}
                <div className="hidden lg:flex items-center gap-1">
                    {navLinks.map((link) => (
                        (!link.protected || isAuthenticated) && (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-300 ${pathname === link.href
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-sm">{link.icon}</span>
                                {link.name}
                            </Link>
                        )
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="hidden lg:flex items-center gap-3">
                    {/* List Property CTA */}
                    <Link
                        href="/register?type=provider"
                        className="text-slate-300 hover:text-white text-xs font-bold transition-all px-3 py-2 rounded-lg hover:bg-white/5"
                    >
                        اعرض عقارك
                    </Link>

                    {/* Currency */}
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all">
                        <span className="text-sm">🇩🇿</span>
                        <span className="text-xs font-bold text-slate-300">DZD</span>
                    </div>

                    {/* Auth */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-white text-xs font-bold">{user?.fullName}</span>
                                <button
                                    onClick={() => logout()}
                                    className="text-rose-400 text-[10px] font-bold hover:text-rose-300 transition-colors"
                                >
                                    تـسجيل الخروج
                                </button>
                            </div>
                            <Link href="/profile" className="w-9 h-9 rounded-full bg-[#003580] flex items-center justify-center text-white text-sm font-bold border border-white/10 hover:bg-[#003580]/80 transition-all">
                                {user?.fullName?.[0] || '👤'}
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
                                سـجل الدخول
                            </Link>
                            <Link href="/register" className="bg-[#003580] hover:bg-[#00264d] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#003580]/30">
                                سـجل حساب
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-xl transition-all hover:bg-white/10"
                >
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[64px] bg-[#0a0e1a]/98 backdrop-blur-2xl z-[99] animate-fade-in">
                    <div className="p-6 space-y-2 max-h-[calc(100vh-64px)] overflow-y-auto">
                        {navLinks.map((link) => (
                            (!link.protected || isAuthenticated) && (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-lg font-bold transition-all ${pathname === link.href
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/50 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xl">{link.icon}</span>
                                    {link.name}
                                </Link>
                            )
                        ))}

                        <div className="pt-6 border-t border-white/5 space-y-3">
                            <Link
                                href="/register?type=provider"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-5 py-4 rounded-2xl text-slate-400 hover:text-white transition-all font-bold"
                            >
                                <span className="text-xl">🏢</span>
                                اعرض عقارك على الرفيق
                            </Link>

                            {isAuthenticated ? (
                                <div className="flex items-center gap-4 px-5 py-4">
                                    <Link
                                        href="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-14 h-14 rounded-full bg-[#003580] flex items-center justify-center text-white text-2xl font-bold"
                                    >
                                        {user?.fullName?.[0] || '👤'}
                                    </Link>
                                    <div className="flex-1">
                                        <div className="text-white font-black text-xl">{user?.fullName}</div>
                                        <button
                                            onClick={() => { logout(); setMobileMenuOpen(false); }}
                                            className="text-rose-400 font-bold text-sm mt-1"
                                        >
                                            تـسجيل الخروج
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 px-5">
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full text-center py-4 rounded-2xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition-all"
                                    >
                                        تـسجيل الدخول
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full text-center py-4 rounded-2xl bg-[#003580] text-white font-bold text-base shadow-lg"
                                    >
                                        إنشاء حساب مجاني
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
