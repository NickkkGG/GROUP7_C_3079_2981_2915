import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Get all tracking numbers with AWB-EP format
    const result = await sql.query(
      `SELECT tracking_number FROM shipments
       WHERE tracking_number LIKE 'AWB-EP-%'
       ORDER BY tracking_number DESC`
    );

    let nextNumber = 1;

    if (result.rows.length > 0) {
      // Extract all existing numbers
      const existingNumbers = result.rows
        .map(row => {
          const match = row.tracking_number.match(/AWB-EP-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0)
        .sort((a, b) => b - a);

      // Find the first gap or use max + 1
      nextNumber = existingNumbers[0] + 1;

      // Check for gaps in sequence
      for (let i = 0; i < existingNumbers.length - 1; i++) {
        if (existingNumbers[i] - existingNumbers[i + 1] > 1) {
          nextNumber = existingNumbers[i + 1] + 1;
          break;
        }
      }
    }

    // Keep generating until we find a unique number
    let nextTracking = `AWB-EP-${nextNumber.toString().padStart(5, '0')}`;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const checkExisting = await sql.query(
        'SELECT id FROM shipments WHERE tracking_number = $1',
        [nextTracking]
      );

      if (checkExisting.rows.length === 0) {
        // Found a unique number
        break;
      }

      // Try next number
      nextNumber++;
      nextTracking = `AWB-EP-${nextNumber.toString().padStart(5, '0')}`;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({ error: 'Could not generate unique tracking number' }, { status: 500 });
    }

    return NextResponse.json({
      tracking_number: nextTracking
    });
  } catch (error) {
    console.error('Error generating tracking number:', error);
    return NextResponse.json({ error: 'Failed to generate tracking number' }, { status: 500 });
  }
}
