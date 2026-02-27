'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import PremiumNavbar from '@/components/PremiumNavbar';
import toast from 'react-hot-toast';

interface Booking {
    id: string;
    bookingRef: string;
    status: string;
    totalAmount: number;
    checkIn: string;
    checkOut: string;
    createdAt: string;
    listing: {
        id: string;
        title: string;
        type: string;
        city: string;
        images: Array<{ url: string; thumbnailUrl: string }>;
    };
    transaction?: {
        id: string;
        status: string;
        paymentMethod: string;
        receiptUrl?: string;
    };
}

const statusConfig: Record<string, { label: string; class: string }> = {
    PENDING: { label: 'قيد الانتظار', class: 'bg-amber-100 text-amber-700' },
    CONFIRMED: { label: 'تم التأكيد', class: 'bg-emerald-100 text-emerald-700' },
    ESCROW_HELD: { label: 'المبلغ محجوز (مضمون)', class: 'bg-primary-100 text-primary-700' },
    COMPLETED: { label: 'مكتمل', class: 'bg-blue-100 text-blue-700' },
    CANCELLED_BY_USER: { label: 'ملغي من قبلك', class: 'bg-gray-100 text-gray-700' },
    REJECTED: { label: 'مرفوض', class: 'bg-red-100 text-red-700' },
};

const paymentStatusConfig: Record<string, { label: string; class: string }> = {
    PENDING: { label: 'انتظار الدفع', class: 'text-amber-600' },
    VERIFICATION_REQUIRED: { label: 'قيد المراجعة', class: 'text-blue-600' },
    CAPTURED: { label: 'تم الدفع', class: 'text-emerald-600' },
    FAILED: { label: 'دفع مرفوض', class: 'text-red-600' },
};

