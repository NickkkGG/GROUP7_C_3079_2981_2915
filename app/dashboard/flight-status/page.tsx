'use client';

import { useAuth } from '@/context/AuthContext';
import { mockFlights } from '@/lib/mockData';
import { Plane } from 'lucide-react';
import { useEffect } from 'react';
import TopNavbar from '@/components/TopNavbar';

export default function FlightStatusPage() {
  const { user, loginAsGuest } = useAuth();

  useEffect(() => {
    if (!user) {
      loginAsGuest();
    }
  }, [user, loginAsGuest]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-500/10 text-green-700 border border-green-400';
      case 'delayed':
        return 'bg-orange-500/10 text-orange-700 border border-orange-400';
      default:
        return 'bg-cyan-500/10 text-cyan-700 border-[3px] border-black/50';
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in bg-[#ffe9d4]">
      <TopNavbar
        title="Flight Status"
        subtitle="Monitor live flight schedules and status updates"
      />
      <div className="p-4 flex flex-col overflow-y-auto flex-1">
        {/* Content Box */}
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[24px] backdrop-blur-md overflow-hidden flex flex-col flex-1">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 flex items-center justify-between border-b-[2px] border-black/20">
          <div>
            <h1 className="text-slate-900 font-bold text-lg">Flight Status</h1>
            <p className="text-slate-600 text-xs mt-1">Monitor live flight schedules and status</p>
          </div>
          <div className="flex items-center gap-2 bg-white border-[1px] border-black/20 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-[#31ff38] rounded-full animate-pulse" />
            <span className="text-[#16ba1c] font-semibold text-xs">LIVE UPDATE</span>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white px-6 py-5 border-b-[2px] border-black/20">
          <form className="space-y-2.5">
            <p className="text-slate-900 font-medium text-xs">
              Search for flight information to view status and details.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-white border-[2px] border-black/20 rounded-[16px] px-3.5 py-2 flex items-center gap-2">
                <span className="text-base">🔍</span>
                <input
                  type="text"
                  placeholder="Search flight number..."
                  className="flex-1 bg-transparent text-slate-900 text-xs outline-none placeholder-slate-500 placeholder-opacity-60"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg-[16px] hover:bg-emerald-600 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Content Section */}
        <div className="space-y-3 p-5 bg-white overflow-y-auto flex-1">
          {/* Flights Table Box */}
          <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[16px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-[2px] border-black/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Flight</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Route</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Scheduled</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Capacity</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFlights.map((flight, idx) => (
                    <tr key={idx} className="border-b-[1px] border-black/20 hover:bg-cyan-50 transition">
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-2">
                          <Plane size={16} className="text-cyan-600" />
                          <span className="font-bold text-slate-900">{flight.flight}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-900">{flight.route}</td>
                      <td className="py-3 px-4 text-slate-900 text-xs">{flight.scheduled}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(flight.status)}`}>
                          {flight.status === 'on-time' ? 'On Time' : 'Delayed'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden border-[2px] border-black/20">
                            <div
                              className="h-full bg-emerald-500 transition-all"
                              style={{ width: `${flight.capacity}%` }}
                            />
                          </div>
                          <span className="text-slate-900 text-xs whitespace-nowrap">{flight.capacity}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-cyan-600 hover:text-cyan-700 font-bold text-xs">
                          Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
