import { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import { DashboardLoadingSkeleton } from '@/components/LoadingSkeleton';

export default function Page() {
  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}