// Payment Modal Component
function PaymentModal({ booking, onClose, onRefresh }: { booking: Booking; onClose: () => void; onRefresh: () => void }) {
    const [receiptUrl, setReceiptUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiptUrl) return;
        setLoading(true);
        setError('');
        try {
            await api.post(`/payments/${booking.id}/receipt`, { receiptUrl });
            onRefresh();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل في رفع الإيصال');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">إتمام الدفع (CCP/Baridimob)</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
                        <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                            <span>ℹ️</span> معلومات الحساب البريدي
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-primary-600">الاسم:</span>
                                <span className="font-bold text-primary-900">AL-RAFIQ PLATFORM DZ</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary-600">رقم الحساب (CCP):</span>
                                <span className="font-bold text-primary-900 font-mono tracking-wider">0023456789 99</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary-600">المبلغ المطلوب:</span>
                                <span className="font-bold text-primary-900">{booking.totalAmount.toLocaleString()} دج</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">رابط صورة الإيصال (رابط تجريبي)</label>
                        <input
                            type="url"
                            required
                            placeholder="https://example.com/receipt.jpg"
                            value={receiptUrl}
                            onChange={(e) => setReceiptUrl(e.target.value)}
                            className="input-field"
                        />
                        <p className="text-xs text-gray-400">في هذه النسخة التجريبية، يرجى وضع رابط لصورة الإيصال.</p>
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 flex items-center justify-center gap-3"
                    >
                        {loading ? 'جاري الرفع...' : 'تأكيد إرسال الإيصال'}
                    </button>

                    <p className="text-center text-xs text-gray-500 leading-relaxed">
                        بمجرد التأكيد، سيقوم فريقنا بمراجعة الإيصال خلال 24 ساعة. أموالك في أمان كضمان (Escrow).
                    </p>
                </form>
            </div>
        </div>
    );
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings');
            setBookings(data.data || []);
        } catch (err) {
            setError('فشل في تحميل الحجوزات. يرجى التأكد من تسجيل الدخول.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟')) return;

        try {
            await api.patch(`/bookings/${id}/cancel`);
            toast.success('تم إلغاء الحجز بنجاح');
            fetchBookings();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'فشل في إلغاء الحجز');
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen section-padding py-12">
                <div className="h-10 bg-gray-100 rounded w-48 mb-8 animate-pulse"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse border border-gray-100"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <PremiumNavbar />

            <main className="section-padding py-32 max-w-4xl mx-auto">
                <div className="mb-12">
                    <div className="text-[10px] font-black text-[#833AB4] uppercase tracking-[0.3em] mb-4">لـوحة الـتحكم</div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#111827] mb-3">قائمة حجوزاتي</h1>
                    <p className="text-gray-500 font-medium text-lg">تابع حالة طلبات الحجز الخاصة بك وتواصل مع مقدمي الخدمة</p>
                </div>

                {error ? (
                    <div className="card p-12 text-center">
                        <div className="text-4xl mb-4">🔐</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{error}</h2>
                        <Link href="/login" className="btn-primary px-8">تسجيل الدخول</Link>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="card p-16 text-center">
                        <div className="text-6xl mb-6">📭</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">لا توجد حجوزات بعد</h2>
                        <p className="text-gray-500 mb-8 text-lg">لم تقم بإجراء أي حجز حتى الآن. ابدأ باكتشاف العروض المتاحة!</p>
                        <Link href="/" className="btn-primary px-12 py-3">اكتشف العروض</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="card-interactive bg-white p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm hover:shadow-md transition-all border border-gray-100">
                                {/* Thumbnail */}
                                <div className="w-full md:w-48 h-32 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                                    {booking.listing?.images?.[0] ? (
                                        <img
                                            src={booking.listing.images[0].thumbnailUrl || booking.listing.images[0].url}
                                            alt={booking.listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-50 to-gray-100">
                                            {booking.listing?.type === 'HOTEL' ? '🏨' : '🏠'}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-primary-600 tracking-[0.2em] uppercase">
                                                {booking.bookingRef}
                                            </span>
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                                                {booking.listing?.title}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${statusConfig[booking.status]?.class || 'bg-gray-100 text-gray-600'}`}>
                                                {statusConfig[booking.status]?.label || booking.status}
                                            </span>
                                            {booking.transaction && (
                                                <span className={`text-[10px] font-bold ${paymentStatusConfig[booking.transaction.status]?.class}`}>
                                                    💸 {paymentStatusConfig[booking.transaction.status]?.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50/80 p-5 rounded-2xl border border-gray-100/50">
                                        <div>
                                            <p className="text-gray-500 mb-1 leading-none text-[11px] font-bold uppercase tracking-wider">تاريخ الوصول</p>
                                            <p className="font-bold text-gray-900">{new Date(booking.checkIn).toLocaleDateString('ar-DZ')}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1 leading-none text-[11px] font-bold uppercase tracking-wider">تاريخ المغادرة</p>
                                            <p className="font-bold text-gray-900">{new Date(booking.checkOut).toLocaleDateString('ar-DZ')}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1 leading-none text-[11px] font-bold uppercase tracking-wider">المبلغ الإجمالي</p>
                                            <p className="font-bold text-primary-600">{booking.totalAmount.toLocaleString()} دج</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1 leading-none text-[11px] font-bold uppercase tracking-wider">تاريخ الطلب</p>
                                            <p className="font-bold text-gray-900">{new Date(booking.createdAt).toLocaleDateString('ar-DZ')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <Link
                                            href={booking.listing?.type === 'HOTEL' ? `/hotels/${booking.listing?.id}` : `/homes/${booking.listing?.id}`}
                                            className="btn-secondary text-sm py-2 px-6 shadow-sm border-gray-100"
                                        >
                                            عرض الخدمة
                                        </Link>

                                        {booking.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleCancel(booking.id)}
                                                className="text-sm font-black text-rose-500 hover:bg-rose-50 px-5 py-2.5 rounded-xl transition-all border border-transparent hover:border-rose-100"
                                            >
                                                إلغاء الطلب
                                            </button>
                                        )}

                                        {booking.status === 'PENDING' && booking.transaction?.status === 'PENDING' && (
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="btn-primary text-sm py-2.5 px-8 shadow-primary-600/20"
                                            >
                                                دفع المستحقات
                                            </button>
                                        )}

                                        {booking.transaction?.status === 'VERIFICATION_REQUIRED' && (
                                            <span className="text-sm font-bold text-blue-500 bg-blue-50 px-6 py-2 rounded-xl border border-blue-100 animate-pulse">
                                                🔍 قيد مراجعة الدفع
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {selectedBooking && (
                <PaymentModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onRefresh={fetchBookings}
                />
            )}
        </div>
    );
}
