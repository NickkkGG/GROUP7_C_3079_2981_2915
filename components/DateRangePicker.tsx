'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  start: string;
  end: string;
  onApply: (start: string, end: string) => void;
}

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fmtLabel = (s: string, e: string) => {
  if (!s || !e) return 'Pick date range';
  const f = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${f(s)} — ${f(e)}`;
};

export default function DateRangePicker({ start, end, onApply }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Reset selection saat buka kalender
  const toggleCalendar = () => {
    if (!open) {
      setStartDate(null);
      setEndDate(null);
    }
    setOpen(!open);
  };

  // Manual step: klik pertama = start, klik kedua = end
  const handleSelect = (day: Date | undefined) => {
    if (!day) return;

    if (!startDate) {
      setStartDate(day);
    } else if (!endDate) {
      // Pastikan end >= start
      if (day < startDate) {
        setStartDate(day);
      } else {
        setEndDate(day);
        onApply(toISO(startDate), toISO(day));
        setOpen(false);
      }
    }
  };

  // Build range object untuk display di kalender
  const selectedRange = startDate && endDate
    ? { from: startDate, to: endDate }
    : startDate
    ? { from: startDate, to: undefined }
    : undefined;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggleCalendar}
        className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition"
      >
        <Calendar size={12} className="text-slate-400" />
        <span className="text-[11px] text-slate-700 font-medium whitespace-nowrap">{fmtLabel(start, end)}</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full right-0 mt-1.5 bg-white border-[2px] border-black/10 rounded-[14px] shadow-xl p-2 animate-fade-in">
          <DayPicker
            mode="single"
            selected={selectedRange?.from}
            onSelect={handleSelect}
            numberOfMonths={2}
            showOutsideDays
            disabled={{ after: new Date() }}
            className="text-xs"
            modifiers={{
              range: selectedRange?.from && selectedRange?.to
                ? Array.from({ length: Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / 86400000) + 1 }, (_, i) => {
                    const d = new Date(selectedRange.from);
                    d.setDate(d.getDate() + i);
                    return d;
                  })
                : [],
            }}
            modifiersClassNames={{
              range: 'bg-blue-100',
            }}
          />
          <p className="text-[10px] text-slate-400 text-center pb-1">
            {startDate && !endDate ? 'Now pick end date' : 'Pick start date'}
          </p>
        </div>
      )}
    </div>
  );
}
