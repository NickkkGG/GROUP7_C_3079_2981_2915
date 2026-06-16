import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// READ-ONLY: hanya SELECT agregasi untuk statistik dashboard. Tidak mengubah tabel/data.
// Query param: ?days=7|30|90  atau  ?start=YYYY-MM-DD&end=YYYY-MM-DD (custom range)
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const start = sp.get('start'); // YYYY-MM-DD
    const end = sp.get('end');     // YYYY-MM-DD
    const days = parseInt(sp.get('days') || '7');

    // Tentukan rentang waktu
    let rangeCondition: string;
    const params: any[] = [];
    if (start && end) {
      rangeCondition = `created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')`;
      params.push(start, end);
    } else {
      const safeDays = [7, 30, 90].includes(days) ? days : 7;
      rangeCondition = `created_at >= CURRENT_DATE - INTERVAL '${safeDays - 1} days'`;
    }

    // 1. Shipments per day (dalam range)
    const perDay = await sql.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS total
       FROM shipments WHERE ${rangeCondition}
       GROUP BY DATE(created_at) ORDER BY day ASC;`,
      params
    );

    // 2. Revenue per day (dalam range)
    const revenuePerDay = await sql.query(
      `SELECT DATE(created_at) AS day, COALESCE(SUM(tariff), 0) AS revenue
       FROM shipments WHERE ${rangeCondition}
       GROUP BY DATE(created_at) ORDER BY day ASC;`,
      params
    );

    // 3. Service type breakdown (dalam range)
    const serviceType = await sql.query(
      `SELECT COALESCE(service_type, 'Regular') AS service_type, COUNT(*) AS total
       FROM shipments WHERE ${rangeCondition}
       GROUP BY COALESCE(service_type, 'Regular');`,
      params
    );

    // 4. Shipments by status (dalam range)
    const byStatus = await sql.query(
      `SELECT status, COUNT(*) AS total
       FROM shipments WHERE ${rangeCondition}
       GROUP BY status;`,
      params
    );

    // 5. Top routes (dalam range)
    const topRoutes = await sql.query(
      `SELECT origin, destination, COUNT(*) AS total
       FROM shipments WHERE ${rangeCondition}
       GROUP BY origin, destination ORDER BY total DESC LIMIT 5;`,
      params
    );

    // 6. KPI summary (dalam range)
    const summary = await sql.query(
      `SELECT
         COUNT(*) AS total_shipments,
         COALESCE(SUM(tariff), 0) AS total_revenue,
         COALESCE(AVG(weight), 0) AS avg_weight,
         COALESCE(SUM(weight), 0) AS total_weight
       FROM shipments WHERE ${rangeCondition};`,
      params
    );

    const s = summary.rows[0] || {};

    return NextResponse.json({
      shipmentsPerDay: perDay.rows.map((r) => ({ day: r.day, total: parseInt(r.total) })),
      revenuePerDay: revenuePerDay.rows.map((r) => ({ day: r.day, revenue: parseFloat(r.revenue) })),
      serviceType: serviceType.rows.map((r) => ({ type: r.service_type, total: parseInt(r.total) })),
      byStatus: byStatus.rows.map((r) => ({ status: r.status, total: parseInt(r.total) })),
      topRoutes: topRoutes.rows.map((r) => ({ origin: r.origin, destination: r.destination, total: parseInt(r.total) })),
      summary: {
        totalShipments: parseInt(s.total_shipments || '0'),
        totalRevenue: parseFloat(s.total_revenue || '0'),
        avgWeight: parseFloat(s.avg_weight || '0'),
        totalWeight: parseFloat(s.total_weight || '0'),
      },
    });
  } catch (error) {
    console.error('Error fetching chart stats:', error);
    return NextResponse.json({
      shipmentsPerDay: [], revenuePerDay: [], serviceType: [], byStatus: [], topRoutes: [],
      summary: { totalShipments: 0, totalRevenue: 0, avgWeight: 0, totalWeight: 0 },
    });
  }
}
