import FlightStatusContent from './FlightStatusContent';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Flight Status - ALTUS',
};

export default function Page() {
  return <FlightStatusContent />;
}
