'use client';

import { useAuth } from '@/context/AuthContext';
import { Package, Plane, MapPin, Scale, Download, FileText, Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import { downloadCsv } from '@/lib/csv';
import { getStatusBadgeClass, formatStatusLabel } from '@/lib/shipmentStatus';

interface ReportShipment {
  id: number;
  tracking_number: string;
  sender: string;
  recipient_name: string;
  origin: string;
  destination: string;
  weight: number;
  item_type: string;
  service_type: string;
  status: string;
  flight_number: string | null;
  tariff: number | null;
  created_at: string;
}

export default function ReportsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<ReportShipment[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Stats
  const [stats, setStats] = useState({ total: 0, inFlight: 0, arrived: 0, totalWeight: 0 });

  // Redirect non-operators
  useEffect(() => {
    if (user && user.role !== 'operator') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
    loadReports();
  }, [debouncedSearch, statusFilter, dateFrom, dateTo]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('limit', '9999');

      const response = await fetch(`/api/shipments?${params.toString()}`);
      const data = await response.json();
      const all: ReportShipment[] = data.shipments || [];

      setShipments(all);

      // Compute stats from filtered data
      const total = all.length;
      const inFlight = all.filter(s => s.status === 'in_transit' || s.status === 'received' || s.status === 'booked').length;
      const arrived = all.filter(s => s.status === 'arrived' || s.status === 'delivered').length;
      const totalWeight = all.reduce((sum, s) => sum + (Number(s.weight) || 0), 0);
      setStats({ total, inFlight, arrived, totalWeight });
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchQuery);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const handleExportCSV = () => {
    if (shipments.length === 0) {
      toast.error('No shipments to export');
      return;
    }

    const headers = [
      'AWB', 'Sender', 'Recipient', 'Origin', 'Destination',
      'Flight', 'Weight (kg)', 'Service', 'Status', 'Created At'
    ];
    const rows = shipments.map(s => [
      s.tracking_number,
      s.sender,
      s.recipient_name,
      s.origin,
      s.destination,
      s.flight_number || 'N/A',
      s.weight,
      s.service_type,
      formatStatusLabel(s.status),
      new Date(s.created_at).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      }),
    ]);

    downloadCsv(`ALTUS_Report_${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
    toast.success('CSV exported successfully');
  };

  const handleExportPDF = () => {
    if (shipments.length === 0) {
      toast.error('No shipments to export');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const now = new Date().toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    // Header bar
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageW, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('ALTUS AIR CARGO - SHIPMENT REPORT', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generated: ${now}`, pageW - margin, 12, { align: 'right' });

    // Summary cards
    const cardY = 24;
    const cardH = 18;
    const cardW = (pageW - margin * 2 - 15) / 4;
    const cards: Array<{ label: string; value: string; color: [number, number, number] }> = [
      { label: 'Total Shipments', value: stats.total.toString(), color: [59, 130, 246] },
      { label: 'In-Flight', value: stats.inFlight.toString(), color: [249, 115, 22] },
      { label: 'Arrived / Delivered', value: stats.arrived.toString(), color: [16, 185, 129] },
      { label: 'Total Weight', value: `${stats.totalWeight.toLocaleString('id-ID')} kg`, color: [139, 92, 246] },
    ];

    cards.forEach((card, i) => {
      const x = margin + i * (cardW + 5);
      doc.setFillColor(...card.color);
      doc.roundedRect(x, cardY, cardW, cardH, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(card.value, x + cardW / 2, cardY + 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(card.label, x + cardW / 2, cardY + 14, { align: 'center' });
    });

    // Table header
    const tableY = cardY + cardH + 8;
    const colWidths = [38, 32, 32, 28, 28, 22, 20, 25, 26, 30];
    const colHeaders = ['AWB', 'Sender', 'Recipient', 'Origin', 'Destination', 'Flight', 'Weight', 'Service', 'Status', 'Date'];

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, tableY, pageW - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);

    let xPos = margin + 2;
    colHeaders.forEach((header, i) => {
      doc.text(header, xPos, tableY + 5);
      xPos += colWidths[i];
    });

    // Data rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    let rowY = tableY + 7;
    const rowH = 7;
    const maxRows = Math.floor((pageH - rowY - margin) / rowH);

    shipments.slice(0, maxRows).forEach((s, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, rowY, pageW - margin * 2, rowH, 'F');
      }

      doc.setTextColor(30, 41, 59);
      xPos = margin + 2;
      const row = [
        s.tracking_number,
        s.sender.length > 14 ? s.sender.substring(0, 13) + '…' : s.sender,
        s.recipient_name && s.recipient_name.length > 14 ? s.recipient_name.substring(0, 13) + '…' : (s.recipient_name || '-'),
        s.origin,
        s.destination,
        s.flight_number || '-',
        `${s.weight} kg`,
        s.service_type,
        formatStatusLabel(s.status),
        new Date(s.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }),
      ];

      row.forEach((cell, i) => {
        doc.text(String(cell), xPos, rowY + 5);
        xPos += colWidths[i];
      });
      rowY += rowH;
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `ALTUS Air Cargo Management System  -  Showing ${Math.min(shipments.length, maxRows)} of ${shipments.length} shipments`,
      pageW / 2,
      pageH - 6,
      { align: 'center' }
    );

    doc.save(`ALTUS_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success('PDF exported successfully');
  };

  const handleAwbClick = (awb: string) => {
    router.push(`/dashboard/tracking?search=${encodeURIComponent(awb)}`);
  };

  const hasActiveFilters = searchQuery || statusFilter || dateFrom || dateTo;

  // Client-side pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = shipments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(shipments.length / itemsPerPage);

  if (!user || user.role !== 'operator') return null;

  return (
    <div className="h-full flex flex-col bg-white animate-fade-in overflow-hidden">
      <div className="p-4 overflow-y-auto no-scrollbar">
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[24px] overflow-hidden flex flex-col">

          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 flex items-center justify-between border-b-[2px] border-black/20">
            <div>
              <h1 className="text-slate-900 font-bold text-lg">Shipment Reports</h1>
              <p className="text-slate-600 text-xs mt-1">Comprehensive overview of all cargo shipments</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border-[2px] border-black/20 text-slate-900 font-bold text-xs rounded-full hover:bg-cyan-50 transition disabled:opacity-50"
              >
                <Download size={14} />
                Export CSV
              </button>
              <button
                onClick={handleExportPDF}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white font-bold text-xs rounded-full hover:bg-red-600 transition disabled:opacity-50"
              >
                <FileText size={14} />
                Export PDF
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="px-5 pt-3">
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded-[16px] p-3.5 border-[2px] border-black/15 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                    <Package size={15} className="text-blue-600" strokeWidth={2.5} />
                  </div>
                  <span className="text-slate-500 text-xs font-semibold">Total Shipments</span>
                </div>
                <p className="text-2xl font-black text-slate-900 ml-9">{loading ? '-' : stats.total.toLocaleString('id-ID')}</p>
              </div>

              <div className="bg-white rounded-[16px] p-3.5 border-[2px] border-black/15 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center">
                    <Plane size={15} className="text-orange-600" strokeWidth={2.5} />
                  </div>
                  <span className="text-slate-500 text-xs font-semibold">In-Flight</span>
                </div>
                <p className="text-2xl font-black text-slate-900 ml-9">{loading ? '-' : stats.inFlight.toLocaleString('id-ID')}</p>
              </div>

              <div className="bg-white rounded-[16px] p-3.5 border-[2px] border-black/15 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <MapPin size={15} className="text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <span className="text-slate-500 text-xs font-semibold">Arrived / Delivered</span>
                </div>
                <p className="text-2xl font-black text-slate-900 ml-9">{loading ? '-' : stats.arrived.toLocaleString('id-ID')}</p>
              </div>

              <div className="bg-white rounded-[16px] p-3.5 border-[2px] border-black/15 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center">
                    <Scale size={15} className="text-purple-600" strokeWidth={2.5} />
                  </div>
                  <span className="text-slate-500 text-xs font-semibold">Total Weight</span>
                </div>
                <p className="text-2xl font-black text-slate-900 ml-9">
                  {loading ? '-' : `${stats.totalWeight.toLocaleString('id-ID')} kg`}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-5 pt-3 pb-0">
            <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-[200px] bg-white border-[2px] border-black/20 rounded-[16px] px-3 py-2 flex items-center gap-2">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search AWB, sender, recipient, city, item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-slate-900 text-xs outline-none placeholder-slate-400"
                />
              </div>

              <div className="bg-white border-[2px] border-black/20 rounded-[16px] px-3 py-2 flex items-center gap-2 min-w-[140px]">
                <Calendar size={14} className="text-slate-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-transparent text-slate-900 text-xs outline-none"
                  title="From date"
                />
              </div>

              <div className="bg-white border-[2px] border-black/20 rounded-[16px] px-3 py-2 flex items-center gap-2 min-w-[140px]">
                <Calendar size={14} className="text-slate-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-transparent text-slate-900 text-xs outline-none"
                  title="To date"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border-[2px] border-black/20 rounded-[16px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-blue-400 min-w-[130px]"
              >
                <option value="">All Status</option>
                <option value="booked">Booked</option>
                <option value="received">Received</option>
                <option value="in_transit">In Transit</option>
                <option value="arrived">Arrived</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-[#1e3a5f] text-white font-bold text-xs rounded-[16px] transition-all hover:scale-105 active:scale-95 hover:shadow-lg hover:bg-[#2c5282]"
              >
                Search
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-white border-[2px] border-red-300 text-red-600 font-bold text-xs rounded-[16px] transition-all hover:bg-red-50"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Table */}
          <div className="px-5 pt-3 pb-3">
            <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[16px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b-[2px] border-black/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                      <th className="text-left py-2 px-3 text-slate-900 font-bold text-xs">AWB</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold text-xs">Sender</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold text-xs">Recipient</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold text-xs">Origin</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold text-xs">Destination</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold text-xs">Flight</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold text-xs">Weight</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold text-xs">Service</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold text-xs">Status</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold text-xs">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(5)].map((_, idx) => (
                        <tr key={idx} className="border-b-[1px] border-black/20">
                          <td className="py-2 px-3"><div className="h-3 bg-slate-300 rounded w-24 animate-pulse"></div></td>
                          <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-28 animate-pulse"></div></td>
                          <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-24 animate-pulse"></div></td>
                          <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div></td>
                          <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div></td>
                          <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div></td>
                          <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-14 animate-pulse"></div></td>
                          <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div></td>
                          <td className="py-2 px-3"><div className="h-5 bg-slate-300 rounded-full w-20 animate-pulse"></div></td>
                          <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div></td>
                        </tr>
                      ))
                    ) : shipments.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                          No shipments found. Try adjusting your filters.
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((s, idx) => (
                        <tr key={idx} className="border-b-[1px] border-black/20 hover:bg-cyan-50 transition cursor-default">
                          <td className="py-2 px-3">
                            <button
                              onClick={() => handleAwbClick(s.tracking_number)}
                              className="font-bold text-xs text-blue-600 hover:text-blue-800 hover:underline transition"
                            >
                              {s.tracking_number}
                            </button>
                          </td>
                          <td className="py-2 px-3 text-slate-700 text-xs">{s.sender}</td>
                          <td className="py-2 px-3 text-slate-700 text-xs">{s.recipient_name || '-'}</td>
                          <td className="py-2 px-3 text-slate-700 text-xs">{s.origin}</td>
                          <td className="py-2 px-3 text-slate-700 text-xs">{s.destination}</td>
                          <td className="py-2 px-3 text-slate-700 text-xs">{s.flight_number || '-'}</td>
                          <td className="py-2 px-3 text-slate-700 text-xs">{s.weight} kg</td>
                          <td className="py-2 px-3 text-slate-700 text-xs">{s.service_type}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-block border ${getStatusBadgeClass(s.status)}`}>
                              {formatStatusLabel(s.status)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-xs">
                            {new Date(s.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer with count and pagination */}
              {!loading && shipments.length > 0 && (
                <>
                  <div className="px-4 py-2 border-t-[2px] border-black/20 bg-slate-50">
                    <span className="text-xs text-slate-600 font-semibold">
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, shipments.length)} of {shipments.length} shipment{shipments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {totalPages > 1 && (
                    <div className="px-4 py-2.5 border-t-[1px] border-black/10 bg-white flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-white border-[2px] border-black/20 rounded-lg text-slate-900 font-bold text-xs hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                      >
                        <ChevronLeft size={14} />
                        Previous
                      </button>

                      <div className="flex gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = idx + 1;
                          } else if (currentPage <= 3) {
                            pageNum = idx + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + idx;
                          } else {
                            pageNum = currentPage - 2 + idx;
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                currentPage === pageNum
                                  ? 'bg-[#1e3a5f] text-white shadow-md'
                                  : 'bg-white border-[2px] border-black/20 text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 bg-white border-[2px] border-black/20 rounded-lg text-slate-900 font-bold text-xs hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                      >
                        Next
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
