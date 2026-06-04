import { Suspense } from 'react';
import SettingsContent from './SettingsContent';
import { SettingsLoadingSkeleton } from '@/components/LoadingSkeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings - ALTUS',
};

export default function Page() {
  return (
    <Suspense fallback={<SettingsLoadingSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
