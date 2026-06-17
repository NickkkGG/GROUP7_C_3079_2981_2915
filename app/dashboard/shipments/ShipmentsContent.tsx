'use client';

import { useAuth } from '@/context/AuthContext';
import { Package, Plus, Download, ChevronLeft, ChevronRight, Search, Edit, Ban } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import ShipmentDetailDrawer from './ShipmentDetailDrawer';
import StatusDropdown from '@/components/StatusDropdown';
import CreateShipmentForm from './CreateShipmentForm';
import EditShipmentForm from './EditShipmentForm';
import { downloadCsv } from '@/lib/csv';
import { getStatusBadgeClass, formatStatusLabel } from '@/lib/shipmentStatus';

export default function ShipmentsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [shipmentToCancel, setShipmentToCancel] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 8;

  useEffect(() => {
    if (user && user.role === 'guest') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadShipments();
  }, [currentPage, debouncedSearch, statusFilter]);

  const loadShipments = async () => {
    try {
      // Don't show loading skeleton if we already have data (optimistic UI)
      const shouldShowLoading = shipments.length === 0;
      if (shouldShowLoading) {
        setLoading(true);
      }

      const response = await fetch(`/api/shipments?search=${debouncedSearch}&page=${currentPage}&limit=${limit}${statusFilter ? `&status=${statusFilter}` : ''}`);
      const data = await response.json();

      setShipments(data.shipments || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || 0);

      if (shouldShowLoading) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/shipments?limit=9999');
      const data = await response.json();
      const all = data.shipments || [];
      if (all.length === 0) { toast.error('No shipments to export'); return; }

      const headers = ['AWB', 'Sender', 'Recipient', 'Origin', 'Destination', 'Flight', 'Weight (kg)', 'Service', 'Status', 'Created At'];
      const rows = all.map((s: any) => [
        s.tracking_number, s.sender, s.recipient_name, s.origin, s.destination,
        s.flight_number || 'N/A', s.weight, s.service_type, s.status,
        new Date(s.created_at).toLocaleDateString('id-ID')
      ]);

      downloadCsv(`ALTUS_Shipments_${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleViewShipment = (trackingNumber: string) => {
    setSelectedTracking(trackingNumber);
    setDrawerOpen(true);
  };

  const handleEditShipment = (shipment: any) => {
    setSelectedShipment(shipment);
    setIsEditing(true);
  };

  const handleCancelShipment = (shipment: any) => {
    setShipmentToCancel(shipment);
    setCancelReason('');
  };

  const confirmCancel = async () => {
    if (!shipmentToCancel) return;
    const reason = cancelReason.trim();
    if (reason.length < 5) {
      toast.error('Please enter a reason (at least 5 characters)');
      return;
    }
    setCancelling(true);
    try {
      const response = await fetch(`/api/shipments?id=${shipmentToCancel.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, requesterEmail: user?.email }),
      });

      if (response.ok) {
        toast.success(`Shipment ${shipmentToCancel.tracking_number} has been cancelled`);
        setShipmentToCancel(null);
        setCancelReason('');
        loadShipments();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to cancel shipment');
      }
    } catch (error) {
      console.error('Error cancelling shipment:', error);
      toast.error('Failed to cancel shipment. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (!user || user.role === 'guest') {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      <div className="p-4 flex flex-col overflow-y-auto flex-1 no-scrollbar">
        {/* Content Box */}
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[24px] backdrop-blur-md overflow-hidden flex flex-col flex-1">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 flex items-center justify-between border-b-[2px] border-black/20">
          <div>
            <h1 className="text-slate-900 font-bold text-lg">Shipments Management</h1>
            <p className="text-slate-600 text-xs mt-1">Monitor all active air cargo shipments</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border-[2px] border-black/20 text-slate-900 font-bold text-xs rounded-full hover:bg-cyan-50 transition">
              <Download size={14} />
              Export CSV
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white font-bold text-xs rounded-full hover:bg-emerald-600 transition"
            >
              <Plus size={14} />
              New
            </button>
          </div>
        </div>

        {/* Search Section - Hidden when creating */}
        {!isCreating && (
          <div className="bg-white px-6 py-3 border-b-[2px] border-black/20">
            <p className="text-slate-900 font-medium text-xs mb-2.5">
              Search and filter shipments
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 bg-white border-[2px] border-black/20 rounded-[16px] px-3.5 py-2 flex items-center gap-2">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search AWB, pengirim, penerima, jenis barang, kota, atau flight..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-slate-900 text-xs outline-none placeholder-slate-400"
                />
              </div>
              <StatusDropdown
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'booked', label: 'Booked' },
                  { value: 'received', label: 'Received' },
                  { value: 'in_transit', label: 'In Transit' },
                  { value: 'arrived', label: 'Arrived' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1e3a5f] text-white font-bold text-xs rounded transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:bg-[#2c5282]"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Content Section */}
        <div className="space-y-3 p-5 bg-white overflow-y-auto flex-1 no-scrollbar">
          {isCreating ? (
            <CreateShipmentForm
              onClose={() => setIsCreating(false)}
              onSuccess={() => {
                setIsCreating(false);
                loadShipments();
                // Trigger dashboard refresh
                window.dispatchEvent(new Event('shipment-created'));
              }}
            />
          ) : isEditing ? (
            <EditShipmentForm
              shipment={selectedShipment}
              onClose={() => setIsEditing(false)}
              onSuccess={() => {
                setIsEditing(false);
                loadShipments();
              }}
            />
          ) : (
            <>
          {/* Shipments Table Box */}
          <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[16px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-[2px] border-black/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                    <th className="text-left py-2 px-4 text-slate-900 font-bold text-xs">AWB</th>
                    <th className="text-left py-2 px-4 text-slate-900 font-bold text-xs">Sender</th>
                    <th className="text-left py-2 px-4 text-slate-900 font-bold text-xs">Destination</th>
                    <th className="text-left py-2 px-4 text-slate-900 font-bold text-xs">Flight</th>
                    <th className="text-left py-2 px-4 text-slate-900 font-bold text-xs">Status</th>
                    <th className="text-left py-2 px-4 text-slate-900 font-bold text-xs">Weight</th>
                    <th className="text-left py-2 px-4 text-slate-900 font-bold text-xs">View</th>
                    <th className="text-left py-2 px-4 text-slate-900 font-bold text-xs">Edit</th>
                    <th className="text-left py-2 px-4 text-slate-900 font-bold text-xs">Cancel</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Loading state - gray placeholders
                    [...Array(8)].map((_, idx) => (
                      <tr key={idx} className="border-b-[1px] border-black/20">
                        <td className="py-2 px-4">
                          <div className="h-4 bg-slate-300 rounded w-28"></div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="h-4 bg-slate-200 rounded w-32"></div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="h-4 bg-slate-200 rounded w-20"></div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="h-6 bg-slate-300 rounded-full w-16"></div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="h-4 bg-slate-200 rounded w-16"></div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="h-4 bg-slate-300 rounded w-12"></div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="h-4 bg-slate-200 rounded w-12"></div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="h-4 bg-slate-200 rounded w-14"></div>
                        </td>
                      </tr>
                    ))
                  ) : shipments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400 text-xs">
                        No shipments found.
                      </td>
                    </tr>
                  ) : (
                    shipments.map((shipment, idx) => (
                      <tr key={idx} className="border-b-[1px] border-black/20 hover:bg-cyan-50 transition">
                        <td className="py-2 px-4">
                          <span className="font-bold text-slate-900 text-xs">{shipment.tracking_number}</span>
                        </td>
                        <td className="py-2 px-4 text-slate-700 text-xs">{shipment.sender}</td>
                        <td className="py-2 px-4 text-slate-700 text-xs">{shipment.destination}</td>
                        <td className="py-2 px-4 text-slate-700 text-xs">{shipment.flight_number || 'N/A'}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-block border ${getStatusBadgeClass(shipment.status)}`}
                          >
                            {formatStatusLabel(shipment.status)}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-slate-700 text-xs">{shipment.weight} kg</td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => handleViewShipment(shipment.tracking_number)}
                            className="text-cyan-600 hover:text-cyan-700 font-bold text-xs"
                          >
                            View →
                          </button>
                        </td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => handleEditShipment(shipment)}
                            className="text-orange-600 hover:text-orange-700 font-bold text-xs flex items-center gap-1"
                          >
                            <Edit size={12} />
                            Edit
                          </button>
                        </td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => shipment.status === 'booked' ? handleCancelShipment(shipment) : null}
                            disabled={shipment.status !== 'booked'}
                            title={shipment.status !== 'booked' ? `Cannot cancel: shipment is "${shipment.status}"` : 'Cancel shipment'}
                            className={`font-bold text-xs flex items-center gap-1 transition ${
                              shipment.status === 'booked'
                                ? 'text-red-600 hover:text-red-700 cursor-pointer'
                                : 'text-slate-300 cursor-not-allowed'
                            }`}
                          >
                            <Ban size={12} />
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {!loading && shipments.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-xs text-slate-600">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} shipments
              </div>
              <div className="flex items-center gap-2">
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
            </div>
          )}
            </>
          )}
        </div>
        </div>
      </div>

      {/* Shipment Detail Drawer */}
      <ShipmentDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        trackingNumber={selectedTracking}
      />

      {/* Cancel Confirmation Modal */}
      {shipmentToCancel && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-[2px] border-black/20 rounded-[20px] p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center">
                <Ban size={20} className="text-red-600" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">Cancel Shipment?</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              You are about to cancel shipment <span className="font-bold text-slate-900">{shipmentToCancel.tracking_number}</span>. The record will be kept and marked as cancelled. Please provide a reason.
            </p>
            <div className="mb-5">
              <label className="text-slate-700 font-semibold text-xs mb-1.5 block">Cancellation Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                maxLength={300}
                autoFocus
                placeholder="e.g. Customer requested cancellation, wrong destination, duplicate booking..."
                className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
              />
              <p className="text-slate-400 text-[10px] mt-1">{cancelReason.length}/300 · minimum 5 characters</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShipmentToCancel(null); setCancelReason(''); }}
                disabled={cancelling}
                className="flex-1 px-4 py-2.5 bg-slate-200 border-[2px] border-slate-400 text-slate-900 font-bold text-xs rounded-[12px] hover:bg-slate-300 transition disabled:opacity-50"
              >
                Keep It
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelling || cancelReason.trim().length < 5}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold text-xs rounded-[12px] hover:bg-red-700 transition disabled:opacity-50 shadow-md"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
