'use client';

import { useState, useEffect } from 'react';
import { X, Package, User, MapPin } from 'lucide-react';
import { indonesianCities } from '@/lib/cities';
import Notification from '@/components/Notification';

interface EditShipmentFormProps {
  shipment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditShipmentForm({ shipment, onClose, onSuccess }: EditShipmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<typeof indonesianCities>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<typeof indonesianCities>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [formData, setFormData] = useState({
    id: shipment.id,
    tracking_number: shipment.tracking_number || '',
    sender: shipment.sender || '',
    sender_contact: shipment.sender_contact || '',
    sender_address: shipment.sender_address || '',
    receiver: shipment.receiver || '',
    recipient_name: shipment.recipient_name || '',
    recipient_contact: shipment.recipient_contact || '',
    recipient_address: shipment.recipient_address || '',
    origin: shipment.origin || '',
    destination: shipment.destination || '',
    weight: shipment.weight || '',
    flight_id: shipment.flight_id || '',
    status: shipment.status || 'booked',
    notes: shipment.notes || ''
  });

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      const response = await fetch('/api/flights?limit=100');
      const data = await response.json();
      setFlights(data.flights || []);
    } catch (error) {
      console.error('Error loading flights:', error);
    }
  };

  // Filter flights based on selected origin and destination
  const getAvailableFlights = () => {
    if (!formData.origin || !formData.destination) {
      return [];
    }

    // Extract airport codes from the selected cities (e.g., "Medan, Sumatera Utara, Indonesia (KNO)" -> "KNO")
    const extractCode = (cityString: string) => {
      const match = cityString.match(/\(([A-Z]{3})\)/);
      return match ? match[1] : '';
    };

    const originCode = extractCode(formData.origin);
    const destCode = extractCode(formData.destination);

    return flights.filter(flight => {
      // Check if flight departure/arrival cities contain the airport codes
      const departureMatch = originCode && flight.departure_city?.includes(originCode);
      const arrivalMatch = destCode && flight.arrival_city?.includes(destCode);

      return departureMatch && arrivalMatch;
    });
  };

  const availableFlights = getAvailableFlights();

  const handleOriginChange = (value: string) => {
    setFormData({ ...formData, origin: value });
    if (value.trim()) {
      const filtered = indonesianCities.filter(city =>
        city.name.toLowerCase().includes(value.toLowerCase()) ||
        city.code.toLowerCase().includes(value.toLowerCase())
      );
      setOriginSuggestions(filtered);
      setShowOriginDropdown(true);
    } else {
      setShowOriginDropdown(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    setFormData({ ...formData, destination: value });
    if (value.trim()) {
      const filtered = indonesianCities.filter(city =>
        city.name.toLowerCase().includes(value.toLowerCase()) ||
        city.code.toLowerCase().includes(value.toLowerCase())
      );
      setDestinationSuggestions(filtered);
      setShowDestinationDropdown(true);
    } else {
      setShowDestinationDropdown(false);
    }
  };

  const selectOrigin = (city: typeof indonesianCities[0]) => {
    setFormData({ ...formData, origin: city.fullName });
    setShowOriginDropdown(false);
  };

  const selectDestination = (city: typeof indonesianCities[0]) => {
    setFormData({ ...formData, destination: city.fullName });
    setShowDestinationDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/shipments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          weight: parseFloat(formData.weight.toString()),
          flight_id: formData.flight_id ? parseInt(formData.flight_id.toString()) : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNotification({
          type: 'success',
          message: `Shipment ${data.shipment.tracking_number} updated successfully!`
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        const error = await response.json();
        setNotification({
          type: 'error',
          message: error.error || 'Failed to update shipment'
        });
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update shipment. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[16px] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
          <Package size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-slate-900 font-bold text-lg">Edit Shipment</h2>
          <p className="text-slate-600 text-xs">Update shipment details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Tracking Number (AWB) *
            </label>
            <input
              type="text"
              required
              value={formData.tracking_number}
              onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
              placeholder="e.g., ALTUS001"
              className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Weight (kg) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="e.g., 25.5"
              className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Sender Information */}
        <div className="bg-blue-100 border-2 border-blue-300 rounded-[12px] p-4">
          <h3 className="text-blue-900 font-bold text-sm mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            Sender Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-900 font-bold text-xs mb-2">
                Sender Name *
              </label>
              <input
                type="text"
                required
                value={formData.sender}
                onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                placeholder="e.g., John Doe"
                className="w-full bg-white border-[2px] border-blue-200 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-900 font-bold text-xs mb-2">
                Sender Contact
              </label>
              <input
                type="text"
                value={formData.sender_contact}
                onChange={(e) => setFormData({ ...formData, sender_contact: e.target.value })}
                placeholder="e.g., +62812345678"
                className="w-full bg-white border-[2px] border-blue-200 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Sender Address
            </label>
            <textarea
              value={formData.sender_address}
              onChange={(e) => setFormData({ ...formData, sender_address: e.target.value })}
              placeholder="Full address..."
              rows={2}
              className="w-full bg-white border-[2px] border-blue-200 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-blue-500 transition resize-none"
            />
          </div>
        </div>

        {/* Recipient Information */}
        <div className="bg-emerald-100 border-2 border-emerald-300 rounded-[12px] p-4">
          <h3 className="text-emerald-900 font-bold text-sm mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            Recipient Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-900 font-bold text-xs mb-2">
                Recipient Name *
              </label>
              <input
                type="text"
                required
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                placeholder="e.g., Jane Smith"
                className="w-full bg-white border-[2px] border-emerald-200 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-900 font-bold text-xs mb-2">
                Recipient Contact
              </label>
              <input
                type="text"
                value={formData.recipient_contact}
                onChange={(e) => setFormData({ ...formData, recipient_contact: e.target.value })}
                placeholder="e.g., +62812345678"
                className="w-full bg-white border-[2px] border-emerald-200 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Recipient Address
            </label>
            <textarea
              value={formData.recipient_address}
              onChange={(e) => setFormData({ ...formData, recipient_address: e.target.value })}
              placeholder="Full address..."
              rows={2}
              className="w-full bg-white border-[2px] border-emerald-200 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Origin City *
            </label>
            <input
              type="text"
              required
              value={formData.origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              onFocus={() => formData.origin && setShowOriginDropdown(true)}
              onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
              placeholder="e.g., Jakarta or YIA"
              className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition"
            />
            {showOriginDropdown && originSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border-[2px] border-black/20 rounded-[12px] shadow-lg max-h-48 overflow-y-auto">
                {originSuggestions.map((city, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOrigin(city)}
                    className="w-full text-left px-3 py-2 text-slate-900 text-xs hover:bg-emerald-50 transition border-b border-slate-200 last:border-b-0"
                  >
                    <span className="font-bold">{city.name}</span> <span className="text-slate-600">({city.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Destination City *
            </label>
            <input
              type="text"
              required
              value={formData.destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              onFocus={() => formData.destination && setShowDestinationDropdown(true)}
              onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
              placeholder="e.g., Surabaya or SUB"
              className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition"
            />
            {showDestinationDropdown && destinationSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border-[2px] border-black/20 rounded-[12px] shadow-lg max-h-48 overflow-y-auto">
                {destinationSuggestions.map((city, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectDestination(city)}
                    className="w-full text-left px-3 py-2 text-slate-900 text-xs hover:bg-emerald-50 transition border-b border-slate-200 last:border-b-0"
                  >
                    <span className="font-bold">{city.name}</span> <span className="text-slate-600">({city.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Assign to Flight
            </label>
            <select
              value={formData.flight_id}
              onChange={(e) => setFormData({ ...formData, flight_id: e.target.value })}
              disabled={!formData.origin || !formData.destination}
              className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!formData.origin || !formData.destination
                  ? 'Select origin and destination first'
                  : availableFlights.length === 0
                    ? 'No flights available for this route'
                    : 'Select a flight (optional)'}
              </option>
              {availableFlights.map((flight) => (
                <option key={flight.id} value={flight.id}>
                  {flight.flight_number} - {flight.departure_city} → {flight.arrival_city} ({new Date(flight.departure_time).toLocaleDateString()})
                </option>
              ))}
            </select>
            {formData.origin && formData.destination && availableFlights.length === 0 && (
              <p className="text-orange-600 text-[10px] mt-1">⚠ No flights found for this route</p>
            )}
            {(!formData.origin || !formData.destination) && (
              <p className="text-slate-500 text-[10px] mt-1">Select origin and destination to see available flights</p>
            )}
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition"
            >
              <option value="booked">Booked</option>
              <option value="received">Received</option>
              <option value="in_transit">In Transit</option>
              <option value="arrived">Arrived</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-900 font-bold text-xs mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special instructions or notes..."
            rows={2}
            className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border-[2px] border-black/20 text-slate-900 font-bold text-xs rounded-[12px] hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-[#1e3a5f] text-white font-bold text-xs rounded-[12px] hover:bg-[#2c5282] transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Shipment'}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
