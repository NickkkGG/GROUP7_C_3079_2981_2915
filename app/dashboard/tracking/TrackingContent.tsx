'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { mockShipments, mockTrackingTimeline } from '@/lib/mockData';
import { Settings, Info, MapPin } from 'lucide-react';
import TopNavbar from '@/components/TopNavbar';

export default function TrackingContent() {
  const { user, loginAsGuest } = useAuth();
  const searchParams = useSearchParams();
  const [awb, setAwb] = useState(searchParams.get('awb') || 'AWB-EP-24001');
  const [shipment, setShipment] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user) {
      loginAsGuest();
    }
  }, [user, loginAsGuest]);

  useEffect(() => {
    // Auto-search with default AWB on load
    const found = mockShipments.find((s) => s.awb.toLowerCase() === awb.toLowerCase());
    if (found) {
      setShipment(found);
      setNotFound(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = mockShipments.find((s) => s.awb.toLowerCase() === awb.toLowerCase());
    if (found) {
      setShipment(found);
      setNotFound(false);
    } else {
      setShipment(null);
      setNotFound(true);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in bg-[#ffe9d4]">
      <TopNavbar
        title="Track Airway Bill"
        subtitle="Locate and track specific airway bills."
      />
      <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
      {/* SECTION 1: Search Header */}
      <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[20px] backdrop-blur-md overflow-hidden p-4 min-h-[150px]">
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-slate-900 font-bold text-base">Track Airway Bill</h1>
            <p className="text-slate-600 text-xs">Enter your 10-12 digit AWB number to get real-time status updates.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 bg-white border-[2px] border-black/33 rounded-[12px] px-3 py-2 flex items-center gap-2">
              <span className="text-sm">🔍</span>
              <input
                type="text"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                className="flex-1 bg-transparent text-slate-900 text-xs outline-none placeholder-slate-500 placeholder-opacity-60"
                placeholder="AWB-EP-24001"
              />
              {awb && (
                <button
                  type="button"
                  onClick={() => setAwb('')}
                  className="text-slate-900 opacity-40 hover:opacity-70 transition text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg transition-all duration-300 hover:bg-blue-700 active:scale-95 whitespace-nowrap"
            >
              Track AWB
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 2 & 3: Details and Timeline (stacked vertically) */}
      {notFound ? (
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[20px] p-4 flex items-center justify-center flex-1">
          <div className="flex items-start gap-2 bg-orange-100 border border-orange-400 rounded-lg p-3 w-full max-w-sm">
            <Info className="text-orange-600 flex-shrink-0 mt-0.5" size={16} />
            <div>
              <h3 className="text-orange-900 font-bold text-xs">AWB Not Found</h3>
              <p className="text-orange-700 text-xs mt-1">
                The airway bill <span className="font-mono font-bold">{`"${awb}"`}</span> not found.
              </p>
            </div>
          </div>
        </div>
      ) : shipment ? (
        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          {/* SECTION 2: Shipment Details */}
          <div className="border-[2px] border-black/20 rounded-[20px] overflow-hidden flex flex-col">
            {/* Top Blue Section */}
            <div
              style={{ backgroundColor: '#183c88' }}
              className="text-white px-4 py-4 flex items-start justify-between"
            >
              <div>
                <p className="text-xs opacity-80">Airway Bill Number</p>
                <h2 className="font-bold text-base font-mono mt-1">{shipment.awb}</h2>
              </div>
              <div className="text-right">
                <div
                  style={{ backgroundColor: 'rgba(18, 60, 149, 0.3)' }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium mb-2"
                >
                  Loaded to Aircraft
                </div>
                <div className="flex items-center gap-1 justify-end text-xs opacity-80">
                  <span>⏱</span>
                  <span>Last Update: 09:47</span>
                </div>
              </div>
            </div>

            {/* Bottom White Section */}
            <div className="bg-white px-4 py-6">
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div className="text-center">
                  <p className="text-slate-600 font-bold opacity-70 mb-1.5">ORIGIN</p>
                  <p className="text-slate-900 font-medium">{shipment.origin}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600 font-bold opacity-70 mb-1.5">DESTINATION</p>
                  <p className="text-slate-900 font-medium">{shipment.destination}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600 font-bold opacity-70 mb-1.5">FLIGHT</p>
                  <p className="text-slate-900 font-medium">{shipment.flight}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600 font-bold opacity-70 mb-1.5">EST.ARRIVAL</p>
                  <p className="text-slate-900 font-medium">Today, 14:30</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Tracking Timeline */}
          <div className="border-[2px] border-black/20 rounded-[20px] overflow-hidden flex flex-col flex-1">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b-[2px] border-black/20">
              <div className="flex items-center gap-2">
                <MapPin style={{ color: '#2563eb' }} size={16} />
                <h3 className="text-slate-900 font-bold text-sm">Tracking History</h3>
              </div>
            </div>

            {/* Timeline Content */}
            <div className="bg-gradient-to-br from-white to-amber-50 px-4 py-6 flex-1">
              <div className="relative">
                {/* Timeline line background */}
                <div className="absolute top-5 left-0 right-0 h-[2px] bg-slate-300" />

                {/* Timeline items */}
                <div className="flex justify-between items-start gap-2">
                  {mockTrackingTimeline.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      {/* Icon */}
                      <div className="relative z-10 mb-3">
                        {item.status === 'completed' ? (
                          <div
                            style={{ backgroundColor: '#2563eb' }}
                            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold border-4 border-white"
                          >
                            ✓
                          </div>
                        ) : (
                          <div className="w-11 h-11 bg-slate-300 rounded-full border-4 border-white flex items-center justify-center">
                            <div className="w-3 h-3 bg-slate-400 rounded-full" />
                          </div>
                        )}
                      </div>

                      {/* Label */}
                      <h4 className="text-slate-900 font-bold text-xs text-center mb-1.5">{item.step}</h4>

                      {/* Timestamp */}
                      {item.timestamp && (
                        <div className="text-center mb-1">
                          <p className="text-slate-600 text-xs opacity-70 font-mono">{item.timestamp.split(' ')[0]}</p>
                          <p className="text-slate-600 text-xs opacity-70 font-mono">{item.timestamp.split(' ')[1]}</p>
                        </div>
                      )}

                      {/* Location */}
                      {item.location && (
                        <p className="text-slate-600 text-xs opacity-60 text-center">
                          📍 {item.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
