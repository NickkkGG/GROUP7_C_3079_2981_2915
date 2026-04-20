'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp, TrendingDown, Package, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const WorldMapLeaflet = dynamic(() => import('@/components/WorldMapLeaflet'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-600">Loading map...</div>,
});

export default function DashboardPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<any>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Jika ada ?role=guest parameter dan belum ada user, set guest
    const role = searchParams.get('role');
    if (!user && role === 'guest') {
      setUser({
        id: 'guest-001',
        name: 'Guest User',
        email: 'guest@altus.local',
        role: 'guest',
      });
    }
  }, [searchParams, user, setUser]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, shipmentsRes, flightsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/shipments'),
          fetch('/api/flights'),
        ]);

        const statsData = await statsRes.json();
        const shipmentsData = await shipmentsRes.json();
        const flightsData = await flightsRes.json();

        setStats(statsData);
        setShipments(Array.isArray(shipmentsData) ? shipmentsData.slice(0, 5) : []);
        setFlights(Array.isArray(flightsData) ? flightsData.slice(0, 4) : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = stats
    ? [
        {
          label: 'Total Shipments Today',
          value: stats.totalShipments || 0,
          change: stats.shipmentsChange || '+0%',
          icon: <Package className="text-blue-500" size={32} />,
          isPositive: true,
        },
        {
          label: 'Flight On Time',
          value: stats.onTime || 0,
          change: stats.onTimeChange || '+0%',
          icon: <Clock className="text-green-500" size={32} />,
          isPositive: true,
        },
        {
          label: 'Flight Delay',
          value: stats.delayed || 0,
          change: stats.delayedChange || '0%',
          icon: <AlertCircle className="text-orange-500" size={32} />,
          isPositive: false,
        },
        {
          label: 'Ready To Load',
          value: stats.readyToLoad || 0,
          change: '+0%',
          icon: <TrendingUp className="text-purple-500" size={32} />,
          isPositive: true,
        },
      ]
    : [];

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
                    <p className="text-2xl font-black text-slate-900 leading-tight">{stat.value}</p>
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
            {loading ? (
              <div className="text-slate-500 text-[9px] py-2 text-center">Loading flights...</div>
            ) : flights.length === 0 ? (
              <div className="text-slate-500 text-[9px] py-2 text-center">No flights available</div>
            ) : (
              flights.map((flight, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 bg-gradient-to-r from-slate-50 to-white rounded-lg border-[1px] border-black/20 hover:border-black/40 hover:bg-slate-100 transition-all gap-1 cursor-pointer group">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-[11px] leading-tight group-hover:text-emerald-600">{flight.flight_number}</p>
                    <p className="text-slate-600 text-[9px] leading-tight truncate">{flight.departure_city}→{flight.arrival_city}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap flex-shrink-0 ${
                    flight.status === 'scheduled' || flight.status === 'active'
                      ? 'bg-green-500/20 text-green-700 border border-green-400'
                      : 'bg-orange-500/20 text-orange-700 border border-orange-400'
                  }`}>
                    {flight.status === 'scheduled' || flight.status === 'active' ? 'On Time' : 'Delayed'}
                  </span>
                </div>
              ))
            )}
          </div>
          <Link href="/dashboard/flight-status" className="w-full px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-xs font-bold rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 flex-shrink-0 text-center">
            More Details →
          </Link>
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-3 text-center text-slate-400 text-[9px]">
                      Loading shipments...
                    </td>
                  </tr>
                ) : shipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-3 text-center text-slate-400 text-[9px]">
                      No active shipments
                    </td>
                  </tr>
                ) : (
                  shipments.map((shipment, idx) => (
                    <tr key={idx} className="border-b-[1px] border-black/20 hover:bg-emerald-50 transition-all duration-200 group">
                      <td className="py-1.5 px-2">
                        <Link href={`/dashboard/tracking?tracking=${shipment.tracking_number}`} className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors truncate block group-hover:underline">
                          {shipment.tracking_number}
                        </Link>
                      </td>
                      <td className="py-1.5 px-2 text-slate-700 whitespace-nowrap text-[9px]">{shipment.origin}</td>
                      <td className="py-1.5 px-2 text-slate-700 whitespace-nowrap text-[9px]">{shipment.destination}</td>
                      <td className="py-1.5 px-2 text-slate-700 whitespace-nowrap text-[9px]">{shipment.flight_number || 'N/A'}</td>
                      <td className="py-1.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block whitespace-nowrap transition-all ${
                            shipment.status === 'pending'
                              ? 'bg-blue-100 text-blue-700 border border-blue-400'
                              : shipment.status === 'departed'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-400'
                                : 'bg-orange-100 text-orange-700 border border-orange-400'
                          }`}
                        >
                          {shipment.status?.charAt(0).toUpperCase() + shipment.status?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-slate-700 whitespace-nowrap text-[9px] font-medium">{shipment.weight || 'N/A'} kg</td>
                      <td className="py-1.5 px-2">
                        <Link href={`/dashboard/tracking?tracking=${shipment.tracking_number}`} className="px-2 py-1 rounded-lg text-white text-[9px] font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 transition-all duration-200 inline-block hover:shadow-md active:scale-95">
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
