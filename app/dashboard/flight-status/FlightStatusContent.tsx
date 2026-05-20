'use client';

import { useAuth } from '@/context/AuthContext';
import { Plane, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import TopNavbar from '@/components/TopNavbar';
import FlightCargoManifest from './FlightCargoManifest';

export default function FlightStatusContent() {
  const { user, loginAsGuest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [manifestOpen, setManifestOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState('');
  const limit = 10;

  useEffect(() => {
    if (!user) {
      loginAsGuest();
    }
  }, [user, loginAsGuest]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadFlights();
  }, [currentPage, debouncedSearch]);

  const loadFlights = async () => {
    try {
      // Don't show loading if we already have data (optimistic UI)
      if (flights.length === 0) {
        setLoading(true);
      }

      const response = await fetch(`/api/flights?search=${debouncedSearch}&page=${currentPage}&limit=${limit}`);
      const data = await response.json();

      setFlights(data.flights || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || 0);
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleViewManifest = (flightNumber: string) => {
    setSelectedFlight(flightNumber);
    setManifestOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-500/10 text-green-700 border border-green-400';
      case 'delayed':
        return 'bg-orange-500/10 text-orange-700 border border-orange-400';
      default:
        return 'bg-cyan-500/10 text-cyan-700 border-[3px] border-black/50';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#ffe9d4] animate-fade-in">
      <TopNavbar
        title="Flight Status"
        subtitle="Monitor live flight schedules and status updates"
      />
      <div className="p-4 flex flex-col overflow-y-auto flex-1">
        {/* Content Box */}
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[24px] backdrop-blur-md overflow-hidden flex flex-col flex-1">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 flex items-center justify-between border-b-[2px] border-black/20">
          <div>
            <h1 className="text-slate-900 font-bold text-lg">Flight Status</h1>
            <p className="text-slate-600 text-xs mt-1">Monitor live flight schedules and status</p>
          </div>
          <div className="flex items-center gap-2 bg-white border-[1px] border-black/20 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-[#31ff38] rounded-full animate-pulse" />
            <span className="text-[#16ba1c] font-semibold text-xs">LIVE UPDATE</span>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white px-6 py-5 border-b-[2px] border-black/20">
          <form onSubmit={handleSearch} className="space-y-2.5">
            <p className="text-slate-900 font-medium text-xs">
              Search for flight information to view status and details.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-white border-[2px] border-black/20 rounded-[16px] px-3.5 py-2 flex items-center gap-2">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search flight number, city, or airline..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-slate-900 text-xs outline-none placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:bg-emerald-600 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Content Section */}
        <div className="space-y-3 p-5 bg-white overflow-y-auto flex-1">
          {/* Flights Table Box */}
          <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[16px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-[2px] border-black/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Flight</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Route</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Scheduled</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Capacity</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Loading state - gray placeholders
                    [...Array(6)].map((_, idx) => (
                      <tr key={idx} className="border-b-[1px] border-black/20">
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-300 rounded"></div>
                            <div className="h-4 bg-slate-300 rounded w-20"></div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 bg-slate-200 rounded w-32"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-3 bg-slate-200 rounded w-24"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-6 bg-slate-300 rounded-full w-16"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-200 rounded-full"></div>
                            <div className="h-3 bg-slate-200 rounded w-8"></div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 bg-slate-300 rounded w-16"></div>
                        </td>
                      </tr>
                    ))
                  ) : flights.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                        No flights found.
                      </td>
                    </tr>
                  ) : (
                    flights.map((flight, idx) => (
                      <tr key={idx} className="border-b-[1px] border-black/20 hover:bg-cyan-50 transition">
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-2">
                            <Plane size={16} className="text-cyan-600" />
                            <span className="font-bold text-slate-900">{flight.flight_number}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-900">{flight.departure_city} → {flight.arrival_city}</td>
                        <td className="py-3 px-4 text-slate-900 text-xs">
                          {new Date(flight.departure_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(flight.status)}`}>
                            {flight.status === 'on-time' ? 'On Time' : flight.status === 'delayed' ? 'Delayed' : flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden border-[2px] border-black/20">
                              <div
                                className="h-full bg-emerald-500 transition-all"
                                style={{ width: `${Math.floor(Math.random() * 40 + 60)}%` }}
                              />
                            </div>
                            <span className="text-slate-900 text-xs whitespace-nowrap">{Math.floor(Math.random() * 40 + 60)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleViewManifest(flight.flight_number)}
                            className="text-cyan-600 hover:text-cyan-700 font-bold text-xs"
                          >
                            Details →
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
          {!loading && flights.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-xs text-slate-600">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} flights
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
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
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
        </div>
        </div>
      </div>

      {/* Flight Cargo Manifest Modal */}
      <FlightCargoManifest
        isOpen={manifestOpen}
        onClose={() => setManifestOpen(false)}
        flightNumber={selectedFlight}
      />
    </div>
  );
}
