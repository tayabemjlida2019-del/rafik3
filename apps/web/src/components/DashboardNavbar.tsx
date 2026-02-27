import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function DashboardNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const dashboardLinks = isAdmin ? [
        { name: 'مراجعة المدفوعات', href: '/admin/payments' },
        { name: 'تحويل المستحقات', href: '/admin/payouts' }
    ] : [
        { name: 'نظرة عامة', href: '/dashboard' },
        { name: 'إدارة قائمتي', href: '/dashboard/listings' }
    ];

    return (
        <nav className="bg-[#0f172a] border-b border-blue-500/10 sticky top-0 z-50">
            <div className="section-padding py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
                            ر
                        </div>
                        <span className="text-xl font-black text-[#E8EAED] tracking-tight">الرفيق <span className="text-blue-500">إدارة</span></span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {dashboardLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${pathname.includes(link.href) ? 'text-blue-500 bg-blue-500/10' : 'text-[#9AA0A6] hover:text-[#E8EAED]'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/" className="hidden sm:flex text-xs font-bold text-[#9AA0A6] hover:text-[#C6A75E] transition-colors items-center gap-2">
                        <span>العودة للموقع</span>
                        <span className="text-lg">🏠</span>
                    </Link>
                    <div className="hidden sm:block w-px h-6 bg-[#C6A75E]/20 mx-2"></div>

                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                        >
                            خروج
                        </button>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-500">
                            {user?.fullName?.[0] || 'U'}
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden w-10 h-10 rounded-lg bg-[#1F2329] border border-[#C6A75E]/10 flex items-center justify-center text-[#C6A75E] text-2xl"
                    >
                        {mobileMenuOpen ? '×' : '☰'}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[73px] bg-[#0f172a] z-[99] p-8 animate-in slide-in-from-top duration-500">
                    <div className="space-y-6">
                        {dashboardLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block text-2xl font-black ${pathname.includes(link.href) ? 'text-[#C6A75E]' : 'text-[#E8EAED]/40'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-8 border-t border-blue-500/10 space-y-6">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-[#9AA0A6] text-xl font-bold"
                            >
                                🏠 العودة للموقع
                            </Link>
                            <button
                                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                className="block w-full text-right text-red-400 text-xl font-black"
                            >
                                🚪 تسجيل الخروج
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
