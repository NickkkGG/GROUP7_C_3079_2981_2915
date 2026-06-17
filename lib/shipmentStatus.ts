// Kelas badge warna per status shipment (single source of truth).
// Dipakai di tabel shipments & detail drawer agar warna konsisten.
const STATUS_BADGE: Record<string, string> = {
  booked: 'bg-blue-100 text-blue-700 border-blue-400',
  received: 'bg-purple-100 text-purple-700 border-purple-400',
  in_transit: 'bg-orange-100 text-orange-700 border-orange-400',
  arrived: 'bg-cyan-100 text-cyan-700 border-cyan-400',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-400',
  cancelled: 'bg-red-100 text-red-700 border-red-400',
};

export function getStatusBadgeClass(status: string): string {
  return STATUS_BADGE[status] ?? 'bg-emerald-100 text-emerald-700 border-emerald-400';
}

// Format status untuk tampilan: 'in_transit' -> 'In transit'
export function formatStatusLabel(status: string): string {
  if (!status) return '';
  const spaced = status.replace('_', ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
