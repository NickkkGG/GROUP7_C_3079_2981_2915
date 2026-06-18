'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Settings, Info, MapPin, Search, Package, Download, Plane } from 'lucide-react';
import TopNavbar from '@/components/TopNavbar';
import { jsPDF } from 'jspdf';

// Helper: sensor nama — "Budi Santoso" → "Budi S******"
function maskName(name: string): string {
  if (!name) return '-';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0) + '*'.repeat(Math.max(parts[0].length - 1, 3));
  return parts[0] + ' ' + parts.slice(1).map(p => p.charAt(0) + '*'.repeat(Math.max(p.length - 1, 2))).join(' ');
}

// Helper: sensor telepon — "08123456789" → "0812*****9" (4 depan + bintang + 1 belakang)
function maskPhone(phone: string): string {
  if (!phone) return '-';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 5) return '*'.repeat(digits.length);
  const stars = '*'.repeat(Math.max(digits.length - 5, 1));
  return digits.slice(0, 4) + stars + digits.slice(-1);
}

// Estimasi waktu tiba: created_at + hari sesuai service type
function estimateArrival(createdAt: string, serviceType: string): string {
  if (!createdAt) return 'Not scheduled';
  const days: Record<string, number> = { Priority: 1, Express: 2, Regular: 4 };
  const addDays = days[serviceType] ?? 4;
  const eta = new Date(createdAt);
  eta.setDate(eta.getDate() + addDays);
  return eta.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
  const [searchError, setSearchError] = useState('');
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [pendingShipment, setPendingShipment] = useState<any>(null);
  const [pendingHistory, setPendingHistory] = useState<any[]>([]);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [verifySuccess, setVerifySuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      loginAsGuest();
    }
  }, [user, loginAsGuest]);

  // Log user activity (tracking / download) for logged-in non-guest users only
  const logActivity = (type: 'track' | 'download', trackingNumber: string) => {
    if (!user || user.role === 'guest' || !user.email || !trackingNumber) return;
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, type, trackingNumber }),
    }).catch(() => {});
  };

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
    logActivity('download', shipment.tracking_number);
  };

  const handleSearchWithAwb = async (awbNumber: string) => {
    if (!awbNumber.trim()) {
      setSearchError('AWB number is required. Please enter a tracking number.');
      return;
    }

    setSearchError('');
    const normalizedAwb = awbNumber.trim().toUpperCase();
    setHasSearched(true);
    setLoading(true);
    setNotFound(false);

    try {
      const response = await fetch(`/api/tracking?awb=${encodeURIComponent(normalizedAwb)}`);

      if (response.ok) {
        const data = await response.json();
        // Operator skip verification, others must verify phone
        if (user?.role === 'operator') {
          setShipment(data.shipment);
          setTrackingHistory(data.history || []);
          setNotFound(false);
          logActivity('track', data.shipment?.tracking_number || normalizedAwb);
        } else {
          setPendingShipment(data.shipment);
          setPendingHistory(data.history || []);
          setVerificationRequired(true);
          setPhoneInput('');
          setVerifyError('');
        }
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

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setTimeout(() => setLockoutSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [lockoutSeconds]);

  const handleVerifyPhone = () => {
    if (lockoutSeconds > 0) return;
    const input = phoneInput.trim().replace(/\D/g, '');
    if (input.length !== 4) {
      setVerifyError('Please enter exactly 4 digits.');
      return;
    }
    const senderLast4 = (pendingShipment?.sender_contact || '').replace(/\D/g, '').slice(-4);
    const recipientLast4 = (pendingShipment?.recipient_contact || '').replace(/\D/g, '').slice(-4);
    if (input === senderLast4 || input === recipientLast4) {
      setVerifySuccess(true);
      setVerifyError('');
      setTimeout(() => {
        setShipment(pendingShipment);
        setTrackingHistory(pendingHistory);
        setNotFound(false);
        setVerificationRequired(false);
        setPendingShipment(null);
        setPendingHistory([]);
        setVerifyAttempts(0);
        setLockoutSeconds(0);
        setVerifySuccess(false);
        logActivity('track', pendingShipment?.tracking_number || awb);
      }, 1200);
    } else {
      const newAttempts = verifyAttempts + 1;
      setVerifyAttempts(newAttempts);
      setPhoneInput('');
      if (newAttempts >= 3) {
        setVerifyAttempts(0);
        setLockoutSeconds(30);
        setVerifyError('');
      } else {
        setVerifyError(`Incorrect. ${3 - newAttempts} attempt${3 - newAttempts === 1 ? '' : 's'} remaining.`);
      }
    }
  };

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
      <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
      {!hasSearched ? (
        /* LANDING HERO — sebelum search, hanya kotak search */
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in relative overflow-hidden">
          {/* ===== Dekorasi background (tanpa gradient, warna solid) ===== */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {/* Grid garis halus */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                backgroundSize: '38px 38px',
              }}
            />
            {/* Soft color blobs — warna solid + blur, bukan gradient */}
            <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-blue-600/25 blur-3xl" />
            <div className="absolute -bottom-24 -right-10 w-80 h-80 rounded-full bg-[#1e3a5f]/30 blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-indigo-500/20 blur-2xl" />
          </div>

          {/* ===== Konten utama (di atas dekorasi) ===== */}
          <div className="relative z-10 flex flex-col items-center">
          <div className="w-28 h-28 bg-white rounded-[28px] border-[2px] border-black/10 shadow-lg shadow-slate-300/50 flex items-center justify-center mb-6 relative overflow-hidden">
            <Image src="/images/icon_altus.png" alt="ALTUS" fill sizes="112px" className="object-contain scale-[1.7] translate-y-[6px]" priority />
          </div>
          <h1 className="text-slate-900 font-black text-2xl md:text-3xl tracking-tight">Track Your Airway Bill Here</h1>
          <p className="text-slate-500 text-sm mt-2.5 max-w-md leading-relaxed">
            Enter your AWB number below to get real-time shipment status, route details, and the delivery timeline.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 items-center w-full max-w-lg mt-8">
            <div className="flex-1 bg-white border-[2px] border-black/20 rounded-[14px] px-4 py-3 flex items-center gap-2.5 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search size={18} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={awb}
                autoFocus
                onChange={(e) => { setAwb(e.target.value); setSearchError(''); }}
                className="flex-1 bg-transparent text-slate-900 text-sm outline-none placeholder-slate-400"
                placeholder="e.g. AWB-EP-00000"
              />
              {awb && (
                <button
                  type="button"
                  onClick={() => setAwb('')}
                  className="text-slate-900 opacity-40 hover:opacity-70 transition text-sm flex-shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-7 py-3 bg-[#1e3a5f] text-white font-bold text-sm rounded-[14px] transition-all duration-300 hover:bg-[#2c5282] active:scale-95 whitespace-nowrap shadow-md shadow-blue-900/20"
            >
              Track
            </button>
          </form>
          {searchError && (
            <div className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-red-50 border border-red-300 rounded-[12px] max-w-lg w-full">
              <span className="text-red-600 text-xs font-semibold">{searchError}</span>
            </div>
          )}
          <p className="text-slate-400 text-[11px] mt-4">AWB numbers are case-insensitive.</p>
          </div>
        </div>
      ) : loading ? (
        /* LOADING SCREEN — while loading the shipment */
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in">
          <div className="relative w-20 h-20 mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src="/images/icon_altus.png" alt="ALTUS" width={38} height={38} className="object-contain" />
            </div>
          </div>
          <h2 className="text-slate-900 font-bold text-lg">Loading the shipment</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-mono">{awb}</p>
          <p className="text-slate-400 text-xs mt-3">Fetching status, route, and tracking history…</p>
        </div>
      ) : verificationRequired ? (
        /* VERIFICATION SCREEN */
        <div className="flex-1 flex flex-col items-center justify-center px-4 animate-fade-in">
          <div className="w-full max-w-sm">
            <div className="bg-white border-[2px] border-black/20 rounded-[24px] overflow-hidden shadow-lg">
              {/* Header */}
              <div className="bg-[#1e3a5f] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider">Tracking Number</p>
                    <p className="text-white font-bold text-sm font-mono">{awb}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-5">
                {verifySuccess ? (
                  <div className="flex flex-col items-center py-6 animate-fade-in">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-emerald-700 font-black text-base mb-1">Verification Successful</h2>
                    <p className="text-slate-500 text-xs">Loading your shipment…</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-slate-900 font-black text-base mb-1">Phone Verification</h2>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                      Enter the <span className="font-bold text-slate-700">last 4 digits</span> of the phone number registered to this shipment (sender or recipient).
                    </p>

                {/* Lockout banner */}
                {lockoutSeconds > 0 && (
                  <div className="mb-4 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-[12px] px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-black text-sm">{lockoutSeconds}</span>
                    </div>
                    <p className="text-orange-700 text-xs leading-relaxed">
                      Too many incorrect attempts. Please wait <span className="font-bold">{lockoutSeconds}s</span> before trying again.
                    </p>
                  </div>
                )}

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={phoneInput}
                    autoFocus
                    disabled={lockoutSeconds > 0}
                    onChange={(e) => { setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 4)); setVerifyError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyPhone()}
                    placeholder="_ _ _ _"
                    className={`flex-1 border-[2px] rounded-[12px] px-4 py-2.5 text-slate-900 text-sm font-mono font-bold outline-none transition-all placeholder-slate-400 text-center tracking-[0.3em] ${
                      lockoutSeconds > 0
                        ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400'
                        : 'bg-white border-black/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  <button
                    onClick={handleVerifyPhone}
                    disabled={lockoutSeconds > 0}
                    className={`px-5 py-2.5 font-bold text-sm rounded-[12px] transition-all ${
                      lockoutSeconds > 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-[#1e3a5f] text-white hover:bg-[#2c5282] active:scale-95'
                    }`}
                  >
                    Verify
                  </button>
                </div>

                {verifyError && (
                  <div className="mt-2.5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-[10px] px-3 py-2">
                    <Info size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-xs">{verifyError}</p>
                  </div>
                )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-black/10 px-5 py-3">
                <button
                  onClick={() => { setHasSearched(false); setVerificationRequired(false); setPendingShipment(null); setPendingHistory([]); setPhoneInput(''); setVerifyError(''); setAwb(''); }}
                  className="text-slate-400 hover:text-slate-700 text-xs font-semibold transition"
                >
                  ← Search different AWB
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <>
      {/* Tombol kecil untuk balik ke landing & search AWB lain */}
      <button
        onClick={() => { setHasSearched(false); setShipment(null); setTrackingHistory([]); setNotFound(false); setAwb(''); setVerificationRequired(false); setPendingShipment(null); setPendingHistory([]); setPhoneInput(''); setVerifyError(''); }}
        className="flex items-center gap-1.5 px-4 py-2 bg-[#1e3a5f] border-[2px] border-[#1e3a5f] text-white hover:bg-[#2c5282] hover:border-[#2c5282] text-xs font-bold rounded-[12px] transition self-start flex-shrink-0 shadow-sm"
      >
        <Search size={13} />
        Track another AWB
      </button>

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
                      style={{ backgroundColor: shipment.status === 'cancelled' ? 'rgba(220, 38, 38, 0.85)' : 'rgba(18, 60, 149, 0.3)' }}
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
              <div className="grid grid-cols-5 gap-4 text-xs">
                {['ORIGIN', 'DESTINATION', 'FLIGHT', 'EST. ARRIVAL', 'CREATED'].map((label, idx) => (
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
                         idx === 3 ? (shipment.arrival_time ? new Date(shipment.arrival_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : estimateArrival(shipment.created_at, shipment.service_type)) :
                         (shipment.created_at ? new Date(shipment.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cancellation Notice — only for cancelled shipments */}
          {hasSearched && shipment && shipment.status === 'cancelled' && (
            <div className="border-[2px] border-red-300 bg-red-50 rounded-[20px] overflow-hidden">
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Info size={18} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-900 font-bold text-sm">Shipment Cancelled</h3>
                  <p className="text-red-700 text-xs mt-1 leading-relaxed">
                    <span className="font-semibold">Reason:</span> {shipment.cancellation_reason || 'No reason provided.'}
                  </p>
                </div>
              </div>
            </div>
          )}

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
              <div className="bg-white px-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sender */}
                  <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-100">
                    <p className="text-blue-700 font-bold text-[11px] uppercase tracking-wider mb-3 pb-2 border-b border-blue-100">Sender</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wide">Name</p>
                        <p className="text-slate-900 text-xs font-semibold">{maskName(shipment.sender)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wide">Phone</p>
                        <p className="text-slate-700 text-xs font-mono">{maskPhone(shipment.sender_contact)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wide">Address</p>
                        <p className="text-slate-700 text-xs leading-relaxed">{shipment.sender_address || '-'}</p>
                      </div>
                    </div>
                  </div>
                  {/* Recipient */}
                  <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100">
                    <p className="text-emerald-700 font-bold text-[11px] uppercase tracking-wider mb-3 pb-2 border-b border-emerald-100">Recipient</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wide">Name</p>
                        <p className="text-slate-900 text-xs font-semibold">{maskName(shipment.recipient_name)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wide">Phone</p>
                        <p className="text-slate-700 text-xs font-mono">{maskPhone(shipment.recipient_contact)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wide">Address</p>
                        <p className="text-slate-700 text-xs leading-relaxed">{shipment.recipient_address || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Shipment Info row */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wide">Route</p>
                    <p className="text-slate-900 text-xs font-semibold">{shipment.origin} - {shipment.destination}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wide">Item / Service</p>
                    <p className="text-slate-900 text-xs font-semibold">{shipment.item_type || 'General'} · {shipment.service_type || 'Regular'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wide">Weight</p>
                    <p className="text-slate-900 text-xs font-semibold">{shipment.weight} kg</p>
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
            <div className="bg-gradient-to-br from-white to-slate-50 px-4 py-6 flex flex-col justify-center">
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
              ) : shipment && shipment.status === 'cancelled' ? (
                <div className="relative">
                  {/* Timeline line: booked -> cancelled */}
                  <div className="absolute top-[28px] -translate-y-1/2 left-[25%] right-[25%] h-[2px] bg-red-200" />
                  <div className="flex justify-center items-start gap-16">
                    {/* Booked step (completed) */}
                    <div className="flex flex-col items-center">
                      <div className="relative z-10 mb-2">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white" style={{ backgroundColor: '#2563eb' }}>
                          ✓
                        </div>
                      </div>
                      <h4 className="text-slate-900 font-bold text-sm text-center mb-1">Booked</h4>
                      {(() => {
                        const bookedItem = trackingHistory.find(h => h.status === 'booked');
                        return bookedItem ? (
                          <p className="text-slate-600 text-sm opacity-70 font-mono">
                            {new Date(bookedItem.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        ) : <p className="text-slate-300 text-sm">-</p>;
                      })()}
                    </div>
                    {/* Cancelled step */}
                    <div className="flex flex-col items-center">
                      <div className="relative z-10 mb-2">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white" style={{ backgroundColor: '#dc2626' }}>
                          ✕
                        </div>
                      </div>
                      <h4 className="text-red-700 font-bold text-sm text-center mb-1">Cancelled</h4>
                      {(() => {
                        const cancelledItem = trackingHistory.find(h => h.status === 'cancelled');
                        return cancelledItem ? (
                          <p className="text-slate-600 text-sm opacity-70 font-mono">
                            {new Date(cancelledItem.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        ) : <p className="text-slate-300 text-sm">-</p>;
                      })()}
                    </div>
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
      </>
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
                You need an account to download the tracking receipt as PDF. Please log in or create an account first.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGuestPopup(false)}
                className="flex-1 px-4 py-2.5 bg-white border-[2px] border-black/20 text-slate-900 font-bold text-xs rounded-[12px] hover:bg-slate-50 transition"
              >
                Later
              </button>
              <button
                onClick={() => { window.location.href = '/login'; }}
                className="flex-1 px-4 py-2.5 bg-[#1e3a5f] text-white font-bold text-xs rounded-[12px] hover:bg-[#2c5282] transition"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
