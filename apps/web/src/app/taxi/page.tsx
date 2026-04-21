'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import PremiumNavbar from '@/components/PremiumNavbar';

const carTypes = [
    { id: 'STANDARD', name: 'اقتصادية', icon: '🚗', luxury: 'حل عملي يومي', pricePerKm: 50 },
    { id: 'LUXURY', name: 'مريحة (VIP)', icon: '✨', luxury: 'فخامة وراحة قصوى', pricePerKm: 120 },
    { id: 'VAN', name: 'عائلية', icon: '🚐', luxury: 'مساحة لـ 7 أشخاص', pricePerKm: 80 },
];

export default function TaxiRequestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [selectedCar, setSelectedCar] = useState(carTypes[0]);
    const [taxiListings, setTaxiListings] = useState<any[]>([]);

    useEffect(() => {
        const fetchTaxis = async () => {
            try {
                const { data } = await api.get('/listings', { params: { type: 'TAXI' } });
                setTaxiListings(data.data || []);
            } catch {
                console.error('Failed to load taxi data');
            }
        };
        fetchTaxis();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pickup || !destination) {
            toast.error('يرجى تحديد نقطة الانطلاق والوجهة');
            return;
        }

        setLoading(true);
        try {
            const targetListing = taxiListings[0]; 
            if (!targetListing) {
                toast.error('عذراً، لا يوجد سائقون متاحون حالياً');
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
                }
            });

            toast.success('تم إرسال طلبك! جاري البحث عن سائق...');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'فشل في طلب سيارة الأجرة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e1a]">
            <PremiumNavbar />

            <div className="pt-24 pb-20">
                {/* Hero / Header */}
                <div className="relative py-16 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#003580]/30 to-transparent"></div>
                    <div className="section-padding relative">
                        <div className="max-w-4xl">
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                                رفـيق <span className="text-[#C6A75E]">تـاكسي</span>
                            </h1>
                            <p className="text-slate-400 text-lg font-light leading-relaxed max-w-2xl">
                                تنقّل عبر الجزائر بأمان وفخامة. شبكة من السائقين المحترفين على مدار الساعة لخدمتك.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="section-padding flex flex-col lg:flex-row gap-12 items-start">
                    {/* Request Form */}
                    <div className="flex-1 w-full">
                        <div className="bg-[#111827] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6A75E]/5 blur-[60px] rounded-full"></div>
                            
                            <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                                <div className="space-y-6">
                                    <div className="relative">
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xl z-10">📍</div>
                                        <input
                                            type="text"
                                            placeholder="نقطة الانطلاق (أين أنت الآن؟)"
                                            value={pickup}
                                            onChange={(e) => setPickup(e.target.value)}
                                            className="w-full px-5 pr-16 py-6 rounded-3xl bg-white/5 border border-white/10 text-lg font-bold text-white placeholder:text-slate-600 outline-none focus:border-[#C6A75E] transition-all"
                                        />
                                    </div>

                                    <div className="flex justify-center -my-3">
                                        <div className="w-1.5 h-10 bg-gradient-to-b from-[#C6A75E] to-transparent opacity-30 rounded-full"></div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xl z-10">🏁</div>
                                        <input
                                            type="text"
                                            placeholder="إلى أين تتجه؟"
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                            className="w-full px-5 pr-16 py-6 rounded-3xl bg-white/5 border border-white/10 text-lg font-bold text-white placeholder:text-slate-600 outline-none focus:border-[#C6A75E] transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-[#C6A75E] mb-6 block">اختر نوع السيارة</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {carTypes.map((car) => (
                                            <button
                                                key={car.id}
                                                type="button"
                                                onClick={() => setSelectedCar(car)}
                                                className={`p-6 rounded-3xl border-2 transition-all flex md:flex-col items-center gap-4 text-right md:text-center ${selectedCar.id === car.id ? 'border-[#C6A75E] bg-[#C6A75E]/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                            >
                                                <span className="text-4xl">{car.icon}</span>
                                                <div>
                                                    <p className="font-black text-white">{car.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold mt-1">{car.luxury}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-[#003580]/40 to-transparent border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#C6A75E] block mb-2">السعر التقريبي</span>
                                        <span className="text-4xl font-black text-white">~ 500 <span className="text-lg">دج</span></span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-gold w-full md:w-auto px-12 text-xl flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            'أطلـب الآن 🚕'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Features Sidebar */}
                    <div className="lg:w-96 w-full space-y-6">
                        <div className="bg-white/5 border border-white/5 rounded-[40px] p-8">
                            <h3 className="text-xl font-bold text-white mb-8">لماذا رفيق تاكسي؟</h3>
                            <div className="space-y-8">
                                {[
                                    { icon: '🛡️', title: 'أمان تام', desc: 'سائقون موثوقون وتقييمات حقيقية لكل رحلة' },
                                    { icon: '⏱️', title: 'سرعة الاستجابة', desc: 'سائق في انتظارك خلال أقل من 10 دقائق' },
                                    { icon: '💳', title: 'أسعار عادلة', desc: 'تقدير دقيق للسعر قبل تأكيد الطلب' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <span className="text-3xl">{item.icon}</span>
                                        <div>
                                            <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-500 leading-relaxed font-light">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] rounded-[40px] p-8 border border-white/5 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-white mb-4">هل أنت سائق محترف؟</h3>
                                <p className="text-sm text-slate-400 mb-6 leading-relaxed">انضم إلى أسطول رفيق وابدأ بجني الأرباح مع أكبر شبكة نقل في الجزائر.</p>
                                <Link href="/register?type=provider" className="text-[#C6A75E] font-black text-sm uppercase tracking-widest hover:underline">انضم الآن ←</Link>
                            </div>
                            <div className="absolute -bottom-6 -left-6 text-9xl opacity-10 grayscale">🚕</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
