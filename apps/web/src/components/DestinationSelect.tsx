'use client';

import { useState, useRef, useEffect } from 'react';

const POPULAR_DESTINATIONS = [
    { name: 'الجزائر العاصمة', type: 'مدينة', icon: '🏙️' },
    { name: 'وهران', type: 'مدينة ساحلية', icon: '🌊' },
    { name: 'قسنطينة', type: 'مدينة الجسور', icon: '🌉' },
    { name: 'غرداية', type: 'تراث عالمي', icon: '🕌' },
    { name: 'بجاية', type: 'طبيعة وجمال', icon: '🌲' },
    { name: 'جيجل', type: 'شواطئ ساحرة', icon: '🏖️' },
];

const WILAYAS = [
    'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار', 'البليدة', 'البويرة',
    'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر العاصمة', 'الجلفة', 'جيجل', 'سطيف', 'سعيدة',
    'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة', 'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة',
    'وهران', 'البيض', 'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
    'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان'
];

interface DestinationSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export default function DestinationSelect({ value, onChange }: DestinationSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (name: string) => {
        setSearch(name);
        onChange(name);
        setIsOpen(false);
    };

    const filteredWilayas = WILAYAS.filter(w => 
        w.includes(search) && !POPULAR_DESTINATIONS.some(p => p.name === w)
    ).slice(0, 5);

    return (
        <div className="relative w-full" ref={containerRef}>
            <input
                id="dest-input"
                type="text"
                autoComplete="off"
                placeholder="أدخل الوجهة أو اسم مكان الإقامة"
                className="bg-transparent outline-none text-white text-base md:text-xl placeholder:text-slate-500 w-full font-bold"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    onChange(e.target.value);
                }}
                onFocus={() => setIsOpen(true)}
            />

            {isOpen && (
                <div className="absolute bottom-full right-0 mb-6 z-50 glass-booking border border-white/10 rounded-[32px] p-6 w-[320px] md:w-[400px] shadow-[0_30px_80px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#C6A75E]">الوجهات المقترحة</span>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-2">
                        {/* Popular Destinations */}
                        {search.length === 0 && (
                            <div className="space-y-1">
                                {POPULAR_DESTINATIONS.map((dest) => (
                                    <button
                                        key={dest.name}
                                        onClick={() => handleSelect(dest.name)}
                                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all text-right group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:bg-[#C6A75E]/20 transition-all">
                                            {dest.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold text-sm tracking-wide">{dest.name}</span>
                                            <span className="text-[10px] text-slate-500 font-medium">{dest.type}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Search Results */}
                        {search.length > 0 && (
                            <div className="space-y-1">
                                {filteredWilayas.length > 0 ? (
                                    filteredWilayas.map((w) => (
                                        <button
                                            key={w}
                                            onClick={() => handleSelect(w)}
                                            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all text-right group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:bg-[#003580]/30 transition-all">
                                                📍
                                            </div>
                                            <span className="text-white font-bold text-sm">{w}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-slate-500 text-sm italic">
                                        لم يتم العثور على نتائج لـ "{search}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center leading-relaxed">تصفح أفضل الإقامات في 48 ولاية جزائرية</span>
                    </div>
                </div>
            )}
        </div>
    );
}
