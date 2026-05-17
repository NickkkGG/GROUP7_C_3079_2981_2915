'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Settings, Info, MapPin } from 'lucide-react';
import TopNavbar from '@/components/TopNavbar';

export default function TrackingContent() {
  const { user, loginAsGuest } = useAuth();
  const searchParams = useSearchParams();
  const [awb, setAwb] = useState('');
  const [shipment, setShipment] = useState<any>(null);
  const [trackingHistory, setTrackingHistory] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      loginAsGuest();
    }
  }, [user, loginAsGuest]);

  const handleSearchWithAwb = async (awbNumber: string) => {
    if (!awbNumber.trim()) return;

    setHasSearched(true);
    setLoading(true);
    setNotFound(false);

    try {
      const response = await fetch(`/api/tracking?awb=${encodeURIComponent(awbNumber)}`);

      if (response.ok) {
        const data = await response.json();
        setShipment(data.shipment);
        setTrackingHistory(data.history || []);
        setNotFound(false);
      } else {
        setShipment(null);
        setTrackingHistory([]);
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      setShipment(null);
      setTrackingHistory([]);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill search from URL parameter
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam && searchParam !== awb) {
      setAwb(searchParam);
      // Auto-submit search immediately
      handleSearchWithAwb(searchParam);
    }
  }, [searchParams, awb]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchWithAwb(awb);
  };

  return (
    <div className="h-full flex flex-col bg-[#ffe9d4] animate-fade-in">
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

          <form onSubmit={handleSearch} className="flex gap-1.5 items-center">
            <div className="flex-1 max-w-md bg-white border-[2px] border-black/33 rounded-[12px] px-3 py-2 flex items-center gap-2">
              <span className="text-sm">🔍</span>
              <input
                type="text"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                className="flex-1 bg-transparent text-slate-900 text-xs outline-none placeholder-slate-400"
                placeholder="Enter AWB number..."
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
              className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg transition-all duration-300 hover:bg-blue-700 active:scale-95 whitespace-nowrap"
            >
              Track AWB
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 2 & 3: Details and Timeline */}
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
      ) : (
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
                {loading || (!hasSearched || !shipment) ? (
                  <div className="h-5 bg-white/30 rounded w-40 mt-1"></div>
                ) : (
                  <h2 className="font-bold text-base font-mono mt-1">{shipment.tracking_number}</h2>
                )}
              </div>
              <div className="text-right">
                {loading || (!hasSearched || !shipment) ? (
                  <>
                    <div className="h-6 bg-white/30 rounded-full w-32 mb-2"></div>
                    <div className="h-3 bg-white/20 rounded w-28"></div>
                  </>
                ) : (
                  <>
                    <div
                      style={{ backgroundColor: 'rgba(18, 60, 149, 0.3)' }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium mb-2"
                    >
                      {shipment.status?.replace('_', ' ').charAt(0).toUpperCase() + shipment.status?.replace('_', ' ').slice(1)}
                    </div>
                    <div className="flex items-center gap-1 justify-end text-xs opacity-80">
                      <span>⏱</span>
                      <span>Last Update: {new Date(shipment.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom White Section */}
            <div className="bg-white px-4 py-6">
              <div className="grid grid-cols-4 gap-4 text-xs">
                {['ORIGIN', 'DESTINATION', 'FLIGHT', 'EST.ARRIVAL'].map((label, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-slate-600 font-bold opacity-70 mb-1.5">{label}</p>
                    {loading || (!hasSearched || !shipment) ? (
                      <div className="h-4 bg-slate-300 rounded w-16 mx-auto"></div>
                    ) : (
                      <p className="text-slate-900 font-medium">
                        {idx === 0 ? shipment.origin :
                         idx === 1 ? shipment.destination :
                         idx === 2 ? (shipment.flight_number || 'N/A') :
                         (shipment.arrival_time ? new Date(shipment.arrival_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD')}
                      </p>
                    )}
                  </div>
                ))}
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
            <div className="bg-gradient-to-br from-white to-amber-50 px-4 py-6 flex-1 overflow-y-auto">
              {loading || (!hasSearched || trackingHistory.length === 0) ? (
                <div className="relative">
                  {/* Timeline line background */}
                  <div className="absolute top-5 left-0 right-0 h-[2px] bg-slate-300" />

                  {/* Timeline items - placeholders */}
                  <div className="flex justify-between items-start gap-2">
                    {['Booked', 'Received', 'In Transit', 'Arrived', 'Delivered'].map((step, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        {/* Icon */}
                        <div className="relative z-10 mb-3">
                          <div className="w-11 h-11 bg-slate-300 rounded-full border-4 border-white flex items-center justify-center">
                            <div className="w-3 h-3 bg-slate-400 rounded-full" />
                          </div>
                        </div>

                        {/* Label */}
                        <h4 className="text-slate-900 font-bold text-xs text-center mb-1.5">{step}</h4>

                        {/* Timestamp */}
                        <div className="text-center mb-1 space-y-1">
                          <div className="h-3 bg-slate-300 rounded w-16 mx-auto"></div>
                          <div className="h-3 bg-slate-200 rounded w-12 mx-auto"></div>
                        </div>

                        {/* Location */}
                        <div className="h-3 bg-slate-200 rounded w-20 mx-auto"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line background */}
                  <div className="absolute top-5 left-0 right-0 h-[2px] bg-slate-300" />

                  {/* Timeline items - real data */}
                  <div className="flex justify-between items-start gap-2">
                    {['booked', 'received', 'in_transit', 'arrived', 'delivered'].map((statusKey, idx) => {
                      const historyItem = trackingHistory.find(h => h.status === statusKey);
                      const isCompleted = !!historyItem;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          {/* Icon */}
                          <div className="relative z-10 mb-3">
                            {isCompleted ? (
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
                          <h4 className="text-slate-900 font-bold text-xs text-center mb-1.5">
                            {statusKey.replace('_', ' ').charAt(0).toUpperCase() + statusKey.replace('_', ' ').slice(1)}
                          </h4>

                          {/* Timestamp */}
                          {isCompleted ? (
                            <div className="text-center mb-1">
                              <p className="text-slate-600 text-xs opacity-70 font-mono">
                                {new Date(historyItem.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-slate-600 text-xs opacity-70 font-mono">
                                {new Date(historyItem.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center mb-1 space-y-1">
                              <div className="h-3 bg-slate-300 rounded w-16 mx-auto"></div>
                              <div className="h-3 bg-slate-200 rounded w-12 mx-auto"></div>
                            </div>
                          )}

                          {/* Location */}
                          {isCompleted ? (
                            <p className="text-slate-600 text-xs opacity-60 text-center">
                              📍 {historyItem.location}
                            </p>
                          ) : (
                            <div className="h-3 bg-slate-200 rounded w-20 mx-auto"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
