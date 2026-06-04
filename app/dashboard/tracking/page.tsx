import TrackingContent from './TrackingContent';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tracking - ALTUS',
};

export default function Page() {
  return <TrackingContent />;
}
