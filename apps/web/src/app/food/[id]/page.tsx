'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Gallery from '@/components/Gallery';
import toast from 'react-hot-toast';
import PremiumNavbar from '@/components/PremiumNavbar';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
}

export default function RestaurantDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [listing, setListing] = useState<any>(null);
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Record<string, number>>({});
    const [isOrdering, setIsOrdering] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
            if (menuRes.data?.[0]) {
                setActiveCategory(menuRes.data[0].id);
            }
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

    const totalItems = Object.values(order).reduce((a, b) => a + b, 0);

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
            toast.success('تم إرسال طلبك بنجاح! المطعم سيقوم بالتأكيد قريباً 🎉');
            setOrder({});
            router.push('/my-bookings');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'عذراً، حدث خطأ أثناء إرسال الطلب');
        } finally {
            setIsOrdering(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-500 text-sm font-bold animate-pulse">جاري تحميل قائمة المطعم...</span>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center section-padding">
                <div className="text-7xl mb-6">🍽️</div>
                <h2 className="text-2xl font-black text-white mb-3 text-center">المطعم غير موجود</h2>
                <p className="text-slate-500 mb-8">قد يكون المطعم غير متاح حالياً.</p>
                <Link href="/food" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95">العودة لقائمة المطاعم</Link>
            </div>
        );
    }

    const rating = listing.avgRating || 4.5;

    return (
        <div className="min-h-screen bg-[#0a0e1a]">
            <PremiumNavbar />

            {/* Hero Header with gradient overlay */}
            <div className="pt-24 pb-12 border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-600/10 via-orange-500/5 to-transparent"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full"></div>
                
                <div className="section-padding relative">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">
                        <Link href="/" className="hover:text-[#C6A75E] transition-colors">الـرئيسية</Link>
                        <span className="opacity-30">/</span>
                        <Link href="/food" className="hover:text-orange-500 transition-colors">المـطاعم</Link>
                        <span className="opacity-30">/</span>
                        <span className="text-white">{listing.title}</span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-[28px] flex items-center justify-center text-5xl shadow-2xl shadow-orange-900/30 border border-white/10 shrink-0">🍲</div>
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-orange-600/20 text-orange-400 border border-orange-600/30 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">مطعم متميز</span>
                                {listing.provider?.kycStatus === 'VERIFIED' && (
                                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">✅ موثق</span>
                                )}
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    مفتوح الآن
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">{listing.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg rounded-bl-none flex items-center justify-center text-white font-black text-sm">
                                        {rating.toFixed(1)}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-sm">{rating >= 4.5 ? 'ممتاز' : 'جيد'}</div>
                                        <div className="text-slate-500 text-xs">{listing.totalReviews || 0} تقييم</div>
                                    </div>
                                </div>
                                <span className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl">
                                    <span className="text-orange-500 text-lg">📍</span> {listing.city}{listing.address ? `، ${listing.address}` : ''}
                                </span>
                                <span className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl">
                                    <span className="text-lg">🕒</span> 10:00 - 23:00
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="section-padding py-12">
                <div className="max-w-[1400px] mx-auto">
                    {/* Gallery Section */}
                    <div className="mb-16">
                        <Gallery images={listing.images} />
                    </div>

                    {/* Restaurant Info Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center space-y-2">
                            <div className="text-2xl">🍽️</div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">نوع المطبخ</div>
                            <div className="text-white font-bold text-sm">{listing.metadata?.cuisine || 'جزائري تقليدي'}</div>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center space-y-2">
                            <div className="text-2xl">💰</div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">متوسط السعر</div>
                            <div className="text-white font-bold text-sm">{listing.basePrice?.toLocaleString() || '800'} - {((listing.basePrice || 800) * 3).toLocaleString()} دج</div>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center space-y-2">
                            <div className="text-2xl">🚗</div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">التوصيل</div>
                            <div className="text-emerald-400 font-bold text-sm">متاح</div>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-center space-y-2">
                            <div className="text-2xl">⏱️</div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">وقت التحضير</div>
                            <div className="text-white font-bold text-sm">20-35 دقيقة</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        {/* Menu Section */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-4">
                                    <span className="w-1 h-8 bg-orange-500 rounded-full"></span>
                                    قائمة الطعام
                                </h2>

                                {/* Category Tabs */}
                                {menu.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-8">
                                        {menu.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => setActiveCategory(category.id)}
                                                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                                                    activeCategory === category.id 
                                                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30' 
                                                        : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-12">
                                {menu.length > 0 ? (
                                    menu
                                        .filter(c => !activeCategory || c.id === activeCategory)
                                        .map((category) => (
                                        <div key={category.id} className="space-y-6 animate-fade-in">
                                            <h3 className="text-xl font-black text-white flex items-center gap-4 opacity-80">
                                                <span className="text-2xl">{category.name === 'مقبلات' ? '🥗' : category.name === 'أطباق رئيسية' ? '🍖' : category.name === 'حلويات' ? '🍰' : category.name === 'مشروبات' ? '🥤' : '🍲'}</span>
                                                {category.name}
                                                <div className="flex-1 h-px bg-white/5"></div>
                                                <span className="text-sm text-slate-500 font-medium">{category.items.length} أطباق</span>
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {category.items.map((item: MenuItem) => {
                                                    const qty = order[item.id] || 0;
                                                    return (
                                                        <div key={item.id} className={`flex flex-col md:flex-row gap-5 p-5 rounded-2xl border transition-all group overflow-hidden relative ${qty > 0 ? 'bg-orange-500/[0.06] border-orange-500/20' : 'bg-white/[0.03] border-white/5 hover:border-orange-500/20'}`}>
                                                            {qty > 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full"></div>}
                                                            <div className="w-full md:w-28 h-28 bg-[#020617] rounded-xl flex items-center justify-center text-3xl shrink-0 overflow-hidden border border-white/5 group-hover:border-orange-500/20 transition-all">
                                                                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : '🍽️'}
                                                            </div>
                                                            <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
                                                                <div>
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">{item.name}</h3>
                                                                        <span className="font-black text-xl text-orange-400 whitespace-nowrap">{item.price.toLocaleString()} <span className="text-xs text-slate-500">دج</span></span>
                                                                    </div>
                                                                    <p className="text-slate-500 text-sm leading-relaxed font-light mb-4 line-clamp-2">{item.description}</p>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    {qty > 0 ? (
                                                                        <div className="flex items-center bg-[#020617] rounded-xl border border-white/10 p-1">
                                                                            <button
                                                                                onClick={() => updateQuantity(item.id, -1)}
                                                                                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5 text-white font-bold transition-all active:scale-90"
                                                                            >
                                                                                −
                                                                            </button>
                                                                            <span className="font-black w-8 text-center text-orange-400">{qty}</span>
                                                                            <button
                                                                                onClick={() => updateQuantity(item.id, 1)}
                                                                                className="w-9 h-9 rounded-lg bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 shadow-lg shadow-orange-600/20 active:scale-90 transition-all font-bold"
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => updateQuantity(item.id, 1)}
                                                                            className="flex items-center gap-2 bg-orange-600/10 text-orange-400 border border-orange-600/20 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all active:scale-95"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                                            أضف للسلة
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-white/[0.03] rounded-3xl border border-white/5">
                                        <div className="text-5xl mb-4 opacity-30">🍽️</div>
                                        <p className="text-slate-500 font-bold">عذراً، لا توجد أطباق متاحة حالياً.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cart Sidebar */}
                        <aside className="relative">
                            <div className="bg-gradient-to-b from-[#111827] to-[#0d1220] border border-white/[0.06] rounded-[28px] sticky top-28 shadow-2xl shadow-black/60 overflow-hidden">
                                {/* Cart Header */}
                                <div className="bg-orange-600/10 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-center justify-between">
                                    <h3 className="text-lg font-black text-white flex items-center gap-2.5">
                                        <span className="text-2xl">🛒</span>
                                        سلة المشتريات
                                    </h3>
                                    {totalItems > 0 && (
                                        <span className="w-7 h-7 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg shadow-orange-900/40">{totalItems}</span>
                                    )}
                                </div>

                                <div className="p-6">
                                    {Object.keys(order).length > 0 ? (
                                        <div className="space-y-6">
                                            <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar">
                                                {menu.flatMap(c => c.items).filter(i => order[i.id]).map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group/item animate-fade-in">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 text-[10px] font-black flex items-center justify-center">x{order[item.id]}</span>
                                                            <span className="text-white font-bold text-sm group-hover/item:text-orange-400 transition-colors">{item.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-white font-black text-sm">{(item.price * order[item.id]).toLocaleString()} دج</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, -order[item.id])}
                                                                className="w-6 h-6 rounded-full bg-white/5 text-slate-500 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all text-xs"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-6 border-t border-white/5 space-y-5">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400 font-medium">المجموع الفرعي</span>
                                                    <span className="text-white font-bold">{calculateTotal().toLocaleString()} دج</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400 font-medium">التوصيل</span>
                                                    <span className="text-emerald-400 font-bold">مجاني</span>
                                                </div>
                                                <div className="border-t border-white/5 pt-4 flex justify-between items-end">
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">الإجمالي</span>
                                                        <span className="text-3xl font-black text-white">{calculateTotal().toLocaleString()} <span className="text-lg text-slate-400">دج</span></span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handlePlaceOrder}
                                                    disabled={isOrdering}
                                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-900/30 active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group/btn"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-l from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                                                    <div className="relative z-10 flex items-center gap-2">
                                                        {isOrdering ? (
                                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <>تأكـيد الـطلب الآن 🚀</>
                                                        )}
                                                    </div>
                                                </button>
                                                
                                                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/[0.06] border border-emerald-500/10 px-3 py-2.5 rounded-xl">
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                                    طلب آمن وموثوق 100%
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 space-y-4">
                                            <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto flex items-center justify-center text-4xl opacity-20 grayscale border border-white/5">🥗</div>
                                            <p className="text-slate-500 text-sm font-bold leading-relaxed px-4">سلتك فارغة حالياً..<br/>أضف بعض الأطباق اللذيذة لتبدأ!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Bar */}
            {totalItems > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0e1a]/95 backdrop-blur-xl border-t border-white/10 p-4 z-50 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-slate-500 font-bold">{totalItems} أطباق</div>
                            <span className="text-2xl font-black text-white">{calculateTotal().toLocaleString()} <span className="text-sm text-slate-400">دج</span></span>
                        </div>
                        <button 
                            onClick={handlePlaceOrder}
                            disabled={isOrdering}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-black py-3.5 px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-900/30 flex items-center gap-2"
                        >
                            {isOrdering ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>🛒 تأكيد الطلب</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
