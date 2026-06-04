import { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import { DashboardLoadingSkeleton } from '@/components/LoadingSkeleton';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard - ALTUS',
};

export default function Page() {
  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}