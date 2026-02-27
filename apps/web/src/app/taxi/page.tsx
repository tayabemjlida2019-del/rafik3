'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import PremiumNavbar from '@/components/PremiumNavbar';

const carTypes = [
    { id: 'STANDARD', name: 'اقتصادية', icon: '🚗', pricePerKm: 50 },
    { id: 'LUXURY', name: 'مريحة', icon: '✨', pricePerKm: 120 },
    { id: 'VAN', name: 'عائلية', icon: '🚐', pricePerKm: 80 },
];

export default function TaxiRequestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [selectedCar, setSelectedCar] = useState(carTypes[0]);
    const [taxiListings, setTaxiListings] = useState<any[]>([]);
    const [fetchingTaxis, setFetchingTaxis] = useState(true);

    useEffect(() => {
        fetchTaxis();
    }, []);

    const fetchTaxis = async () => {
        try {
            const { data } = await api.get('/listings', { params: { type: 'TAXI' } });
            setTaxiListings(data.data || []);
        } catch {
            toast.error('فشل في تحميل بيانات السائقين');
        } finally {
            setFetchingTaxis(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pickup || !destination) {
            toast.error('يرجى تحديد نقطة الانطلاق والوصول');
            return;
        }

        setLoading(true);
        try {
            // Find a matching listing or use the first available taxi
            const targetListing = taxiListings[0]; // Simplified: pick the first available driver

            if (!targetListing) {
                toast.error('عذراً، لا يوجد سائقون متاحون حالياً في هذه المنطقة');
                return;
            }

            await api.post('/bookings', {
                listingId: targetListing.id,
                startDate: new Date(),
                endDate: new Date(),
                guests: 1,
                metadata: {
                    type: 'TAXI_REQUEST',
                    pickup,
                    destination,
                    carType: selectedCar.id,
                    estimatedPrice: 500,
                    carModel: targetListing.metadata?.carModel || 'سيارة رفيق'
                }
            });

            toast.success('تم إرسال طلبك! جاري البحث عن أقرب سائق...');
            // In a real app we'd redirect to a tracking page
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'فشل في طلب سيارة الأجرة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <PremiumNavbar />

            <div className="pt-24">
                {/* Content Header */}
                <div className="bg-slate-900 py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-noise opacity-5"></div>
                    <div className="absolute inset-0 geometric-overlay opacity-20"></div>
                    <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full"></div>

                    <div className="section-padding relative">
                        <div className="max-w-4xl">
                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-4">خدمات النقل</div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                رفيـق تـاكسي
                            </h1>
                            <p className="text-slate-400 text-lg font-normal max-w-2xl leading-relaxed">
                                تنقل بأمان وراحة في جميع أنحاء الجزائر، <br className="hidden md:block" /> مع شبكة من السائقين المحترفين وأفضل السيارات المتاحة.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="section-padding py-12 flex flex-col items-center">
                    <div className="max-w-2xl w-full">
                        <div className="bg-white rounded-[32px] border border-gray-100 p-8 md:p-12 shadow-sm relative -mt-20 mb-12">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">نقطة الانطلاق</label>
                                        <div className="relative">
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">📍</span>
                                            <input
                                                type="text"
                                                placeholder="أين أنت الآن؟"
                                                value={pickup}
                                                onChange={(e) => setPickup(e.target.value)}
                                                className="input-field pr-12 text-lg focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-center -my-2">
                                        <div className="w-1 h-8 bg-emerald-100 border-x-2 border-dotted border-emerald-300"></div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">وجهتك</label>
                                        <div className="relative">
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">🏁</span>
                                            <input
                                                type="text"
                                                placeholder="إلى أين تتجه؟"
                                                value={destination}
                                                onChange={(e) => setDestination(e.target.value)}
                                                className="input-field pr-12 text-lg focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-4">اختر نوع السيارة</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {carTypes.map((car) => (
                                            <button
                                                key={car.id}
                                                type="button"
                                                onClick={() => setSelectedCar(car)}
                                                className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2 ${selectedCar.id === car.id ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-emerald-200'}`}
                                            >
                                                <span className="text-3xl">{car.icon}</span>
                                                <span className="text-sm font-bold">{car.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-emerald-700 font-bold mb-1 uppercase tracking-wider">السعر المقدر</p>
                                            <p className="text-2xl font-black text-emerald-900">~ 500 دج</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs text-emerald-600 mb-1">وقت الوصول</p>
                                            <p className="font-bold">5 - 10 دقائق</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`btn-primary w-full py-5 text-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>🚕</span>
                                            <span>اطلب الآن</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="mt-12 text-center text-gray-400 text-sm">
                            <p>بطلبك لإحدى السيارات، أنت توافق على شروط وأحكام منصة الرفيق</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
