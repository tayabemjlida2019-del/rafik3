'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, startOfDay, isBefore, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

interface DateRangePickerProps {
    value: string;
    onChange: (value: string) => void;
}

const WEEKDAYS = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [selection, setSelection] = useState<DateRange>({
        startDate: null,
        endDate: null
    });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDateClick = (date: Date) => {
        const normalizedDate = startOfDay(date);

        if (!selection.startDate || (selection.startDate && selection.endDate)) {
            const nextSelection = { startDate: normalizedDate, endDate: null };
            setSelection(nextSelection);
            updateValue(nextSelection);
        } else if (selection.startDate && !selection.endDate) {
            if (isBefore(normalizedDate, selection.startDate)) {
                const nextSelection = { startDate: normalizedDate, endDate: null };
                setSelection(nextSelection);
                updateValue(nextSelection);
            } else if (isSameDay(normalizedDate, selection.startDate)) {
                // Clicking the same day again: deselect
                setSelection({ startDate: null, endDate: null });
                onChange('');
            } else {
                const nextSelection = { startDate: selection.startDate, endDate: normalizedDate };
                setSelection(nextSelection);
                updateValue(nextSelection);
                // Don't auto-close so user can see the result
            }
        }
    };

    const updateValue = (sel: DateRange) => {
        if (sel.startDate && sel.endDate) {
            const nights = differenceInDays(sel.endDate, sel.startDate);
            onChange(`${format(sel.startDate, 'dd MMM', { locale: ar })} → ${format(sel.endDate, 'dd MMM', { locale: ar })} (${nights} ليلة)`);
        } else if (sel.startDate) {
            onChange(`${format(sel.startDate, 'dd MMM', { locale: ar })} — اختر تاريخ المغادرة`);
        } else {
            onChange('');
        }
    };

    const goNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const goPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const nextMonthDate = addMonths(currentMonth, 1);

    const isSelected = (date: Date) => {
        if (selection.startDate && isSameDay(date, selection.startDate)) return 'start';
        if (selection.endDate && isSameDay(date, selection.endDate)) return 'end';
        return false;
    };

    const isInRange = (date: Date) => {
        if (selection.startDate && selection.endDate) {
            return isWithinInterval(date, { start: selection.startDate, end: selection.endDate });
        }
        // Preview range on hover
        if (selection.startDate && !selection.endDate && hoverDate && !isBefore(hoverDate, selection.startDate)) {
            return isWithinInterval(date, { start: selection.startDate, end: hoverDate });
        }
        return false;
    };

    const renderMonth = (monthDate: Date) => {
        const days = eachDayOfInterval({
            start: startOfMonth(monthDate),
            end: endOfMonth(monthDate)
        });
        const firstDayOfWeek = startOfMonth(monthDate).getDay();
        const emptyDays = Array.from({ length: firstDayOfWeek });

        return (
            <div className="flex-1 min-w-0">
                {/* Month Title */}
                <h4 className="text-center text-white font-black text-lg mb-5 tracking-wide">
                    {format(monthDate, 'MMMM yyyy', { locale: ar })}
                </h4>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-0 mb-2">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="text-center text-[11px] font-bold text-[#C6A75E] py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-0">
                    {emptyDays.map((_, i) => (
                        <div key={`empty-${i}`} className="h-11"></div>
                    ))}
                    {days.map((day, i) => {
                        const selectedType = isSelected(day);
                        const inRange = isInRange(day);
                        const isToday = isSameDay(day, new Date());
                        const disabled = isBefore(day, startOfDay(new Date()));

                        return (
                            <div
                                key={i}
                                onClick={() => !disabled && handleDateClick(day)}
                                onMouseEnter={() => !disabled && setHoverDate(day)}
                                onMouseLeave={() => setHoverDate(null)}
                                className={`
                                    relative h-11 flex items-center justify-center text-[15px] font-bold cursor-pointer transition-all duration-150 select-none
                                    ${disabled
                                        ? 'text-slate-700/50 cursor-not-allowed' 
                                        : 'text-white hover:bg-[#C6A75E]/25'
                                    }
                                    ${selectedType === 'start'
                                        ? 'bg-[#C6A75E] text-white rounded-r-xl rounded-l-none font-black z-10 shadow-lg shadow-[#C6A75E]/30' 
                                        : ''
                                    }
                                    ${selectedType === 'end'
                                        ? 'bg-[#C6A75E] text-white rounded-l-xl rounded-r-none font-black z-10 shadow-lg shadow-[#C6A75E]/30' 
                                        : ''
                                    }
                                    ${inRange && !selectedType
                                        ? 'bg-[#C6A75E]/15 text-[#e8d5a0]' 
                                        : ''
                                    }
                                    ${isToday && !selectedType
                                        ? 'ring-2 ring-[#C6A75E]/50 ring-inset rounded-lg' 
                                        : ''
                                    }
                                `}
                            >
                                {format(day, 'd')}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Trigger */}
            <div
                id="date-range-trigger"
                className="bg-transparent outline-none text-white w-full font-bold text-sm md:text-base cursor-pointer truncate"
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            >
                {value ? (
                    <span className="text-white">{value}</span>
                ) : (
                    <span className="text-slate-500">تسجيل الوصول — تسجيل المغادرة</span>
                )}
            </div>

            {/* Calendar Popup */}
            {isOpen && (
                <div 
                    className="absolute bottom-full mb-6 z-[100] rounded-[32px] shadow-[0_25px_100px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{
                        right: '50%',
                        transform: 'translateX(50%)',
                        width: 'min(660px, 95vw)',
                        background: 'rgba(15, 23, 42, 0.75)',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(198,167,94,0.1)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top Status Bar */}
                    <div className="bg-[#C6A75E]/20 backdrop-blur-md px-8 py-5 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-6">
                            {/* Check-in */}
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-blue-200/70 uppercase tracking-widest mb-1">تسجيل الوصول</div>
                                <div className="text-white font-black text-lg">
                                    {selection.startDate 
                                        ? format(selection.startDate, 'dd MMMM', { locale: ar })
                                        : '—'
                                    }
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-px bg-white/30"></div>
                                <div className="w-3 h-3 border-t-2 border-l-2 border-white/40 rotate-[135deg]"></div>
                            </div>
                            {/* Check-out */}
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-blue-200/70 uppercase tracking-widest mb-1">تسجيل المغادرة</div>
                                <div className="text-white font-black text-lg">
                                    {selection.endDate 
                                        ? format(selection.endDate, 'dd MMMM', { locale: ar })
                                        : '—'
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Duration Badge */}
                        {selection.startDate && selection.endDate && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                                <div className="text-2xl font-black text-white">{differenceInDays(selection.endDate, selection.startDate)}</div>
                                <div className="text-[10px] font-bold text-blue-200/70 uppercase tracking-widest">ليلة</div>
                            </div>
                        )}
                    </div>

                    {/* Instruction Text */}
                    <div className="px-8 py-4 border-b border-white/5 text-center">
                        <span className="text-sm text-slate-400 font-medium">
                            {!selection.startDate 
                                ? '👆 اختر تاريخ الوصول'
                                : !selection.endDate 
                                    ? '👆 الآن اختر تاريخ المغادرة'
                                    : '✅ تم تحديد فترة الإقامة — يمكنك تعديلها أو تأكيدها'
                            }
                        </span>
                    </div>

                    {/* Navigation + Calendars */}
                    <div className="px-6 py-6">
                        {/* Nav Arrows */}
                        <div className="flex items-center justify-between mb-4 px-2">
                            <button 
                                onClick={goNextMonth} 
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#C6A75E]/30 hover:border-[#C6A75E]/50 hover:text-[#C6A75E] transition-all active:scale-90"
                                title="الشهر التالي"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            
                            <button 
                                onClick={goPrevMonth} 
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#C6A75E]/30 hover:border-[#C6A75E]/50 hover:text-[#C6A75E] transition-all active:scale-90"
                                title="الشهر السابق"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Two-Month Grid */}
                        <div className="flex gap-8 flex-col md:flex-row">
                            {renderMonth(currentMonth)}
                            {renderMonth(nextMonthDate)}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-8 py-5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                        <button
                            onClick={() => {
                                setSelection({ startDate: null, endDate: null });
                                onChange('');
                            }}
                            className="text-sm font-bold text-slate-400 hover:text-red-400 transition-colors px-4 py-2 rounded-xl hover:bg-red-500/10"
                        >
                            🗑️ إعادة تعيين
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-bold text-slate-400 hover:text-white transition-colors px-5 py-2.5 rounded-xl hover:bg-white/5"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={!selection.startDate || !selection.endDate}
                                className={`text-sm font-black px-8 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg ${
                                    selection.startDate && selection.endDate
                                        ? 'bg-[#003580] text-white hover:bg-[#00264d] shadow-blue-900/40'
                                        : 'bg-white/5 text-slate-600 cursor-not-allowed shadow-none'
                                }`}
                            >
                                ✓ تأكيد الفترة
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
