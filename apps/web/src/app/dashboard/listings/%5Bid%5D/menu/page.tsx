'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import DashboardNavbar from '@/components/DashboardNavbar';
import toast from 'react-hot-toast';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

interface Category {
    id: string;
    name: string;
    items: MenuItem[];
}

export default function MenuEditorPage() {
    const { id: listingId } = useParams();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showItemModal, setShowItemModal] = useState<{ show: boolean, categoryId?: string, item?: MenuItem }>({ show: false });
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Form States
    const [catName, setCatName] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemDesc, setItemDesc] = useState('');
    const [itemPrice, setItemPrice] = useState(0);
    const [itemImg, setItemImg] = useState('');

    const fetchMenu = async () => {
        try {
            const { data } = await api.get(`/food/menu/${listingId}`);
            setCategories(data);
        } catch (err) {
            toast.error('فشل في تحميل المنيو');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (listingId) fetchMenu();
    }, [listingId]);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/food/categories/${listingId}`, { name: catName });
            toast.success('تمت إضافة الفئة');
            setCatName('');
            setShowCategoryModal(false);
            fetchMenu();
        } catch (err) {
            toast.error('فشل في إضافة الفئة');
        }
    };

    const handleDeleteCategory = async (catId: string) => {
        if (!confirm('هل تريد حذف هذه الفئة بجميع أطباقها؟')) return;
        try {
            await api.delete(`/food/categories/manage/${catId}`);
            toast.success('تم حذف الفئة');
            fetchMenu();
        } catch (err) {
            toast.error('فشل في الحذف');
        }
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (showItemModal.item) {
                // Update
                await api.patch(`/food/items/${showItemModal.item.id}`, {
                    name: itemName,
                    description: itemDesc,
                    price: itemPrice,
                    imageUrl: itemImg
                });
                toast.success('تم التحديث');
            } else {
                // Create
                await api.post(`/food/items/${showItemModal.categoryId}`, {
                    name: itemName,
                    description: itemDesc,
                    price: itemPrice,
                    imageUrl: itemImg
                });
                toast.success('تمت الإضافة');
            }
            setShowItemModal({ show: false });
            fetchMenu();
        } catch (err) {
            toast.error('فشل في حفظ الطبق');
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('حذف هذا الطبق؟')) return;
        try {
            await api.delete(`/food/items/${itemId}`);
            toast.success('تم الحذف');
            fetchMenu();
        } catch (err) {
            toast.error('فشل في الحذف');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <DashboardNavbar />

            <main className="section-padding py-12">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                        <div>
                            <h1 className="text-3xl font-black text-[#E8EAED]">محرر قائمة الطعام</h1>
                            <p className="text-[#9AA0A6] text-sm mt-1">نظم أصنافك وأطباقك ليراها الزبائن</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="btn-blue flex items-center gap-2 text-xs"
                    >
                        <span>إضافة فئة جديدة</span>
                        <span className="text-lg">📁</span>
                    </button>
                </div>

                <div className="space-y-12">
                    {categories.map((cat) => (
                        <div key={cat.id} className="dashboard-card overflow-hidden">
                            <div className="p-8 bg-slate-800/50 flex justify-between items-center border-b border-blue-500/10">
                                <h3 className="text-xl font-black text-[#E8EAED]">{cat.name}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setShowItemModal({ show: true, categoryId: cat.id });
                                            setItemName(''); setItemDesc(''); setItemPrice(0); setItemImg('');
                                        }}
                                        className="text-blue-500 hover:bg-blue-500/10 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all"
                                    >
                                        + أضف طبقاً
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl text-[10px] font-black transition-all"
                                    >
                                        حذف الفئة
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {cat.items.map((item) => (
                                        <div key={item.id} className="bg-[#1A1D22] rounded-2xl border border-[#C6A75E]/10 flex flex-col group">
                                            <div className="aspect-video bg-black/20 rounded-t-2xl overflow-hidden relative">
                                                {item.imageUrl && (
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                )}
                                                <div className="absolute top-3 right-3 flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setShowItemModal({ show: true, item });
                                                            setItemName(item.name); setItemDesc(item.description); setItemPrice(item.price); setItemImg(item.imageUrl);
                                                        }}
                                                        className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs flex items-center justify-center hover:bg-[#C6A75E] hover:text-black transition-all"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs flex items-center justify-center hover:bg-red-500 transition-all"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-[#E8EAED]">{item.name}</h4>
                                                    <span className="text-[#C6A75E] font-black text-sm">{item.price} دج</span>
                                                </div>
                                                <p className="text-[#9AA0A6] text-xs leading-relaxed line-clamp-2">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modals - Simplified for the sake of presentation */}
                {(showCategoryModal || showItemModal.show) && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="dashboard-card w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
                            <h2 className="text-2xl font-black text-[#E8EAED] mb-8">
                                {showCategoryModal ? 'إضافة فئة جديدة' : showItemModal.item ? 'تعديل طبق' : 'إضافة طبق جديد'}
                            </h2>
                            <form onSubmit={showCategoryModal ? handleAddCategory : handleSaveItem} className="space-y-6">
                                {showCategoryModal ? (
                                    <div>
                                        <label className="block text-[#9AA0A6] text-[10px] font-black uppercase mb-2 tracking-widest">اسم الفئة</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-[#1A1D22] border border-[#C6A75E]/20 rounded-xl px-4 py-3 text-[#E8EAED] focus:border-[#C6A75E] outline-none transition-all"
                                            value={catName}
                                            onChange={(e) => setCatName(e.target.value)}
                                            placeholder="مثال: المقبلات، المشويات..."
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-[#9AA0A6] text-[10px] font-black uppercase mb-2 tracking-widest">اسم الطبق</label>
                                            <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full bg-[#1A1D22] border border-[#C6A75E]/20 rounded-xl px-4 py-3 text-[#E8EAED] focus:border-[#C6A75E] outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[#9AA0A6] text-[10px] font-black uppercase mb-2 tracking-widest">السعر (دج)</label>
                                            <input type="number" required value={itemPrice} onChange={(e) => setItemPrice(Number(e.target.value))} className="w-full bg-[#1A1D22] border border-[#C6A75E]/20 rounded-xl px-4 py-3 text-[#E8EAED] focus:border-[#C6A75E] outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[#9AA0A6] text-[10px] font-black uppercase mb-2 tracking-widest">الوصف</label>
                                            <textarea value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} rows={3} className="w-full bg-[#1A1D22] border border-[#C6A75E]/20 rounded-xl px-4 py-3 text-[#E8EAED] focus:border-[#C6A75E] outline-none transition-all resize-none"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-[#9AA0A6] text-[10px] font-black uppercase mb-2 tracking-widest">رابط الصورة (اختياري)</label>
                                            <input type="text" value={itemImg} onChange={(e) => setItemImg(e.target.value)} className="w-full bg-[#1A1D22] border border-[#C6A75E]/20 rounded-xl px-4 py-3 text-[#E8EAED] focus:border-[#C6A75E] outline-none transition-all" />
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="btn-gold flex-1 py-4 text-[10px] tracking-widest">حفظ البيانات</button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowCategoryModal(false); setShowItemModal({ show: false }); }}
                                        className="flex-1 bg-white/5 text-[#9AA0A6] py-4 rounded-xl text-[10px] hover:bg-white/10 transition-all font-black uppercase tracking-widest"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
