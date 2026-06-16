'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Package, DollarSign, Layers, Weight, MapPin, Activity, Calendar } from 'lucide-react';

interface ChartData {
  shipmentsPerDay: { day: string; total: number }[];
  revenuePerDay: { day: string; revenue: number }[];
  serviceType: { type: string; total: number }[];
  byStatus: { status: string; total: number }[];
  topRoutes: { origin: string; destination: string; total: number }[];
  summary: { totalShipments: number; totalRevenue: number; avgWeight: number; totalWeight: number };
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const shortRupiah = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return `${Math.round(n)}`;
};

const dayLabel = (d: string, long: boolean) =>
  new Date(d).toLocaleDateString('en-US', long ? { month: 'short', day: 'numeric' } : { weekday: 'short' });

const cityCode = (c: string) => c.match(/\(([A-Z]{3})\)/)?.[1] || c.split(' ')[0];

const SERVICE_COLORS: Record<string, string> = { Regular: '#3b82f6', Express: '#f59e0b', Priority: '#8b5cf6' };
const STATUS_COLORS: Record<string, string> = {
  booked: '#3b82f6', received: '#a855f7', in_transit: '#f59e0b', arrived: '#06b6d4', delivered: '#10b981',
};

type Preset = '7' | '30' | '90' | 'custom';

