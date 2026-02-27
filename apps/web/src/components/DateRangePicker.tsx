'use client';

import { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, startOfDay, addDays, isBefore } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

interface DateRangePickerProps {
    value: string;
    onChange: (value: string) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
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
            } else {
                const nextSelection = { ...selection, endDate: normalizedDate };
                setSelection(nextSelection);
                updateValue(nextSelection);
                setIsOpen(false);
            }
        }
    };

    const updateValue = (sel: DateRange) => {
        if (sel.startDate && sel.endDate) {
            onChange(`${format(sel.startDate, 'dd MMM', { locale: ar })} - ${format(sel.endDate, 'dd MMM', { locale: ar })}`);
        } else if (sel.startDate) {
            onChange(format(sel.startDate, 'dd MMM', { locale: ar }));
        } else {
            onChange('');
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    // Add empty days at the start to align correctly
    const firstDayOfWeek = startOfMonth(currentMonth).getDay();
    // In RTL/Arabic context, we might want to adjust the grid or just use standard grid
    const emptyDays = Array.from({ length: firstDayOfWeek });

    const isSelected = (date: Date) => {
        if (selection.startDate && isSameDay(date, selection.startDate)) return true;
        if (selection.endDate && isSameDay(date, selection.endDate)) return true;
        return false;
    };

    const isInRange = (date: Date) => {
        if (selection.startDate && selection.endDate) {
            return isWithinInterval(date, { start: selection.startDate, end: selection.endDate });
        }
        return false;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <input
                type="text"
                readOnly
                placeholder="اخـتـر الـفترة"
                className="bg-transparent border-none outline-none text-white placeholder:text-slate-600 w-full font-bold text-xl cursor-pointer"
                value={value}
                onClick={() => setIsOpen(!isOpen)}
            />

            {isOpen && (
                <div className="absolute top-full right-0 mt-4 z-50 glass-luxury border border-[#C6A75E]/20 rounded-[24px] p-8 w-[350px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <button onClick={nextMonth} className="text-white hover:text-[#C6A75E] transition-colors p-2">
                            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className="text-lg font-black text-white capitalize">
                            {format(currentMonth, 'MMMM yyyy', { locale: ar })}
                        </h3>
                        <button onClick={prevMonth} className="text-white hover:text-[#C6A75E] transition-colors p-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(day => (
                            <div key={day} className="text-center text-[10px] font-black text-[#C6A75E]/60 uppercase py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {emptyDays.map((_, i) => (
                            <div key={`empty-${i}`} className="p-2"></div>
                        ))}
                        {days.map((day, i) => {
                            const selected = isSelected(day);
                            const inRange = isInRange(day);
                            const isToday = isSameDay(day, new Date());
                            const disabled = isBefore(day, startOfDay(new Date()));

                            return (
                                <div
                                    key={i}
                                    onClick={() => !disabled && handleDateClick(day)}
                                    className={`
                                        relative p-2 text-center text-sm font-bold cursor-pointer transition-all rounded-lg
                                        ${disabled ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 hover:bg-[#C6A75E]/20 hover:text-white'}
                                        ${selected ? 'bg-[#C6A75E] text-white !rounded-lg shadow-[0_0_15px_rgba(198,167,94,0.4)]' : ''}
                                        ${inRange && !selected ? 'bg-[#C6A75E]/10 text-[#C6A75E]' : ''}
                                    `}
                                >
                                    {format(day, 'd')}
                                    {isToday && !selected && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C6A75E] rounded-full"></span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/5">
                        <button
                            onClick={() => {
                                setSelection({ startDate: null, endDate: null });
                                onChange('');
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#C6A75E] transition-colors"
                        >
                            إلغـاء
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-[10px] font-black uppercase tracking-widest text-[#C6A75E] hover:text-white transition-colors px-4 py-2 bg-[#C6A75E]/10 rounded-lg"
                        >
                            تـأكيـد
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
