import { Suspense } from 'react';
import TrackingContent from './TrackingContent';

export default function Page() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
