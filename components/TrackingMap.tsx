'use client';

import { MapPin } from 'lucide-react';

export default function TrackingMap() {
  const locations = [
    { name: 'Jakarta (Origin)', status: 'Departed', icon: '🟢' },
    { name: 'Surabaya (Transit)', status: 'In Transit', icon: '🟡' },
    { name: 'Bali (Destination)', status: 'Arriving', icon: '🔴' },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-100/80 to-gray-100/80 border border-slate-300/70 rounded-[24px] overflow-hidden animate-fade-in backdrop-blur-md">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-600/10 to-cyan-600/10 border-b border-slate-300/70 flex items-center gap-3">
        <MapPin className="text-emerald-600" size={20} />
        <div>
          <h3 className="text-slate-900 font-bold text-sm">Cargo Tracking Map</h3>
          <p className="text-slate-600 text-xs">Real-time shipment route</p>
        </div>
      </div>

      {/* Map Container */}
      <div className="p-6">
        {/* Visual Route Map */}
        <div className="mb-8">
          <div className="relative h-48 bg-gradient-to-br from-slate-100/80 to-gray-100/80 rounded-xl border border-slate-400/60 overflow-hidden">
            {/* Route visualization */}
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
              {/* Background */}
              <rect width="400" height="200" fill="transparent" />

              {/* Route line */}
              <path
                d="M 50 100 Q 150 50 250 100 T 400 100"
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                opacity="0.6"
              />

              {/* Location markers */}
              {/* Jakarta */}
              <circle cx="50" cy="100" r="12" fill="#22c55e" />
              <circle cx="50" cy="100" r="8" fill="#16a34a" />
              <text x="50" y="140" textAnchor="middle" fontSize="12" fill="#1f2937" fontWeight="bold">
                Jakarta
              </text>

              {/* Surabaya */}
              <circle cx="200" cy="75" r="12" fill="#eab308" />
              <circle cx="200" cy="75" r="8" fill="#ca8a04" />
              <text x="200" y="155" textAnchor="middle" fontSize="12" fill="#1f2937" fontWeight="bold">
                Surabaya
              </text>

              {/* Bali */}
              <circle cx="350" cy="100" r="12" fill="#ef4444" />
              <circle cx="350" cy="100" r="8" fill="#dc2626" />
              <text x="350" y="140" textAnchor="middle" fontSize="12" fill="#1f2937" fontWeight="bold">
                Bali
              </text>
            </svg>
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-3">
          <h4 className="text-slate-900 font-bold text-sm">Shipment Route Details</h4>
          <div className="space-y-2">
            {locations.map((loc, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-100/50 to-gray-100/50 rounded-lg border border-slate-400/60 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
              >
                <span className="text-2xl">{loc.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-bold text-sm">{loc.name}</p>
                  <p className="text-slate-600 text-xs">Status: {loc.status}</p>
                </div>
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-500/30 whitespace-nowrap">
                  {idx === 0 ? '✓ Done' : idx === 1 ? '⟳ In Transit' : '→ Next'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
