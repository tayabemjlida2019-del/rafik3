'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Gallery from '@/components/Gallery';
import toast from 'react-hot-toast';
import PremiumNavbar from '@/components/PremiumNavbar';

interface MenuItem {
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
}

export default function RestaurantDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [listing, setListing] = useState<any>(null);
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Record<string, number>>({});
    const [isOrdering, setIsOrdering] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [params.id]);

    const fetchDetails = async () => {
        try {
            const [listingRes, menuRes] = await Promise.all([
                api.get(`/listings/${params.id}`),
                api.get(`/food/menu/${params.id}`)
            ]);
            setListing(listingRes.data);
            setMenu(menuRes.data || []);
        } catch {
            toast.error('فشل في تحميل تفاصيل المطعم');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setOrder(prev => {
            const newCount = (prev[itemId] || 0) + delta;
            if (newCount <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: newCount };
        });
    };

    const calculateTotal = () => {
        let total = 0;
        menu.forEach(category => {
            category.items.forEach((item: any) => {
                if (order[item.id]) {
                    total += item.price * order[item.id];
                }
            });
        });
        return total;
    };

    const handlePlaceOrder = async () => {
        if (Object.keys(order).length === 0) {
            toast.error('أضف بعض الأطباق إلى سلتك أولاً');
            return;
        }

        setIsOrdering(true);
        try {
            await api.post('/bookings', {
                listingId: listing.id,
                startDate: new Date(),
                endDate: new Date(),
                guests: 1,
                metadata: {
                    type: 'FOOD_ORDER',
                    items: order,
                    totalPrice: calculateTotal()
                }
            });
            toast.success('تم إرسال طلبك بنجاح! المطعم سيقوم بالتأكيد قريباً');
            setOrder({});
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'عذراً، حدث خطأ أثناء إرسال الطلب');
        } finally {
            setIsOrdering(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen section-padding py-12 animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-100 rounded-2xl mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-32 bg-gray-50 rounded w-full"></div>
                        <div className="h-32 bg-gray-50 rounded w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">المطعم غير موجود</h2>
                <Link href="/food" className="btn-primary">العودة لقائمة المطاعم</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <PremiumNavbar />

            {/* Header */}
            <div className="pt-24 bg-[#F9FAFB] border-b border-gray-100">
                <div className="section-padding py-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-[32px] flex items-center justify-center text-5xl shadow-lg shadow-orange-500/20 text-white">🍲</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-orange-600/10 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">مطعم متميز</span>
                                {listing.provider?.kycStatus === 'VERIFIED' && (
                                    <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">✅ موثق</span>
                                )}
                            </div>
                            <h1 className="text-4xl font-black text-[#111827] mb-3">{listing.title}</h1>
                            <div className="flex items-center gap-6 text-sm font-bold text-[#9CA3AF]">
                                <span className="flex items-center gap-2">
                                    <span className="text-orange-500">📍</span> {listing.city}، {listing.address}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="text-orange-500">⭐</span> {listing.avgRating} ({listing.totalReviews} تقييم)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="section-padding py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Menu Section */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-2 border-b-4 border-orange-500 inline-block">قائمة الطعام (Ménu)</h2>

                            <div className="space-y-12">
                                {menu.length > 0 ? (
                                    menu.map((category) => (
                                        <div key={category.id} className="space-y-6">
                                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                                <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                                                {category.name}
                                            </h3>
                                            <div className="grid grid-cols-1 gap-6">
                                                {category.items.map((item: any) => (
                                                    <div key={item.id} className="flex gap-6 p-4 rounded-2xl hover:bg-orange-50/30 transition-colors border border-transparent hover:border-orange-100">
                                                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                                                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : '🍽️'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                                                <span className="font-bold text-orange-600">{item.price} دج</span>
                                                            </div>
                                                            <p className="text-gray-500 text-sm mb-4">{item.description}</p>

                                                            <div className="flex items-center gap-4">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, -1)}
                                                                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-sm active:scale-90 transition-all font-bold"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="font-bold w-4 text-center">{order[item.id] || 0}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, 1)}
                                                                    className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 hover:shadow-md active:scale-90 transition-all font-bold"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 bg-gray-50 p-8 rounded-2xl text-center">لا توجد أطباك متاحة في القائمة حالياً</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Order Summary Sidebar */}
                    <aside>
                        <div className="card sticky top-24 p-6 border-2 border-orange-100 shadow-xl shadow-orange-500/5">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="text-2xl">🛒</span>
                                سلة الطلبات
                            </h3>

                            {Object.keys(order).length > 0 ? (
                                <>
                                    <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                                        {menu.flatMap(c => c.items).filter(i => order[i.id]).map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-lg">{order[item.id]}x</span>
                                                    <span className="text-gray-700">{item.name}</span>
                                                </div>
                                                <span className="font-medium">{item.price * order[item.id]} دج</span>
                                            </div>
                                        )
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 space-y-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>المجموع الكلي:</span>
                                            <span className="text-orange-600">{calculateTotal()} دج</span>
                                        </div>
                                        <p className="text-xs text-gray-500 text-center">السعر شامل للرسوم (لا يشمل التوصيل)</p>

                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={isOrdering}
                                            className={`btn-primary w-full py-4 text-lg bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 ${isOrdering ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {isOrdering ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : 'تأكيد الطلب الآن'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-4">🍽️</div>
                                    <p className="text-gray-500 text-sm">سلتك فارغة.. اختر ما تشتهيه من القائمة!</p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
