'use client';

import { X, Package, MapPin, User, Phone, Home, FileText, Clock, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ShipmentDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trackingNumber: string;
}

export default function ShipmentDetailDrawer({ isOpen, onClose, trackingNumber }: ShipmentDetailDrawerProps) {
  const router = useRouter();
  const [shipment, setShipment] = useState<any>(null);
  const [trackingHistory, setTrackingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && trackingNumber) {
      setIsAnimating(true);
      loadShipmentDetails();
    } else if (!isOpen && isAnimating) {
      // Delay hiding to allow close animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setShipment(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, trackingNumber]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const loadShipmentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shipments/${trackingNumber}`);
      const data = await response.json();

      if (data.shipment) {
        setShipment(data.shipment);
        setTrackingHistory(data.trackingHistory || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading shipment details:', error);
      setLoading(false);
    }
  };

  const handleViewFullTracking = () => {
    router.push(`/dashboard/tracking?search=${trackingNumber}`);
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 text-blue-700 border-blue-400';
      case 'received': return 'bg-purple-100 text-purple-700 border-purple-400';
      case 'in_transit': return 'bg-orange-100 text-orange-700 border-orange-400';
      case 'arrived': return 'bg-cyan-100 text-cyan-700 border-cyan-400';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-400';
      default: return 'bg-slate-100 text-slate-700 border-slate-400';
    }
  };

  const formatStatus = (status: string) => {
    return status?.replace('_', ' ').charAt(0).toUpperCase() + status?.replace('_', ' ').slice(1);
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-500 ${
          isOpen && isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white rounded-l-[24px] shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-out ${
          isOpen && isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {loading ? (
          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-br from-white to-blue-50 border-[2px] border-black/20 rounded-[16px] p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-5 bg-slate-300 rounded w-32 animate-pulse"></div>
                </div>
                <div className="h-7 bg-slate-300 rounded-full w-20 animate-pulse"></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[16px] p-4">
              <div className="h-4 bg-slate-200 rounded w-40 mb-3 animate-pulse"></div>
              <div className="h-16 bg-slate-100 rounded-[12px] mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-12 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-32 bg-slate-100 rounded-[16px] animate-pulse"></div>
              <div className="h-32 bg-slate-100 rounded-[16px] animate-pulse"></div>
            </div>
          </div>
        ) : shipment ? (
          <>
            {/* Header - Blue like Track AWB page */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 flex items-center justify-between border-b-[2px] border-black/20 z-10">
              <div>
                <h2 className="text-white font-bold text-xl">Shipment Details</h2>
                <p className="text-white/90 text-sm mt-1">{shipment.tracking_number}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Current Status - Symmetrical */}
              <div className="bg-gradient-to-br from-white to-blue-50 border-[2px] border-black/20 rounded-[16px] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-xs font-medium mb-1">Current Status</p>
                    <p className="text-slate-900 font-bold text-base">{formatStatus(shipment.status)}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getStatusColor(shipment.status)}`}>
                    {formatStatus(shipment.status)}
                  </span>
                </div>
              </div>

              {/* Shipment Info with Route Visualization */}
              <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[16px] p-4">
                <h3 className="text-slate-900 font-bold text-sm mb-3">Shipment Information</h3>

                {/* Route Visualization */}
                <div className="mb-4 bg-white rounded-[12px] p-3 border border-black/10">
                  <div className="flex items-center gap-3">
                    {/* Origin */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <p className="text-slate-500 text-xs font-medium">Origin</p>
                      </div>
                      <p className="text-slate-900 font-bold text-xs">{shipment.origin}</p>
                    </div>

                    {/* Arrow Line */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full h-[2px] bg-gradient-to-r from-blue-500 to-emerald-500 relative">
                        <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="flex-1 text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <p className="text-slate-500 text-xs font-medium">Destination</p>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      </div>
                      <p className="text-slate-900 font-bold text-xs">{shipment.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Other Info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Flight Number</p>
                    <p className="text-slate-900 font-semibold">{shipment.flight_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Weight</p>
                    <p className="text-slate-900 font-semibold">{shipment.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Jenis Barang</p>
                    <p className="text-slate-900 font-semibold">{shipment.item_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Jenis Pengiriman</p>
                    <p className="text-slate-900 font-semibold">{shipment.service_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Tarif</p>
                    <p className="text-slate-900 font-semibold">
                      {shipment.tariff != null
                        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(shipment.tariff))
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sender & Recipient in One Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Sender Details - Compact */}
                <div className="bg-gradient-to-br from-white to-blue-50 border-[2px] border-black/20 rounded-[16px] p-3">
                  <h3 className="text-slate-900 font-bold text-xs mb-2 flex items-center gap-1.5">
                    <User size={14} className="text-blue-600" />
                    Sender
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <p className="text-slate-500 text-[10px]">Name</p>
                      <p className="text-slate-900 font-semibold text-xs">{shipment.sender}</p>
                    </div>
                    {shipment.sender_contact && (
                      <div>
                        <p className="text-slate-500 text-[10px]">Contact</p>
                        <p className="text-slate-900 font-semibold text-xs">{shipment.sender_contact}</p>
                      </div>
                    )}
                    {shipment.sender_address && (
                      <div>
                        <p className="text-slate-500 text-[10px]">Address</p>
                        <p className="text-slate-900 font-semibold text-xs line-clamp-2">{shipment.sender_address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipient Details - Compact */}
                <div className="bg-gradient-to-br from-white to-emerald-50 border-[2px] border-black/20 rounded-[16px] p-3">
                  <h3 className="text-slate-900 font-bold text-xs mb-2 flex items-center gap-1.5">
                    <MapPin size={14} className="text-emerald-600" />
                    Recipient
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <p className="text-slate-500 text-[10px]">Name</p>
                      <p className="text-slate-900 font-semibold text-xs">{shipment.recipient_name || 'N/A'}</p>
                    </div>
                    {shipment.recipient_contact && (
                      <div>
                        <p className="text-slate-500 text-[10px]">Contact</p>
                        <p className="text-slate-900 font-semibold text-xs">{shipment.recipient_contact}</p>
                      </div>
                    )}
                    {shipment.recipient_address && (
                      <div>
                        <p className="text-slate-500 text-[10px]">Address</p>
                        <p className="text-slate-900 font-semibold text-xs line-clamp-2">{shipment.recipient_address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {shipment.notes && (
                <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-amber-400 rounded-[16px] p-3">
                  <h3 className="text-slate-900 font-bold text-xs mb-2 flex items-center gap-1.5">
                    <FileText size={14} className="text-amber-600" />
                    Additional Notes
                  </h3>
                  <p className="text-slate-700 text-xs">{shipment.notes}</p>
                </div>
              )}
            </div>

            {/* View Full Tracking Button - Fixed at bottom */}
            <div className="p-6 pt-0">
              <button
                onClick={handleViewFullTracking}
                className="w-full py-2.5 bg-[#1e3a5f] text-white font-bold text-xs rounded-full hover:bg-[#2c5282] transition shadow-md flex items-center justify-center gap-2"
              >
                View Full Tracking Timeline
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-500">Shipment not found</p>
          </div>
        )}
      </div>
    </>
  );
}
