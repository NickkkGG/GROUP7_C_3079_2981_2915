// Tarif per kg berdasarkan jenis pengiriman (single source of truth)
export const RATES: Record<string, number> = { Regular: 5000, Express: 10000, Priority: 15000 };

export const computeTariff = (serviceType: string, weight: number) =>
  (RATES[serviceType] ?? RATES.Regular) * weight;
