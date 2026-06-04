import ShipmentsContent from './ShipmentsContent';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shipments - ALTUS',
};

export default function Page() {
  return <ShipmentsContent />;
}
