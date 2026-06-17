'use client';

import { useState, useRef, useEffect } from 'react';
import { Filter, Check, ChevronDown } from 'lucide-react';

interface StatusOption {
  value: string;
  label: string;
}

interface StatusDropdownProps {
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
}

export default function StatusDropdown({ value, options, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white border-[2px] border-black/20 rounded-[16px] pl-3 pr-2.5 py-2 hover:border-black/30 transition min-w-[130px]"
      >
        <Filter size={14} className="text-slate-400 flex-shrink-0" />
        <span className="text-slate-900 text-xs font-medium flex-1 text-left whitespace-nowrap">{selected.label}</span>
        <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 w-full min-w-[150px] bg-white border-[2px] border-black/15 rounded-[14px] shadow-xl overflow-hidden py-1 animate-slide-down">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition ${
                opt.value === value
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="whitespace-nowrap">{opt.label}</span>
              {opt.value === value && <Check size={13} className="flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
