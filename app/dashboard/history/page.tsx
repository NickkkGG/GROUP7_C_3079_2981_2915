import HistoryContent from './HistoryContent';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My History - ALTUS',
};

export default function Page() {
  return <HistoryContent />;
}
