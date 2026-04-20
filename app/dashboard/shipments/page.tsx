'use client';

import { useAuth } from '@/context/AuthContext';
import { mockShipments } from '@/lib/mockData';
import { Package, Plus, Download } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';

export default function ShipmentsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role === 'guest') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role === 'guest') {
    return null;
  }

  return (
    <div className="h-full flex flex-col animate-fade-in bg-[#ffe9d4]">
      <TopNavbar
        title="Shipments Management"
        subtitle="Monitor all active air cargo shipments"
      />
      <div className="p-4 flex flex-col overflow-y-auto flex-1">
        {/* Content Box */}
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[24px] backdrop-blur-md overflow-hidden flex flex-col flex-1">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 flex items-center justify-between border-b-[2px] border-black/20">
          <div>
            <h1 className="text-slate-900 font-bold text-lg">Shipments Management</h1>
            <p className="text-slate-600 text-xs mt-1">Monitor all active air cargo shipments</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border-[2px] border-black/20 text-slate-900 font-bold text-xs rounded-full hover:bg-cyan-50 transition">
              <Download size={14} />
              Export
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white font-bold text-xs rounded-full hover:bg-emerald-600 transition">
              <Plus size={14} />
              New
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white px-6 py-3 border-b-[2px] border-black/20">
          <p className="text-slate-900 font-medium text-xs mb-2.5">
            Search and filter shipments
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-white border-[2px] border-black/20 rounded-[16px] px-3.5 py-2 flex items-center gap-2">
              <span className="text-base">🔍</span>
              <input
                type="text"
                placeholder="Search AWB, sender or flight..."
                className="flex-1 bg-transparent text-slate-900 text-xs outline-none placeholder-slate-500 placeholder-opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3 p-5 bg-white overflow-y-auto flex-1">
          {/* Shipments Table Box */}
          <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[16px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-[2px] border-black/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                    <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">AWB</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Sender</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Destination</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Flight</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Status</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Weight</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockShipments.map((shipment, idx) => (
                    <tr key={idx} className="border-b-[1px] border-black/20 hover:bg-cyan-50 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 text-xs">{shipment.awb}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-xs">{shipment.sender}</td>
                      <td className="py-3 px-4 text-slate-700 text-xs">{shipment.destination}</td>
                      <td className="py-3 px-4 text-slate-700 text-xs">{shipment.flight}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-block border ${
                            shipment.status === 'on-time'
                              ? 'bg-green-500/10 text-green-700 border-green-400'
                              : shipment.status === 'delayed'
                                ? 'bg-orange-500/10 text-orange-700 border-orange-400'
                                : 'bg-cyan-500/10 text-cyan-700 border-cyan-400'
                          }`}
                        >
                          {shipment.status === 'on-time' ? 'On Time' : shipment.status === 'delayed' ? 'Delayed' : 'Departed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-xs">{shipment.weight}</td>
                      <td className="py-3 px-4">
                        <button className="text-cyan-600 hover:text-cyan-700 font-bold text-xs">View →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
