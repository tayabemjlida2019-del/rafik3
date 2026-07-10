'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { BrandLogoStacked } from '@/components/BrandLogoLockup';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isProvider = searchParams.get('type') === 'provider';
    const { registerUser, registerProvider } = useAuthStore();

    const [tab, setTab] = useState<'user' | 'provider'>(isProvider ? 'provider' : 'user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        email: '',
        fullName: '',
        password: '',
        phone: '',
        businessName: '',
        businessType: 'HOME',
        city: '',
        wilaya: '',
    });

    const update = (key: string, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (tab === 'user') {
                await registerUser({
                    email: form.email,
                    fullName: form.fullName,
                    password: form.password,
                    phone: form.phone || undefined,
                });
            } else {
                await registerProvider({
                    email: form.email,
                    fullName: form.fullName,
                    password: form.password,
                    phone: form.phone || undefined,
                    businessName: form.businessName,
                    businessType: form.businessType,
                    city: form.city,
                    wilaya: form.wilaya,
                });
            }
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل التسجيل. حاول مجدداً.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#003580]/20 via-transparent to-[#C6A75E]/5"></div>
            <div className="absolute w-96 h-96 rounded-full bg-[#003580]/10 blur-[120px] top-[-10%] left-[-5%]"></div>
            <div className="absolute w-72 h-72 rounded-full bg-[#C6A75E]/5 blur-[100px] bottom-[10%] right-[-5%]"></div>

            <div className="w-full max-w-lg relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex flex-col items-center group">
                        <BrandLogoStacked size="large" />
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 shadow-2xl shadow-black/30">
                    {/* Tab Switcher */}
                    <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => setTab('user')}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${tab === 'user'
                                ? 'bg-[#003580] text-white shadow-lg shadow-[#003580]/30'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            👤 مسافر
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('provider')}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${tab === 'provider'
                                ? 'bg-[#C6A75E] text-white shadow-lg shadow-[#C6A75E]/30'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            🏢 مزود خدمة
                        </button>
                    </div>

                    {/* Tab Description */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-6">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {tab === 'user'
                                ? '✨ أنشئ حسابك كمسافر لحجز الفنادق والإقامات والخدمات في جميع أنحاء الجزائر.'
                                : '🏢 سجّل كمزود خدمة لعرض عقاراتك وخدماتك على منصة الرفيق والوصول لآلاف المسافرين.'
                            }
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">الاسم الكامل</label>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => update('fullName', e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#003580] transition-all"
                                    placeholder="أحمد بن محمد"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => update('email', e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#003580] transition-all"
                                    placeholder="ahmed@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">كلمة المرور</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => update('password', e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#003580] transition-all"
                                    placeholder="8 أحرف على الأقل"
                                    minLength={8}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => update('phone', e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#003580] transition-all"
                                    placeholder="0550123456"
                                />
                            </div>
                        </div>

                        {/* Provider-specific fields */}
                        {tab === 'provider' && (
                            <>
                                <div className="border-t border-white/5 pt-4 mt-2">
                                    <p className="text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span>🏢</span> معلومات المؤسسة
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">اسم المؤسسة</label>
                                    <input
                                        type="text"
                                        value={form.businessName}
                                        onChange={(e) => update('businessName', e.target.value)}
                                        className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#C6A75E] transition-all"
                                        placeholder="دار الضيافة"
                                        required={tab === 'provider'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">نوع النشاط</label>
                                    <select
                                        value={form.businessType}
                                        onChange={(e) => update('businessType', e.target.value)}
                                        className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-[#C6A75E] transition-all appearance-none"
                                    >
                                        <option value="HOME" className="bg-[#111827]">🏠 كراء منازل</option>
                                        <option value="HOTEL" className="bg-[#111827]">🏨 فندق</option>
                                        <option value="RESTAURANT" className="bg-[#111827]">🍲 مطعم</option>
                                        <option value="TAXI" className="bg-[#111827]">🚕 سيارة أجرة</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">المدينة</label>
                                        <input
                                            type="text"
                                            value={form.city}
                                            onChange={(e) => update('city', e.target.value)}
                                            className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#C6A75E] transition-all"
                                            placeholder="وهران"
                                            required={tab === 'provider'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#C6A75E] uppercase tracking-widest mb-2">الولاية</label>
                                        <input
                                            type="text"
                                            value={form.wilaya}
                                            onChange={(e) => update('wilaya', e.target.value)}
                                            className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#C6A75E] transition-all"
                                            placeholder="وهران"
                                            required={tab === 'provider'}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 text-lg font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 ${tab === 'user'
                                ? 'bg-[#003580] hover:bg-[#00264d] text-white shadow-[#003580]/30'
                                : 'bg-[#C6A75E] hover:bg-[#b5963f] text-white shadow-[#C6A75E]/30'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    جاري التسجيل...
                                </span>
                            ) : tab === 'user' ? 'إنشاء حساب مسافر' : 'تسجيل كمزود خدمة'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        لديك حساب؟{' '}
                        <Link href="/login" className="text-[#4a9eff] font-bold hover:text-white transition-colors">
                            سجل الدخول
                        </Link>
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

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#003580] border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
