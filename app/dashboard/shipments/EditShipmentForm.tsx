'use client';

import { useState, useEffect } from 'react';
import { X, Package, User, MapPin } from 'lucide-react';
import { indonesianCities } from '@/lib/cities';
import Notification from '@/components/Notification';
import { isValidPhone, validateShipmentInput } from '@/lib/validation';

const RATES: Record<string, number> = { Regular: 5000, Express: 10000, Priority: 15000 };
const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

interface EditShipmentFormProps {
  shipment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditShipmentForm({ shipment, onClose, onSuccess }: EditShipmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [originSuggestions, setOriginSuggestions] = useState<typeof indonesianCities>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<typeof indonesianCities>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showDeliverConfirm, setShowDeliverConfirm] = useState(false);
  const isDelivered = shipment.status === 'delivered';
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
    item_type: shipment.item_type || '',
    service_type: shipment.service_type || 'Regular',
    flight_id: shipment.flight_id || '',
    status: shipment.status || 'booked',
    notes: shipment.notes || ''
  });

  // Tarif otomatis = tarif per kg (jenis pengiriman) × berat
  const tariff = (RATES[formData.service_type] || 0) * (parseFloat(formData.weight.toString()) || 0);

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

    // 2-step verification: kalau status mau diubah ke "delivered", tampilkan konfirmasi dulu
    if (formData.status === 'delivered' && shipment.status !== 'delivered') {
      setShowDeliverConfirm(true);
      return;
    }

    submitForm();
  };

  const submitForm = async () => {
    const errors: Record<string, string> = {};

    if (!formData.tracking_number.trim()) errors.tracking_number = 'Tracking number cannot be empty';
    if (!formData.weight && formData.weight !== 0) {
      errors.weight = 'Weight cannot be empty';
    } else {
      const w = parseFloat(formData.weight.toString());
      if (!Number.isFinite(w) || w <= 0) {
        errors.weight = 'Weight must be a number greater than 0';
      }
    }
    if (!formData.item_type.trim()) errors.item_type = 'Item type cannot be empty';
    if (!formData.sender.trim()) errors.sender = 'Sender name cannot be empty';
    if (!formData.sender_contact.trim()) {
      errors.sender_contact = 'Sender contact cannot be empty';
    } else if (!isValidPhone(formData.sender_contact)) {
      errors.sender_contact = 'Phone must be 10–13 digits (e.g., 081234567890 or +6281234567890)';
    }
    if (!formData.sender_address.trim()) errors.sender_address = 'Sender address cannot be empty';
    if (!formData.recipient_name.trim()) errors.recipient_name = 'Recipient name cannot be empty';
    if (!formData.recipient_contact.trim()) {
      errors.recipient_contact = 'Recipient contact cannot be empty';
    } else if (!isValidPhone(formData.recipient_contact)) {
      errors.recipient_contact = 'Phone must be 10–13 digits (e.g., 081234567890 or +6281234567890)';
    }
    if (!formData.recipient_address.trim()) errors.recipient_address = 'Recipient address cannot be empty';
    if (!formData.origin.trim()) errors.origin = 'Origin city cannot be empty';
    if (!formData.destination.trim()) errors.destination = 'Destination city cannot be empty';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const validation = validateShipmentInput(formData);
    if (!validation.ok) {
      setNotification({ type: 'error', message: validation.error });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shipments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id,
          ...validation.sanitized,
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: 'success',
          message: `Shipment ${data.shipment.tracking_number} updated successfully!`
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Failed to update shipment'
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

      {/* Peringatan jika shipment sudah selesai */}
      {isDelivered && (
        <div className="mb-4 p-4 bg-amber-50 border-[2px] border-amber-400 rounded-[12px]">
          <p className="text-amber-800 font-bold text-sm">🔒 Shipment Completed</p>
          <p className="text-amber-700 text-xs mt-1">This shipment has been delivered and can no longer be edited.</p>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className={`space-y-3${isDelivered ? ' pointer-events-none opacity-60' : ''}`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Tracking Number (AWB) *
            </label>
            <input
              type="text"
              value={formData.tracking_number}
              onChange={(e) => { setFormData({ ...formData, tracking_number: e.target.value }); if (fieldErrors.tracking_number) setFieldErrors(prev => ({ ...prev, tracking_number: '' })); }}
              placeholder="e.g., ALTUS001"
              className={`w-full bg-white border-[2px] rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition ${fieldErrors.tracking_number ? 'border-red-400' : 'border-black/20'}`}
            />
            {fieldErrors.tracking_number && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.tracking_number}</p>}
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Weight (kg) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.weight}
              onChange={(e) => { setFormData({ ...formData, weight: e.target.value }); if (fieldErrors.weight) setFieldErrors(prev => ({ ...prev, weight: '' })); }}
              placeholder="e.g., 25.5"
              className={`w-full bg-white border-[2px] rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition ${fieldErrors.weight ? 'border-red-400' : 'border-black/20'}`}
            />
            {fieldErrors.weight && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.weight}</p>}
          </div>
        </div>

        {/* Item type, Service type, Auto tariff */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-900 font-bold text-xs mb-2">Jenis Barang *</label>
            <input
              type="text"
              value={formData.item_type}
              onChange={(e) => { setFormData({ ...formData, item_type: e.target.value }); if (fieldErrors.item_type) setFieldErrors(prev => ({ ...prev, item_type: '' })); }}
              placeholder="cth: Electronics, Documents"
              className={`w-full bg-white border-[2px] rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition ${fieldErrors.item_type ? 'border-red-400' : 'border-black/20'}`}
            />
            {fieldErrors.item_type && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.item_type}</p>}
          </div>
          <div>
            <label className="block text-slate-900 font-bold text-xs mb-2">Jenis Pengiriman *</label>
            <select
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition"
            >
              <option value="Regular">Regular (Rp 5.000/kg)</option>
              <option value="Express">Express (Rp 10.000/kg)</option>
              <option value="Priority">Priority (Rp 15.000/kg)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-900 font-bold text-xs mb-2">Tarif (otomatis)</label>
            <input
              type="text"
              readOnly
              value={formatRupiah(tariff)}
              className="w-full bg-slate-100 border-[2px] border-slate-300 rounded-[12px] px-3 py-2 text-slate-700 font-bold text-xs outline-none cursor-not-allowed"
            />
            <p className="text-slate-500 text-[10px] mt-1">Tarif/kg × berat</p>
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
                value={formData.sender}
                onChange={(e) => { setFormData({ ...formData, sender: e.target.value }); if (fieldErrors.sender) setFieldErrors(prev => ({ ...prev, sender: '' })); }}
                placeholder="e.g., John Doe"
                className={`w-full bg-white border-[2px] rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-blue-500 transition ${fieldErrors.sender ? 'border-red-400' : 'border-blue-200'}`}
              />
              {fieldErrors.sender && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.sender}</p>}
            </div>

            <div>
              <label className="block text-slate-900 font-bold text-xs mb-2">
                Sender Contact *
              </label>
              <input
                type="text"
                value={formData.sender_contact}
                onChange={(e) => { setFormData({ ...formData, sender_contact: e.target.value }); if (fieldErrors.sender_contact) setFieldErrors(prev => ({ ...prev, sender_contact: '' })); }}
                placeholder="e.g., +62812345678"
                className={`w-full bg-white border-[2px] rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-blue-500 transition ${fieldErrors.sender_contact ? 'border-red-400' : 'border-blue-200'}`}
              />
              {fieldErrors.sender_contact && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.sender_contact}</p>}
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Sender Address *
            </label>
            <textarea
              value={formData.sender_address}
              onChange={(e) => { setFormData({ ...formData, sender_address: e.target.value }); if (fieldErrors.sender_address) setFieldErrors(prev => ({ ...prev, sender_address: '' })); }}
              placeholder="Full address..."
              rows={2}
              className={`w-full bg-white border-[2px] rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-blue-500 transition resize-none ${fieldErrors.sender_address ? 'border-red-400' : 'border-blue-200'}`}
            />
            {fieldErrors.sender_address && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.sender_address}</p>}
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
                value={formData.recipient_name}
                onChange={(e) => { setFormData({ ...formData, recipient_name: e.target.value }); if (fieldErrors.recipient_name) setFieldErrors(prev => ({ ...prev, recipient_name: '' })); }}
                placeholder="e.g., Jane Smith"
                className={`w-full bg-white border-[2px] rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition ${fieldErrors.recipient_name ? 'border-red-400' : 'border-emerald-200'}`}
              />
              {fieldErrors.recipient_name && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.recipient_name}</p>}
            </div>

            <div>
              <label className="block text-slate-900 font-bold text-xs mb-2">
                Recipient Contact *
              </label>
              <input
                type="text"
                value={formData.recipient_contact}
                onChange={(e) => { setFormData({ ...formData, recipient_contact: e.target.value }); if (fieldErrors.recipient_contact) setFieldErrors(prev => ({ ...prev, recipient_contact: '' })); }}
                placeholder="e.g., +62812345678"
                className={`w-full bg-white border-[2px] rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition ${fieldErrors.recipient_contact ? 'border-red-400' : 'border-emerald-200'}`}
              />
              {fieldErrors.recipient_contact && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.recipient_contact}</p>}
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Recipient Address *
            </label>
            <textarea
              value={formData.recipient_address}
              onChange={(e) => { setFormData({ ...formData, recipient_address: e.target.value }); if (fieldErrors.recipient_address) setFieldErrors(prev => ({ ...prev, recipient_address: '' })); }}
              placeholder="Full address..."
              rows={2}
              className={`w-full bg-white border-[2px] rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition resize-none ${fieldErrors.recipient_address ? 'border-red-400' : 'border-emerald-200'}`}
            />
            {fieldErrors.recipient_address && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.recipient_address}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-slate-900 font-bold text-xs mb-2">
              Origin City *
            </label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => { handleOriginChange(e.target.value); if (fieldErrors.origin) setFieldErrors(prev => ({ ...prev, origin: '' })); }}
              onFocus={() => formData.origin && setShowOriginDropdown(true)}
              onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
              placeholder="e.g., Jakarta or YIA"
              className={`w-full bg-white border-[2px] rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition ${fieldErrors.origin ? 'border-red-400' : 'border-black/20'}`}
            />
            {fieldErrors.origin && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.origin}</p>}
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
              value={formData.destination}
              onChange={(e) => { handleDestinationChange(e.target.value); if (fieldErrors.destination) setFieldErrors(prev => ({ ...prev, destination: '' })); }}
              onFocus={() => formData.destination && setShowDestinationDropdown(true)}
              onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
              placeholder="e.g., Surabaya or SUB"
              className={`w-full bg-white border-[2px] rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-emerald-500 transition ${fieldErrors.destination ? 'border-red-400' : 'border-black/20'}`}
            />
            {fieldErrors.destination && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.destination}</p>}
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
            className={`flex-1 px-4 py-2.5 bg-white border-[2px] border-black/20 text-slate-900 font-bold text-xs rounded-[12px] hover:bg-slate-50 transition${isDelivered ? ' pointer-events-auto' : ''}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || isDelivered}
            className="flex-1 px-4 py-2.5 bg-[#1e3a5f] text-white font-bold text-xs rounded-[12px] hover:bg-[#2c5282] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Shipment'}
          </button>
        </div>
      </form>

      {/* Warning banner saat shipment sudah delivered */}
      {isDelivered && (
        <div className="mt-4 p-4 bg-amber-50 border-[2px] border-amber-400 rounded-[12px]">
          <p className="text-amber-800 font-bold text-sm">🔒 Shipment Completed</p>
          <p className="text-amber-700 text-xs mt-1">This shipment has been delivered and can no longer be edited.</p>
        </div>
      )}

      {/* 2-step confirm modal untuk ubah status ke delivered */}
      {showDeliverConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-amber-300">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package size={28} className="text-amber-600" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">Complete Shipment?</h3>
              <p className="text-slate-600 text-sm mt-2">
                Are you sure you want to mark this shipment as <strong className="text-emerald-600">Delivered</strong>?
              </p>
              <p className="text-red-600 text-xs mt-2 font-bold">
                ⚠️ Once completed, this shipment can no longer be edited.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeliverConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 font-bold text-xs rounded-[12px] hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setShowDeliverConfirm(false); submitForm(); }}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-[12px] hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Yes, Complete Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
