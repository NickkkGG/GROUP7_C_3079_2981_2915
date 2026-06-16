'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Package, DollarSign, Weight, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import DateRangePicker from '@/components/DateRangePicker';

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

const cityCode = (c: string) => c.match(/\(([A-Z]{3})\)/)?.[1] || c.split(' ')[0];

const SERVICE_COLORS: Record<string, string> = { Regular: '#1e3a5f', Express: '#3b82f6', Priority: '#93c5fd' };
const STATUS_COLORS: Record<string, string> = {
  booked: '#1e3a5f', received: '#2c5282', in_transit: '#3b82f6', arrived: '#60a5fa', delivered: '#1e3a5f',
};

type Preset = '7' | 'month' | 'year' | 'custom';

function ChartTooltip({ active, payload, label, valueFormatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5">
      <p className="text-[10px] font-bold text-slate-700">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[10px]" style={{ color: p.color || p.fill }}>
          {valueFormatter ? valueFormatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

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
      url += `?range=custom&start=${startDate}&end=${endDate}`;
    } else if (preset !== 'custom') {
      url += `?range=${preset}`;
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

  const fmtAxis = (d: string) => {
    const date = new Date(d);
    if (preset === 'year') return date.toLocaleDateString('en-US', { year: 'numeric' });
    if (preset === 'month') return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (preset === 'custom') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    // 7 days: nama hari + tanggal detail (mis. "Mon 16")
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  const shipChart = (data?.shipmentsPerDay || []).map((d) => ({ label: fmtAxis(d.day), value: d.total }));
  const revChart = (data?.revenuePerDay || []).map((d) => ({ label: fmtAxis(d.day), value: d.revenue }));
  const serviceTotal = data?.serviceType.reduce((s, x) => s + x.total, 0) || 0;
  const routeChart = (data?.topRoutes || []).map((r) => ({ label: `${cityCode(r.origin)}→${cityCode(r.destination)}`, value: r.total }));

  // Data "Today" (hanya relevan di view 7 Days) — ambil bucket dengan tanggal = hari ini
  const todayKey = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD lokal
  const isToday = (iso: string) => new Date(iso).toLocaleDateString('en-CA') === todayKey;
  const todayShipments = preset === '7' ? (data?.shipmentsPerDay.find((d) => isToday(d.day))?.total ?? 0) : null;
  const todayRevenue = preset === '7' ? (data?.revenuePerDay.find((d) => isToday(d.day))?.revenue ?? 0) : null;

  const presetBtn = (p: Preset, label: string) => (
    <button
      onClick={() => setPreset(p)}
      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
        preset === p ? 'bg-[#1e3a5f] text-white shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-2.5 h-full bg-slate-50 dark:bg-slate-900 overflow-hidden flex flex-col">
      {/* Header + Filter */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0 flex-wrap gap-1.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#1e3a5f] rounded-lg"><Activity size={15} className="text-white" /></div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">Cargo Analytics</h2>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Live data from shipments</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {presetBtn('7', '7 Days')}
          {presetBtn('month', 'Month')}
          {presetBtn('year', 'Year')}
          {presetBtn('custom', 'Custom')}
          {preset === 'custom' && (
            <DateRangePicker
              start={startDate}
              end={endDate}
              onApply={(s, e) => { setStartDate(s); setEndDate(e); }}
            />
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-2 mb-2 flex-shrink-0">
        {[
          { icon: <Package size={14} className="text-[#1e3a5f]" />, bg: 'bg-blue-100', label: 'Total Shipments', value: loading ? '—' : `${data?.summary.totalShipments ?? 0}` },
          { icon: <DollarSign size={14} className="text-[#2c5282]" />, bg: 'bg-blue-100', label: 'Total Revenue', value: loading ? '—' : formatRupiah(data?.summary.totalRevenue ?? 0) },
          { icon: <Weight size={14} className="text-[#3b82f6]" />, bg: 'bg-blue-100', label: 'Total Weight', value: loading ? '—' : `${(data?.summary.totalWeight ?? 0).toLocaleString('id-ID')} kg` },
          { icon: <TrendingUp size={14} className="text-[#1e3a5f]" />, bg: 'bg-blue-100', label: 'Avg Weight', value: loading ? '—' : `${(data?.summary.avgWeight ?? 0).toFixed(1)} kg` },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[12px] p-2.5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`p-1 ${kpi.bg} rounded-md`}>{kpi.icon}</div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">{kpi.label}</span>
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight truncate">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts grid — fills remaining height */}
      <div className="grid grid-cols-3 grid-rows-2 gap-2 flex-1 min-h-0">
        {/* Shipments per Day — area, span 2 cols */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-[12px] p-2.5 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 mb-1 flex-shrink-0">
            <Package size={13} className="text-[#1e3a5f]" />
            <h3 className="text-[11px] font-bold text-slate-900 dark:text-slate-100">Shipments per Day</h3>
            {todayShipments !== null && (
              <span className="ml-auto text-[10px] font-bold text-[#1e3a5f] bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                Today: {todayShipments}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">Loading…</div>
            ) : shipChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">No data in this range</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={shipChart} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#1e3a5f" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                  <Tooltip content={<ChartTooltip valueFormatter={(v: number) => `${v} shipments`} />} />
                  <Area type="monotone" dataKey="value" stroke="#1e3a5f" strokeWidth={2.5} fill="url(#shipGrad)" dot={{ r: 2, fill: '#1e3a5f' }} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Service Type — donut */}
        <div className="bg-white border border-slate-200 rounded-[12px] p-2.5 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 mb-1 flex-shrink-0">
            <Activity size={13} className="text-[#1e3a5f]" />
            <h3 className="text-[11px] font-bold text-slate-900">Service Type</h3>
          </div>
          <div className="flex-1 min-h-0 flex items-center">
            {loading || serviceTotal === 0 ? (
              <div className="w-full text-center text-slate-400 text-xs">{loading ? 'Loading…' : 'No data'}</div>
            ) : (
              <>
                <div className="w-[45%] h-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie data={data!.serviceType} dataKey="total" nameKey="type" cx="50%" cy="50%" innerRadius="55%" outerRadius="90%" paddingAngle={2} stroke="none">
                        {data!.serviceType.map((s, i) => <Cell key={i} fill={SERVICE_COLORS[s.type] || '#94a3b8'} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip valueFormatter={(v: number) => `${v} shipments`} />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5 pl-1">
                  {data!.serviceType.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SERVICE_COLORS[s.type] || '#94a3b8' }} />
                      <span className="text-slate-600 font-medium flex-1 truncate">{s.type}</span>
                      <span className="text-slate-900 font-bold">{Math.round((s.total / serviceTotal) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Revenue per Day — bar, span 2 cols */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-[12px] p-2.5 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 mb-1 flex-shrink-0">
            <DollarSign size={13} className="text-[#1e3a5f]" />
            <h3 className="text-[11px] font-bold text-slate-900">Revenue</h3>
            <span className="ml-auto text-[10px] font-bold text-[#1e3a5f] bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
              {loading ? '…' : todayRevenue !== null ? `Today: ${formatRupiah(todayRevenue)}` : formatRupiah(data?.summary.totalRevenue || 0)}
            </span>
          </div>
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">Loading…</div>
            ) : revChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">No data in this range</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={revChart} margin={{ top: 5, right: 5, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={34} tickFormatter={(v) => shortRupiah(v)} />
                  <Tooltip content={<ChartTooltip valueFormatter={(v: number) => formatRupiah(v)} />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" fill="#1e3a5f" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Routes — horizontal bar */}
        <div className="bg-white border border-slate-200 rounded-[12px] p-2.5 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 mb-1 flex-shrink-0">
            <TrendingUp size={13} className="text-[#1e3a5f]" />
            <h3 className="text-[11px] font-bold text-slate-900">Top Routes</h3>
          </div>
          <div className="flex-1 min-h-0">
            {loading || routeChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">{loading ? 'Loading…' : 'No data'}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={routeChart} layout="vertical" margin={{ top: 2, right: 8, left: 2, bottom: 2 }}>
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} width={62} />
                  <Tooltip content={<ChartTooltip valueFormatter={(v: number) => `${v} shipments`} />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
