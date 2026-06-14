'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Settings, Info, MapPin, Search, Package, Download } from 'lucide-react';
import TopNavbar from '@/components/TopNavbar';
import { jsPDF } from 'jspdf';

// Helper: sensor nama — "Budi Santoso" → "Budi S******"
function maskName(name: string): string {
  if (!name) return '-';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0) + '*'.repeat(Math.max(parts[0].length - 1, 3));
  return parts[0] + ' ' + parts.slice(1).map(p => p.charAt(0) + '*'.repeat(Math.max(p.length - 1, 2))).join(' ');
}

// Helper: sensor telepon — "08123456508" → "****6508"
function maskPhone(phone: string): string {
  if (!phone) return '-';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  return '****' + digits.slice(-4);
}

export default function TrackingContent() {
  const { user, loginAsGuest } = useAuth();
  const searchParams = useSearchParams();
  const [awb, setAwb] = useState('');
  const [shipment, setShipment] = useState<any>(null);
  const [trackingHistory, setTrackingHistory] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);

  useEffect(() => {
    if (!user) {
      loginAsGuest();
    }
  }, [user, loginAsGuest]);

  const handleExportPDF = () => {
    // Cek guest
    if (!user || user.role === 'guest') {
      setShowGuestPopup(true);
      return;
    }
    if (!shipment) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageW, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ALTUS AIR CARGO', pageW / 2, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Tracking Receipt', pageW / 2, 17, { align: 'center' });
    y = 30;

    // AWB Number
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`AWB: ${shipment.tracking_number}`, pageW / 2, y, { align: 'center' });
    y += 8;

    // Status badge
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Status: ${shipment.status?.replace('_', ' ').toUpperCase()}`, pageW / 2, y, { align: 'center' });
    y += 8;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(10, y, pageW - 10, y);
    y += 6;

    const addRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(8);
      doc.text(label, 12, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      doc.text(value || '-', 55, y);
      y += 6;
    };

    // Sender
    doc.setFillColor(239, 246, 255);
    doc.rect(10, y - 3, pageW - 20, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(8);
    doc.text('SENDER', 12, y + 2);
    y += 8;
    addRow('Name', maskName(shipment.sender));
    addRow('Phone', maskPhone(shipment.sender_contact));
    addRow('Address', shipment.sender_address || '-');

    y += 2;
    doc.line(10, y, pageW - 10, y);
    y += 5;

    // Recipient
    doc.setFillColor(240, 253, 244);
    doc.rect(10, y - 3, pageW - 20, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text('RECIPIENT', 12, y + 2);
    y += 8;
    addRow('Name', maskName(shipment.recipient_name));
    addRow('Phone', maskPhone(shipment.recipient_contact));
    addRow('Address', shipment.recipient_address || '-');

    y += 2;
    doc.line(10, y, pageW - 10, y);
    y += 5;

    // Shipment info
    doc.setFillColor(255, 251, 235);
    doc.rect(10, y - 3, pageW - 20, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text('SHIPMENT INFO', 12, y + 2);
    y += 8;
    addRow('Route', `${shipment.origin} - ${shipment.destination}`);
    addRow('Flight', shipment.flight_number || 'N/A');
    addRow('Weight', `${shipment.weight} kg`);
    addRow('Service', shipment.service_type || 'Regular');
    addRow('Item Type', shipment.item_type || '-');

    y += 2;
    doc.line(10, y, pageW - 10, y);
    y += 5;

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, pageW / 2, y + 5, { align: 'center' });
    doc.text('PT Altus Air Logistics — altus.id', pageW / 2, y + 10, { align: 'center' });

    doc.save(`ALTUS_${shipment.tracking_number}.pdf`);
  };

  const handleSearchWithAwb = async (awbNumber: string) => {
    if (!awbNumber.trim()) return;

    const normalizedAwb = awbNumber.trim().toUpperCase();
    setHasSearched(true);
    setLoading(true);
    setNotFound(false);

    try {
      const response = await fetch(`/api/tracking?awb=${encodeURIComponent(normalizedAwb)}`);

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
    <div className="h-full flex flex-col bg-white animate-fade-in">
      <TopNavbar
        title="Track Airway Bill"
        subtitle="Locate and track specific airway bills."
      />
      <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto no-scrollbar">
      {/* SECTION 1: Search Header */}
      <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[20px] backdrop-blur-md overflow-hidden p-3">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-slate-900 font-bold text-base">Track Airway Bill</h1>
            <p className="text-slate-600 text-xs">Enter your 10-12 digit AWB number to get real-time status updates.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-1.5 items-center">
            <div className="flex-1 max-w-md bg-white border-[2px] border-black/33 rounded-[12px] px-3 py-2 flex items-center gap-2">
              <Search size={16} className="text-slate-400" />
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
              className="px-5 py-2 bg-[#1e3a5f] text-white font-bold text-xs rounded-lg transition-all duration-300 hover:bg-[#2c5282] active:scale-95 whitespace-nowrap"
            >
              Track AWB
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 2 & 3: Details and Timeline */}
      {notFound ? (
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[20px] p-4 flex items-center justify-center flex-1">
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
        <div className="flex flex-col gap-3">
          {/* SECTION 2: Shipment Details */}
          <div className="border-[2px] border-black/20 rounded-[20px] overflow-hidden flex flex-col">
            {/* Top Blue Section */}
            <div
              style={{ backgroundColor: '#183c88' }}
              className="text-white px-4 py-4 flex items-start justify-between"
            >
              <div>
                <p className="text-xs opacity-80">Airway Bill Number</p>
                {loading ? (
                  <div className="h-5 bg-white/30 rounded w-40 mt-1 animate-pulse"></div>
                ) : !hasSearched || !shipment ? (
                  <h2 className="font-bold text-base font-mono mt-1 opacity-50">-</h2>
                ) : (
                  <h2 className="font-bold text-base font-mono mt-1">{shipment.tracking_number}</h2>
                )}
              </div>
              <div className="text-right">
                {loading ? (
                  <>
                    <div className="h-6 bg-white/30 rounded-full w-32 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-white/20 rounded w-28 animate-pulse"></div>
                  </>
                ) : !hasSearched || !shipment ? (
                  <>
                    <div
                      style={{ backgroundColor: 'rgba(18, 60, 149, 0.3)' }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium mb-2 opacity-50"
                    >
                      -
                    </div>
                    <div className="flex items-center gap-1 justify-end text-xs opacity-50">
                      <span>⏱</span>
                      <span>Last Update: -</span>
                    </div>
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
                    {loading ? (
                      <div className="h-4 bg-slate-300 rounded w-16 mx-auto animate-pulse"></div>
                    ) : !hasSearched || !shipment ? (
                      <p className="text-slate-400 font-medium">-</p>
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

          {/* SECTION 2.5: Sender & Recipient Details */}
          {hasSearched && shipment && (
            <div className="border-[2px] border-black/20 rounded-[20px] overflow-hidden">
              <div className="bg-white px-4 py-3 border-b-[2px] border-black/10 flex items-center justify-between">
                <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                  <Package size={14} className="text-blue-600" />
                  Shipment Details
                </h3>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#1e3a5f] text-white font-bold text-[11px] rounded-full hover:bg-[#2c5282] transition"
                >
                  <Download size={12} />
                  Export PDF
                </button>
              </div>
              <div className="bg-gradient-to-br from-white to-slate-50 px-4 py-3">
                <div className="flex items-stretch gap-4">
                  {/* Sender */}
                  <div className="flex-1 bg-blue-50/60 rounded-xl px-3 py-2.5 border border-blue-100">
                    <p className="text-blue-600 font-bold text-[10px] uppercase tracking-wider mb-1.5">✉ Sender</p>
                    <p className="text-slate-900 text-xs font-semibold">{maskName(shipment.sender)}</p>
                    <p className="text-slate-500 text-[11px] font-mono mt-0.5">{maskPhone(shipment.sender_contact)}</p>
                  </div>
                  {/* Arrow */}
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <span className="text-slate-400 text-sm">→</span>
                    </div>
                  </div>
                  {/* Recipient */}
                  <div className="flex-1 bg-emerald-50/60 rounded-xl px-3 py-2.5 border border-emerald-100">
                    <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider mb-1.5">📦 Recipient</p>
                    <p className="text-slate-900 text-xs font-semibold">{maskName(shipment.recipient_name)}</p>
                    <p className="text-slate-500 text-[11px] font-mono mt-0.5">{maskPhone(shipment.recipient_contact)}</p>
                  </div>
                  {/* Shipment Info */}
                  <div className="flex-1 bg-amber-50/60 rounded-xl px-3 py-2.5 border border-amber-100">
                    <p className="text-amber-600 font-bold text-[10px] uppercase tracking-wider mb-1.5">📋 Info</p>
                    <p className="text-slate-900 text-xs font-semibold">{shipment.item_type || 'General'}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{shipment.weight} kg · {shipment.service_type || 'Regular'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Tracking Timeline */}
          <div className="border-[2px] border-black/20 rounded-[20px] overflow-hidden min-h-[200px]">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b-[2px] border-black/20">
              <div className="flex items-center gap-2">
                <MapPin style={{ color: '#2563eb' }} size={16} />
                <h3 className="text-slate-900 font-bold text-sm">Tracking History</h3>
              </div>
            </div>

            {/* Timeline Content */}
            <div className="bg-gradient-to-br from-white to-slate-50 px-4 py-4 flex-1 flex flex-col justify-center">
              {loading ? (
                <div className="relative">
                  {/* Timeline line background */}
                  <div className="absolute top-[28px] -translate-y-1/2 left-[10%] right-[10%] h-[2px] bg-slate-300" />

                  {/* Timeline items - loading */}
                  <div className="flex justify-between items-start gap-2">
                    {['Booked', 'Received', 'In Transit', 'Arrived', 'Delivered'].map((step, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div className="relative z-10 mb-2">
                          <div className="w-14 h-14 bg-slate-300 rounded-full border-4 border-white flex items-center justify-center animate-pulse">
                            <div className="w-3.5 h-3.5 bg-slate-400 rounded-full" />
                          </div>
                        </div>
                        <h4 className="text-slate-900 font-bold text-sm text-center mb-1">{step}</h4>
                        <div className="text-center mb-0.5">
                          <div className="h-2.5 bg-slate-300 rounded w-12 mx-auto animate-pulse"></div>
                        </div>
                        <div className="h-2.5 bg-slate-200 rounded w-16 mx-auto animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !hasSearched || trackingHistory.length === 0 ? (
                <div className="relative">
                  {/* Timeline line background */}
                  <div className="absolute top-[28px] -translate-y-1/2 left-[10%] right-[10%] h-[2px] bg-slate-200" />

                  {/* Timeline items - empty state */}
                  <div className="flex justify-between items-start gap-2">
                    {['Booked', 'Received', 'In Transit', 'Arrived', 'Delivered'].map((step, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div className="relative z-10 mb-2">
                          <div className="w-14 h-14 bg-slate-200 rounded-full border-4 border-white flex items-center justify-center">
                            <div className="w-3.5 h-3.5 bg-slate-300 rounded-full" />
                          </div>
                        </div>
                        <h4 className="text-slate-400 font-bold text-sm text-center mb-1">{step}</h4>
                        <p className="text-slate-300 text-sm">-</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line background */}
                  <div className="absolute top-[28px] -translate-y-1/2 left-[10%] right-[10%] h-[2px] bg-slate-300" />

                  {/* Timeline items - real data */}
                  <div className="flex justify-between items-start gap-2">
                    {['booked', 'received', 'in_transit', 'arrived', 'delivered'].map((statusKey, idx) => {
                      const historyItem = trackingHistory.find(h => h.status === statusKey);
                      const isCompleted = !!historyItem;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          {/* Icon */}
                          <div className="relative z-10 mb-2">
                            {isCompleted ? (
                              <div
                                style={{ backgroundColor: '#2563eb' }}
                                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white"
                              >
                                ✓
                              </div>
                            ) : (
                              <div className="w-14 h-14 bg-slate-300 rounded-full border-4 border-white flex items-center justify-center">
                                <div className="w-3.5 h-3.5 bg-slate-400 rounded-full" />
                              </div>
                            )}
                          </div>

                          {/* Label */}
                          <h4 className="text-slate-900 font-bold text-sm text-center mb-1">
                            {statusKey.replace('_', ' ').charAt(0).toUpperCase() + statusKey.replace('_', ' ').slice(1)}
                          </h4>

                          {/* Timestamp & Location */}
                          {isCompleted ? (
                            <div className="text-center">
                              <p className="text-slate-600 text-sm opacity-70 font-mono">
                                {new Date(historyItem.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-slate-600 text-sm opacity-60">
                                📍 {historyItem.location}
                              </p>
                            </div>
                          ) : (
                            <p className="text-slate-300 text-sm">-</p>
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

      {/* Guest popup — harus login untuk export PDF */}
      {showGuestPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-[2px] border-black/20 rounded-[20px] p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Download size={26} className="text-blue-600" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">Login Required</h3>
              <p className="text-slate-600 text-sm mt-2">
                Kamu perlu punya akun untuk download tracking receipt dalam bentuk PDF. Silakan login atau buat akun dulu.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGuestPopup(false)}
                className="flex-1 px-4 py-2.5 bg-white border-[2px] border-black/20 text-slate-900 font-bold text-xs rounded-[12px] hover:bg-slate-50 transition"
              >
                Nanti Saja
              </button>
              <button
                onClick={() => { window.location.href = '/login'; }}
                className="flex-1 px-4 py-2.5 bg-[#1e3a5f] text-white font-bold text-xs rounded-[12px] hover:bg-[#2c5282] transition"
              >
                Login / Daftar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
