'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

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
            setError(err.response?.data?.message || 'فشل التسجيل');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 px-4 py-12">
            <div className="w-full max-w-lg animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-700 font-bold text-2xl shadow-xl">
                            ر
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mt-4">إنشاء حساب جديد</h1>
                    <p className="text-blue-200 mt-2">انضم إلى الرفيق اليوم</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {/* Tab Switcher */}
                    <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => setTab('user')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'user'
                                ? 'bg-white shadow-sm text-primary-700'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            👤 مستخدم
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('provider')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'provider'
                                ? 'bg-white shadow-sm text-primary-700'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            🏢 مزود خدمة
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2">
                                <span>⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => update('fullName', e.target.value)}
                                    className="input-field text-sm"
                                    placeholder="أحمد بن محمد"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => update('email', e.target.value)}
                                    className="input-field text-sm"
                                    placeholder="ahmed@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => update('password', e.target.value)}
                                    className="input-field text-sm"
                                    placeholder="8 أحرف على الأقل"
                                    minLength={8}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => update('phone', e.target.value)}
                                    className="input-field text-sm"
                                    placeholder="0550123456"
                                />
                            </div>
                        </div>

                        {/* Provider-specific fields */}
                        {tab === 'provider' && (
                            <>
                                <hr className="my-4 border-gray-200" />
                                <p className="text-sm font-medium text-gray-700">معلومات المؤسسة</p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المؤسسة</label>
                                    <input
                                        type="text"
                                        value={form.businessName}
                                        onChange={(e) => update('businessName', e.target.value)}
                                        className="input-field text-sm"
                                        placeholder="دار الضيافة"
                                        required={tab === 'provider'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع النشاط</label>
                                    <select
                                        value={form.businessType}
                                        onChange={(e) => update('businessType', e.target.value)}
                                        className="input-field text-sm"
                                    >
                                        <option value="HOME">🏠 كراء منازل</option>
                                        <option value="HOTEL">🏨 فندق</option>
                                        <option value="RESTAURANT">🍲 مطعم</option>
                                        <option value="TAXI">🚕 سيارة أجرة</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                                        <input
                                            type="text"
                                            value={form.city}
                                            onChange={(e) => update('city', e.target.value)}
                                            className="input-field text-sm"
                                            placeholder="وهران"
                                            required={tab === 'provider'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الولاية</label>
                                        <input
                                            type="text"
                                            value={form.wilaya}
                                            onChange={(e) => update('wilaya', e.target.value)}
                                            className="input-field text-sm"
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
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {loading ? 'جاري التسجيل...' : tab === 'user' ? 'إنشاء حساب' : 'تسجيل كمزود خدمة'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        لديك حساب؟{' '}
                        <Link href="/login" className="text-primary-600 font-medium hover:text-primary-700">
                            سجل الدخول
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-700 font-bold text-2xl shadow-xl animate-pulse">
                    ر
                </div>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
