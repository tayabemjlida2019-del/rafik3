'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { BrandLogoStacked } from '@/components/BrandLogoLockup';

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((s) => s.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#003580]/20 via-transparent to-[#C6A75E]/5"></div>
            <div className="absolute w-96 h-96 rounded-full bg-[#003580]/10 blur-[120px] top-[-10%] right-[-5%]"></div>
            <div className="absolute w-72 h-72 rounded-full bg-[#C6A75E]/5 blur-[100px] bottom-[10%] left-[-5%]"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex flex-col items-center group">
                        <BrandLogoStacked size="large" />
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 shadow-2xl shadow-black/30">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">البريد الإلكتروني</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg opacity-50">📧</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-4 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20 transition-all font-medium"
                                    placeholder="example@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">كلمة المرور</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg opacity-50">🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20 transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-sm"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#003580]" />
                                <span className="text-xs text-slate-400">تذكرني</span>
                            </label>
                            <Link href="#" className="text-xs text-[#4a9eff] hover:text-white transition-colors font-bold">
                                نسيت كلمة المرور؟
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#003580] hover:bg-[#00264d] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#003580]/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    جاري الدخول...
                                </span>
                            ) : (
                                'تسجيل الدخول'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/5"></div>
                        <span className="text-xs text-slate-500 font-bold">أو</span>
                        <div className="flex-1 h-px bg-white/5"></div>
                    </div>

                    {/* Social Login Placeholder */}
                    <div className="flex gap-3">
                        <button className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl py-3 text-sm font-bold text-slate-300 transition-all flex items-center justify-center gap-2">
                            <span className="text-lg">G</span> Google
                        </button>
                        <button className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl py-3 text-sm font-bold text-slate-300 transition-all flex items-center justify-center gap-2">
                            <span className="text-lg">f</span> Facebook
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        ليس لديك حساب؟{' '}
                        <Link href="/register" className="text-[#4a9eff] font-bold hover:text-white transition-colors">
                            سجل الآن مجاناً
                        </Link>
                    </div>

                    {/* Demo credentials */}
                    <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-xl">
                        <p className="text-[10px] text-[#C6A75E] font-bold uppercase tracking-widest mb-2">حسابات تجريبية</p>
                        <div className="space-y-1 text-xs text-slate-500 font-mono">
                            <p>👤 ahmed@test.dz / User123!</p>
                            <p>🏢 karim@homes.dz / Provider123!</p>
                            <p>⚙️ admin@rafiq.dz / Admin123!</p>
                        </div>
                    </div>
                </div>

                {/* Back to home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-xs text-slate-500 hover:text-white transition-colors">
                        ← العودة إلى الصفحة الرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}
