'use client';

import { X, Plane, MapPin, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface FlightCargoManifestProps {
  isOpen: boolean;
  onClose: () => void;
  flightNumber: string;
}

export default function FlightCargoManifest({ isOpen, onClose, flightNumber }: FlightCargoManifestProps) {
  const [flight, setFlight] = useState<any>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && flightNumber) {
      setIsAnimating(true);
      loadManifest();
    } else if (!isOpen && isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setFlight(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, flightNumber]);

  const loadManifest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/flights/${flightNumber}/manifest`);
      const data = await response.json();

      if (data.flight) {
        setFlight(data.flight);
        setShipments(data.shipments || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading manifest:', error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const totalWeight = shipments.reduce((sum, s) => sum + parseFloat(s.weight || 0), 0);

  if (!isOpen) return null;

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
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white rounded-l-[24px] shadow-2xl z-50 overflow-y-auto transition-transform duration-500 ease-out ${
          isOpen && isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
          {loading ? (
            <div className="p-8">
              <div className="h-8 bg-slate-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="h-6 bg-slate-200 rounded w-32 mb-8 animate-pulse"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-[16px] animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : flight ? (
            <div className="p-6 space-y-5">
              {/* Header with Plane Image */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src="/images/pesawat_flight_detail.png"
                    alt="Aircraft"
                    width={120}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-slate-900 font-bold text-xl mb-1">Cargo Manifest</h2>
                  <p className="text-slate-600 text-sm">
                    Flight {flight.flight_number} | {flight.departure_city} → {flight.arrival_city}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Scheduled: {new Date(flight.departure_time).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Route Section */}
              <div className="bg-gradient-to-br from-white to-blue-50 border-[2px] border-black/20 rounded-[16px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-900 font-bold text-sm">Route</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                      On the Way
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      12h 44m
                    </span>
                  </div>
                </div>

                <p className="text-slate-900 font-bold text-base mb-3">
                  {flight.departure_city.split(' ')[0]} → {flight.arrival_city}
                </p>

                <div className="flex items-center justify-between">
                  {/* Origin */}
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-slate-900 font-semibold text-xs">Origin</p>
                      <p className="text-slate-600 text-xs">{flight.departure_city}</p>
                    </div>
                  </div>

                  {/* Plane Icon */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-[100px] border-t-2 border-dashed border-blue-300 relative">
                      <Plane size={20} className="text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white" />
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-blue-500 mt-0.5" />
                    <div className="text-right">
                      <p className="text-slate-900 font-semibold text-xs">Destination</p>
                      <p className="text-slate-600 text-xs">{flight.arrival_city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipments Table */}
              <div className="bg-white border-[2px] border-black/20 rounded-[16px] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-[2px] border-black/20 bg-slate-50">
                      <th className="text-left py-2 px-3 text-slate-900 font-bold">AWB NUMBER</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold">SENDER</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold">WEIGHT</th>
                      <th className="text-left py-2 px-3 text-slate-900 font-bold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                          No shipments loaded
                        </td>
                      </tr>
                    ) : (
                      shipments.map((shipment, idx) => (
                        <tr key={idx} className="border-b border-black/10 hover:bg-blue-50 transition">
                          <td className="py-2 px-3">
                            <span className="text-blue-600 font-semibold">{shipment.tracking_number}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-700">{shipment.sender}</td>
                          <td className="py-2 px-3 text-slate-700">{shipment.weight} kg</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              Loaded
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-[2px] border-black/20 rounded-[16px] p-4 flex items-center justify-around">
                <div className="flex items-center gap-3">
                  <Package size={32} className="text-slate-600" />
                  <div>
                    <p className="text-slate-600 text-xs font-medium">Total Shipments</p>
                    <p className="text-slate-900 font-bold text-xl">{shipments.length}</p>
                  </div>
                </div>

                <div className="w-[2px] h-12 bg-slate-300"></div>

                <div className="flex items-center gap-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-slate-600">
                    <path d="M9 6L9 18M15 6L15 18M4 9L4 15C4 16.1046 4.89543 17 6 17L18 17C19.1046 17 20 16.1046 20 15L20 9C20 7.89543 19.1046 7 18 7L6 7C4.89543 7 4 7.89543 4 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <p className="text-slate-600 text-xs font-medium">Total Weight</p>
                    <p className="text-slate-900 font-bold text-xl">{totalWeight.toFixed(0)} kg</p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-full py-3 bg-blue-600 text-white font-bold text-sm rounded-full hover:bg-blue-700 transition shadow-md"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-500">Flight not found</p>
            </div>
          )}
        </div>
    </>
  );
}
