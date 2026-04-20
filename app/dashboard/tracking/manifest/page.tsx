'use client';

import { useAuth } from '@/context/AuthContext';
import { mockFlights, mockShipments } from '@/lib/mockData';
import { FileText, Download } from 'lucide-react';
import { useEffect } from 'react';
import TopNavbar from '@/components/TopNavbar';

export default function ManifestPage() {
  const { user, loginAsGuest } = useAuth();

  useEffect(() => {
    if (!user) {
      loginAsGuest();
    }
  }, [user, loginAsGuest]);

  return (
    <div className="h-full flex flex-col animate-fade-in bg-[#ffe9d4]">
      <TopNavbar
        title="Flight Manifest"
        subtitle="Daftar manifest penerbangan dengan detail kargo"
      />
      <div className="p-8 flex flex-col overflow-y-auto flex-1">
        {/* Content Box */}
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[24px] backdrop-blur-md overflow-hidden flex flex-col flex-1">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 flex items-center justify-between border-b-[2px] border-black/20">
          <div>
            <h1 className="text-slate-900 font-bold text-lg">Flight Manifest</h1>
            <p className="text-slate-600 text-xs mt-1">Daftar manifest penerbangan statis</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white rounded-full font-bold text-xs hover:bg-emerald-600 transition">
            <Download size={14} />
            Download
          </button>
        </div>

        {/* Live Update Badge */}
        <div className="bg-white px-6 py-3 border-b-[2px] border-black/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#31ff38] rounded-full animate-pulse" />
            <span className="text-[#16ba1c] font-semibold text-xs">LIVE UPDATE</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3 p-5 bg-white overflow-y-auto flex-1">
          {/* Flight Manifests */}
          {mockFlights.map((flight, idx) => (
            <div key={idx} className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[16px] p-4">
              {/* Flight Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b-[2px] border-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/10 border-[2px] border-black/20 rounded-lg flex items-center justify-center">
                    <FileText className="text-cyan-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold">{flight.flight}</h3>
                    <p className="text-slate-700 text-xs opacity-70">{flight.route}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-700 text-xs opacity-70">Scheduled</p>
                  <p className="text-slate-900 font-bold text-xs">{flight.scheduled}</p>
                </div>
              </div>

              {/* Manifest Items */}
              <div className="space-y-2 mb-4">
                <h4 className="text-slate-900 font-bold text-xs opacity-70">Cargo Items:</h4>
                <div className="space-y-2">
                  {mockShipments
                    .filter((s) => s.flight === flight.flight)
                    .map((shipment, sidx) => (
                      <div key={sidx} className="flex items-center justify-between p-2.5 bg-cyan-50 rounded-lg border-[2px] border-black/20">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 font-bold text-xs">{shipment.awb}</p>
                          <p className="text-slate-700 text-xs opacity-60">
                            {shipment.origin} → {shipment.destination}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-slate-900 text-xs font-medium">{shipment.sender}</p>
                          <p className="text-slate-700 text-xs opacity-60">{shipment.weight}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Summary */}
              <div className="pt-3 border-t-[2px] border-black/20">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-slate-700 text-xs opacity-60">Total Items</p>
                    <p className="text-slate-900 font-bold">
                      {mockShipments.filter((s) => s.flight === flight.flight).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-700 text-xs opacity-60">Total Weight</p>
                    <p className="text-slate-900 font-bold">
                      {mockShipments
                        .filter((s) => s.flight === flight.flight)
                        .reduce((acc, s) => acc + parseInt(s.weight), 0)}{' '}
                      kg
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-700 text-xs opacity-60">Status</p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        flight.status === 'on-time'
                          ? 'bg-green-500/10 text-green-700 border-green-400'
                          : 'bg-orange-500/10 text-orange-700 border-orange-400'
                      }`}
                    >
                      {flight.status === 'on-time' ? 'On Time' : 'Delayed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