export default function StatsSlide() {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<Preset>('7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    let url = '/api/dashboard/charts';
    if (preset === 'custom' && startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`;
    } else if (preset !== 'custom') {
      url += `?days=${preset}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [preset, startDate, endDate]);

  useEffect(() => {
    if (preset === 'custom' && (!startDate || !endDate)) return;
    load();
  }, [load, preset, startDate, endDate]);

  const maxShipments = Math.max(1, ...(data?.shipmentsPerDay.map((d) => d.total) || [1]));
  const maxRevenue = Math.max(1, ...(data?.revenuePerDay.map((d) => d.revenue) || [1]));
  const serviceTotal = data?.serviceType.reduce((sum, s) => sum + s.total, 0) || 0;
  const longLabels = (data?.shipmentsPerDay.length || 0) > 10;

  const circumference = 2 * Math.PI * 34;
  let acc = 0;

  const presetBtn = (p: Preset, label: string) => (
    <button
      onClick={() => setPreset(p)}
      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
        preset === p ? 'bg-[#1e3a5f] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-3 h-full bg-slate-50 overflow-y-auto no-scrollbar">
      {/* Header + Filter */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#1e3a5f] rounded-lg"><Activity size={16} className="text-white" /></div>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-tight">Cargo Analytics</h2>
            <p className="text-[10px] text-slate-500">Operational statistics overview</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {presetBtn('7', '7 Days')}
          {presetBtn('30', '30 Days')}
          {presetBtn('90', '90 Days')}
          {presetBtn('custom', 'Custom')}
          {preset === 'custom' && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
              <Calendar size={12} className="text-slate-400" />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="text-[10px] text-slate-700 outline-none bg-transparent" />
              <span className="text-slate-300 text-[10px]">→</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="text-[10px] text-slate-700 outline-none bg-transparent" />
            </div>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {[
          { icon: <Package size={15} className="text-blue-600" />, bg: 'bg-blue-100', label: 'Total Shipments', value: loading ? '—' : `${data?.summary.totalShipments ?? 0}` },
          { icon: <DollarSign size={15} className="text-emerald-600" />, bg: 'bg-emerald-100', label: 'Total Revenue', value: loading ? '—' : formatRupiah(data?.summary.totalRevenue ?? 0) },
          { icon: <Weight size={15} className="text-amber-600" />, bg: 'bg-amber-100', label: 'Total Weight', value: loading ? '—' : `${(data?.summary.totalWeight ?? 0).toLocaleString('id-ID')} kg` },
          { icon: <TrendingUp size={15} className="text-purple-600" />, bg: 'bg-purple-100', label: 'Avg Weight', value: loading ? '—' : `${(data?.summary.avgWeight ?? 0).toFixed(1)} kg` },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-[14px] p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`p-1.5 ${kpi.bg} rounded-lg`}>{kpi.icon}</div>
              <span className="text-[10px] text-slate-500 font-semibold leading-tight">{kpi.label}</span>
            </div>
            <p className="text-base font-black text-slate-900 leading-tight truncate">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Row: Shipments per Day (2 col) + Service Type (1 col) */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="col-span-2 bg-white border border-slate-200 rounded-[14px] p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} className="text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">Shipments per Day</h3>
          </div>
          {loading ? (
            <div className="h-[130px] flex items-center justify-center text-slate-400 text-xs">Loading…</div>
          ) : !data || data.shipmentsPerDay.length === 0 ? (
            <div className="h-[130px] flex items-center justify-center text-slate-400 text-xs">No data in this range</div>
          ) : (
            <div className="h-[130px] flex items-end justify-between gap-1.5">
              {data.shipmentsPerDay.map((d, i) => {
                const h = (d.total / maxShipments) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group">
                    <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">{d.total}</span>
                    <div className="w-full flex items-end justify-center flex-1">
                      <div className="w-full max-w-[28px] bg-blue-500 hover:bg-blue-600 rounded-t-[4px] transition-all duration-500"
                        style={{ height: `${h}%`, minHeight: d.total > 0 ? '3px' : '0' }} title={`${d.total} shipments`} />
                    </div>
                    {(!longLabels || i % 3 === 0) && (
                      <span className="text-[8px] text-slate-400 font-medium whitespace-nowrap">{dayLabel(d.day, longLabels)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-[14px] p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-purple-600" />
            <h3 className="text-xs font-bold text-slate-900">Service Type</h3>
          </div>
          {loading || serviceTotal === 0 ? (
            <div className="h-[130px] flex items-center justify-center text-slate-400 text-xs">{loading ? 'Loading…' : 'No data'}</div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative w-[80px] h-[80px] flex-shrink-0">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  {data!.serviceType.map((s, i) => {
                    const dash = (s.total / serviceTotal) * circumference;
                    const off = -acc; acc += dash;
                    return (
                      <circle key={i} cx="40" cy="40" r="34" fill="none"
                        stroke={SERVICE_COLORS[s.type] || '#94a3b8'} strokeWidth="11"
                        strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={off}
                        className="transition-all duration-500" />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-slate-900">{serviceTotal}</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {data!.serviceType.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SERVICE_COLORS[s.type] || '#94a3b8' }} />
                    <span className="text-slate-600 font-medium flex-1 truncate">{s.type}</span>
                    <span className="text-slate-900 font-bold">{Math.round((s.total / serviceTotal) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row: Revenue per Day (full) */}
      <div className="bg-white border border-slate-200 rounded-[14px] p-3 shadow-sm mb-2">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign size={14} className="text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900">Revenue per Day</h3>
          <span className="ml-auto text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
            {loading ? '…' : formatRupiah(data?.summary.totalRevenue || 0)}
          </span>
        </div>
        {loading ? (
          <div className="h-[110px] flex items-center justify-center text-slate-400 text-xs">Loading…</div>
        ) : !data || data.revenuePerDay.length === 0 ? (
          <div className="h-[110px] flex items-center justify-center text-slate-400 text-xs">No data in this range</div>
        ) : (
          <div className="h-[110px] flex items-end justify-between gap-1.5">
            {data.revenuePerDay.map((d, i) => {
              const h = (d.revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group">
                  <span className="text-[8px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition">{shortRupiah(d.revenue)}</span>
                  <div className="w-full flex items-end justify-center flex-1">
                    <div className="w-full max-w-[28px] bg-emerald-500 hover:bg-emerald-600 rounded-t-[4px] transition-all duration-500"
                      style={{ height: `${h}%`, minHeight: d.revenue > 0 ? '3px' : '0' }} title={formatRupiah(d.revenue)} />
                  </div>
                  {(!longLabels || i % 3 === 0) && (
                    <span className="text-[8px] text-slate-400 font-medium whitespace-nowrap">{dayLabel(d.day, longLabels)}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Row: By Status + Top Routes */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-slate-200 rounded-[14px] p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2.5">
            <Activity size={14} className="text-cyan-600" />
            <h3 className="text-xs font-bold text-slate-900">Shipments by Status</h3>
          </div>
          {loading || !data || data.byStatus.length === 0 ? (
            <div className="h-[90px] flex items-center justify-center text-slate-400 text-xs">{loading ? 'Loading…' : 'No data'}</div>
          ) : (
            <div className="space-y-2">
              {data.byStatus.map((s, i) => {
                const max = Math.max(...data.byStatus.map((x) => x.total));
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600 font-medium w-16 capitalize">{s.status.replace('_', ' ')}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(s.total / max) * 100}%`, backgroundColor: STATUS_COLORS[s.status] || '#94a3b8' }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-900 w-6 text-right">{s.total}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-[14px] p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2.5">
            <MapPin size={14} className="text-rose-600" />
            <h3 className="text-xs font-bold text-slate-900">Top Routes</h3>
          </div>
          {loading || !data || data.topRoutes.length === 0 ? (
            <div className="h-[90px] flex items-center justify-center text-slate-400 text-xs">{loading ? 'Loading…' : 'No data'}</div>
          ) : (
            <div className="space-y-1.5">
              {data.topRoutes.map((r, i) => {
                const max = Math.max(...data.topRoutes.map((x) => x.total));
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-700 w-[78px] whitespace-nowrap">{cityCode(r.origin)} → {cityCode(r.destination)}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${(r.total / max) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-900 w-6 text-right">{r.total}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
