import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// ============================================================================
// SEED STATISTIK — INSERT-only, AMAN untuk Neon.
// Hanya MENAMBAH baris shipment baru (tidak ada DROP/TRUNCATE/UPDATE data lama).
// Data existing tidak tersentuh sama sekali.
// Jalankan dengan: POST /api/dashboard/seed-stats  body: { "confirm": "SEED" }
// ============================================================================

const CITIES = [
  'Jakarta (CGK)', 'Surabaya (SUB)', 'Yogyakarta (YIA)', 'Denpasar (DPS)',
  'Medan (KNO)', 'Makassar (UPG)', 'Bandung (BDO)', 'Semarang (SRG)',
  'Palembang (PLM)', 'Balikpapan (BPN)', 'Manado (MDC)', 'Lombok (LOP)',
  'Batam (BTH)', 'Pekanbaru (PKU)', 'Padang (PDG)', 'Malang (MLG)',
];

const SENDERS = ['Budi Santoso', 'Siti Rahayu', 'Andi Wijaya', 'Dewi Lestari', 'Rudi Hartono', 'Maya Putri', 'Agus Salim', 'Rina Melati', 'Joko Widodo', 'Sri Mulyani', 'Bambang Pamungkas', 'Citra Kirana'];
const RECIPIENTS = ['Eko Prasetyo', 'Lina Marlina', 'Hendra Gunawan', 'Wati Susanti', 'Faisal Rahman', 'Nia Ramadhani', 'Doni Saputra', 'Tari Anggraini', 'Yusuf Maulana', 'Indah Permata', 'Reza Pratama', 'Fitri Handayani'];
const ITEMS = ['Electronics', 'Documents', 'Apparel', 'Spare Parts', 'Food Products', 'Medical Supplies', 'Cosmetics', 'Books', 'Furniture Parts', 'Automotive'];
const SERVICES = ['Regular', 'Express', 'Priority'];
const RATES: Record<string, number> = { Regular: 5000, Express: 10000, Priority: 15000 };
const STATUSES = ['booked', 'received', 'in_transit', 'arrived', 'delivered'];

// Pseudo-random deterministik biar hasilnya konsisten (tanpa Math.random)
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body?.confirm !== 'SEED') {
      return NextResponse.json(
        { error: 'Konfirmasi diperlukan. Kirim body { "confirm": "SEED" } untuk menjalankan seed.' },
        { status: 400 }
      );
    }

    const rng = makeRng(20260616);

    // Cari nomor AWB terakhir biar lanjut natural (AWB-EP-xxxxx)
    const last = await sql`
      SELECT tracking_number FROM shipments
      WHERE tracking_number LIKE 'AWB-EP-%'
      ORDER BY tracking_number DESC LIMIT 1;
    `;
    let nextNum = 24200;
    if (last.rows.length > 0) {
      const m = last.rows[0].tracking_number.match(/AWB-EP-(\d+)/);
      if (m) nextNum = parseInt(m[1]) + 1;
    }

    // Ambil flight yang ada untuk di-assign (opsional)
    const flightsRes = await sql`SELECT id, departure_city, arrival_city FROM flights LIMIT 50;`;
    const flights = flightsRes.rows;

    const COUNT = 72;
    let inserted = 0;

    for (let i = 0; i < COUNT; i++) {
      const tracking = `AWB-EP-${(nextNum + i).toString().padStart(5, '0')}`;

      // Sebar lintas waktu: ~40% di 7 hari terakhir (biar Today/7d keisi),
      // sisanya tersebar sampai ~3 tahun ke belakang (biar Month & Year keisi).
      let daysAgo: number;
      const r = rng();
      if (r < 0.4) daysAgo = Math.floor(rng() * 7);          // minggu ini
      else if (r < 0.75) daysAgo = 7 + Math.floor(rng() * 358);  // dalam ~1 tahun
      else daysAgo = 365 + Math.floor(rng() * 730);          // 1-3 tahun lalu
      const hour = 6 + Math.floor(rng() * 14);
      const minute = Math.floor(rng() * 60);

      let origin = CITIES[Math.floor(rng() * CITIES.length)];
      let destination = CITIES[Math.floor(rng() * CITIES.length)];
      while (destination === origin) destination = CITIES[Math.floor(rng() * CITIES.length)];

      const service = SERVICES[Math.floor(rng() * SERVICES.length)];
      const weight = Math.round((5 + rng() * 295) * 10) / 10; // 5 - 300 kg
      const tariff = RATES[service] * weight;

      // Status: shipment lama cenderung delivered, yang baru masih di awal
      let status: string;
      if (daysAgo > 14) status = rng() < 0.85 ? 'delivered' : 'arrived';
      else if (daysAgo > 5) status = STATUSES[2 + Math.floor(rng() * 3)];
      else status = STATUSES[Math.floor(rng() * 4)];

      const sender = SENDERS[Math.floor(rng() * SENDERS.length)];
      const recipient = RECIPIENTS[Math.floor(rng() * RECIPIENTS.length)];
      const item = ITEMS[Math.floor(rng() * ITEMS.length)];
      const senderPhone = `08${Math.floor(1000000000 + rng() * 8999999999)}`.slice(0, 12);
      const recipientPhone = `08${Math.floor(1000000000 + rng() * 8999999999)}`.slice(0, 12);

      // Assign flight kalau ada yang rutenya cocok
      let flightId: number | null = null;
      const oCode = origin.match(/\(([A-Z]{3})\)/)?.[1];
      const dCode = destination.match(/\(([A-Z]{3})\)/)?.[1];
      const match = flights.find(
        (f) => oCode && dCode && f.departure_city?.includes(oCode) && f.arrival_city?.includes(dCode)
      );
      if (match) flightId = match.id;

      await sql.query(
        `INSERT INTO shipments
          (tracking_number, flight_id, sender, sender_contact, sender_address,
           recipient_name, recipient_contact, recipient_address, origin, destination,
           weight, item_type, service_type, tariff, status, notes, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
           NOW() - ($17::int * INTERVAL '1 day') - ($18::int * INTERVAL '1 hour') - ($19::int * INTERVAL '1 minute'),
           NOW() - ($17::int * INTERVAL '1 day'))`,
        [
          tracking, flightId, sender, senderPhone, `Jl. Merdeka No.${1 + Math.floor(rng() * 200)}, ${origin.split(' (')[0]}`,
          recipient, recipientPhone, `Jl. Sudirman No.${1 + Math.floor(rng() * 200)}, ${destination.split(' (')[0]}`,
          origin, destination, weight, item, service, tariff, status, 'Reguler',
          daysAgo, hour, minute,
        ]
      );
      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan ${inserted} shipment dummy (INSERT-only, data lama aman).`,
      inserted,
      startAwb: `AWB-EP-${nextNum.toString().padStart(5, '0')}`,
    });
  } catch (error: any) {
    console.error('Seed stats error:', error);
    return NextResponse.json({ error: error?.message || 'Seed gagal' }, { status: 500 });
  }
}
