import { Suspense } from 'react';
import SettingsContent from './SettingsContent';
import { SettingsLoadingSkeleton } from '@/components/LoadingSkeleton';

export default function Page() {
  return (
    <Suspense fallback={<SettingsLoadingSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
