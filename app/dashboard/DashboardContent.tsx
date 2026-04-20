'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { mockShipments, mockStats } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Package, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const WorldMapLeaflet = dynamic(() => import('@/components/WorldMapLeaflet'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-600">Loading map...</div>,
});

export default function DashboardPage() {
  const { user, loginAsGuest, loginAsOperator } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const role = searchParams.get('role');
    if (!user) {
      if (role === 'operator') {
        loginAsOperator();
      } else {
        loginAsGuest();
      }
    }
  }, [user, loginAsGuest, loginAsOperator, searchParams]);

  const statCards = [
    {
      label: 'Total Shipments Today',
      value: mockStats.totalShipments,
      change: mockStats.shipmentsChange,
      icon: <Package className="text-blue-500" size={32} />,
      isPositive: true,
    },
    {
      label: 'Flight On Time',
      value: mockStats.onTime,
      change: mockStats.onTimeChange,
      icon: <Clock className="text-green-500" size={32} />,
      isPositive: true,
    },
    {
      label: 'Flight Delay',
      value: mockStats.delayed,
      change: mockStats.delayedChange,
      icon: <AlertCircle className="text-orange-500" size={32} />,
      isPositive: false,
    },
    {
      label: 'Ready To Load',
      value: mockStats.readyToLoad,
      change: '+8%',
      icon: <TrendingUp className="text-purple-500" size={32} />,
      isPositive: true,
    },
  ];

  return (
    <div className="p-3 h-full bg-[#ffe9d4]">
      <div className="grid grid-cols-3 gap-2 h-full" style={{ gridTemplateRows: 'repeat(5, 1fr)' }}>
        {/* Overview - div1: col 1, rows 1-3 */}
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[16px] p-3 animate-fade-in overflow-hidden flex flex-col" style={{ gridColumn: '1', gridRow: '1 / span 3', animationDelay: '0.15s' }}>
          <h3 className="text-xs font-bold text-slate-900 mb-2 flex-shrink-0">Overview</h3>
          <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
            {statCards.map((stat, idx) => (
              <div
                key={idx}
                className="relative group animate-fade-in overflow-hidden"
                style={{ animationDelay: `${0.2 + idx * 0.03}s` }}
              >
                <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 border-[2px] border-black/15 rounded-[14px] p-4 hover:border-black/30 hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col justify-between hover:scale-105">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-slate-200/40 rounded-lg flex-shrink-0">
                      {stat.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                      stat.isPositive
                        ? 'bg-green-100/60 text-green-700 border border-green-300'
                        : 'bg-orange-100/60 text-orange-700 border border-orange-299'
                    }`}>
                      {stat.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-slate-500 text-xs font-semibold leading-tight mb-2">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-899 leading-tight">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tracking Map - div3: cols 2-3, rows 1-3 */}
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[16px] p-2 animate-fade-in overflow-hidden w-full h-full flex flex-col" style={{ gridColumn: '2 / span 2', gridRow: '1 / span 3', animationDelay: '0.25s' }}>
          <h3 className="text-xs font-bold text-slate-900 mb-2 flex-shrink-0">Live Flight Tracking Map</h3>
          <div className="w-full h-full overflow-hidden flex-1">
            <WorldMapLeaflet />
          </div>
        </div>

        {/* Flight Status - div2: col 1, rows 4-5 */}
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[16px] p-2 animate-fade-in overflow-hidden flex flex-col" style={{ gridColumn: '1', gridRow: '4 / span 2', animationDelay: '0.3s' }}>
          <h3 className="text-xs font-bold text-slate-900 mb-1.5 flex-shrink-0">Flight Status</h3>
          <div className="overflow-y-auto flex-1 space-y-1 mb-2">
            {[
              { fIight: 'EP201', route: 'Origin→CGK', time: '10:30', status: 'On Schedule' },
              { flight: 'EP202', route: 'Origin→CGK', time: '12:15', status: 'Delayed' },
              { flight: 'EP203', route: 'Origin→CGK', time: '14:00', status: 'On Schedule' },
              { flight: 'EP204', route: 'Origin→CGK', time: '16:45', status: 'On Schedule' },
            ].map((flight, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 bg-gradient-to-r from-slate-50 to-white rounded-lg border-[1px] border-black/20 hover:border-black/40 hover:bg-slate-100 transition-all gap-1 cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-[11px] leading-tight group-hover:text-emerald-600">{flight.flight}</p>
                  <p className="text-slate-600 text-[9px] leading-tight truncate">{flight.route}</p>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap flex-shrink-0 ${
                  flight.status === 'On Schedule'
                    ? 'bg-green-500/20 text-green-700 border border-green-400'
                    : 'bg-orange-500/20 text-orange-700 border border-orange-400'
                }`}>
                  {flight.status === 'On Schedule' ? 'On Time' : 'Delayed'}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-xs font-bold rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 flex-shrink-0">
            More Details →
          </button>
        </div>

        {/* Active Shipments - div4: cols 2-3, rows 4-5 */}
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[16px] p-2 animate-fade-in overflow-hidden flex flex-col" style={{ gridColumn: '2 / span 2', gridRow: '4 / span 2', animationDelay: '0.35s' }}>
          <div className="flex items-center justify-between mb-2 gap-2 flex-shrink-0">
            <h2 className="text-xs font-bold text-slate-900 whitespace-nowrap">Active Shipments</h2>
            <div className="flex gap-1 flex-1">
              <input
                type="text"
                placeholder="Search AWB..."
                className="px-2 py-1 bg-white border-[2px] border-black/20 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 text-[10px] flex-1 transition-all"
              />
              <button className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-[10px] font-bold rounded-lg transition-all duration-300 hover:shadow-md active:scale-95 flex-shrink-0">
                Search
              </button>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b-[2px] border-black/20 sticky top-0 bg-gradient-to-r from-slate-50 to-white">
                  <th className="text-left py-1.5 px-2 text-slate-900 font-bold uppercase tracking-wide whitespace-nowrap">AWB</th>
                  <th className="text-left py-1.5 px-2 text-slate-900 font-bold uppercase tracking-wide whitespace-nowrap">Origin</th>
                  <th className="text-left py-1.5 px-2 text-slate-900 font-bold uppercase tracking-wide whitespace-nowrap">Dest</th>
                  <th className="text-left py-1.5 px-2 text-slate-900 font-bold uppercase tracking-wide whitespace-nowrap">Flight</th>
                  <th className="text-left py-1.5 px-2 text-slate-900 font-bold uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="text-left py-1.5 px-2 text-slate-900 font-bold uppercase tracking-wide whitespace-nowrap">Weight</th>
                  <th className="text-left py-1.5 px-2 text-slate-900 font-bold uppercase tracking-wide whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockShipments.map((shipment, idx) => (
                  <tr key={idx} className="border-b-[1px] border-black/20 hover:bg-emerald-50 transition-all duration-200 group">
                    <td className="py-1.5 px-2">
                      <Link href={`/dashboard/tracking?awb=${shipment.awb}`} className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors truncate block group-hover:underline">
                        {shipment.awb}
                      </Link>
                    </td>
                    <td className="py-1.5 px-2 text-slate-700 whitespace-nowrap text-[9px]">{shipment.origin}</td>
                    <td className="py-1.5 px-2 text-slate-700 whitespace-nowrap text-[9px]">{shipment.destination}</td>
                    <td className="py-1.5 px-2 text-slate-700 whitespace-nowrap text-[9px]">{shipment.flight}</td>
                    <td className="py-1.5 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block whitespace-nowrap transition-all ${
                          shipment.status === 'on-time'
                            ? 'bg-green-100 text-green-700 border border-green-400'
                            : shipment.status === 'delayed'
                              ? 'bg-orange-100 text-orange-700 border border-orange-400'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-400'
                        }`}
                      >
                        {shipment.status === 'on-time' ? 'On Time' : shipment.status === 'delayed' ? 'Delayed' : 'Departed'}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-slate-700 whitespace-nowrap text-[9px] font-medium">{shipment.weight}</td>
                    <td className="py-1.5 px-2">
                      <Link href={`/dashboard/tracking?awb=${shipment.awb}`} className="px-2 py-1 rounded-lg text-white text-[9px] font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 transition-all duration-200 inline-block hover:shadow-md active:scale-95">
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
