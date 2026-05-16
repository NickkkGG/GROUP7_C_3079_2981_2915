import { Suspense } from 'react';
import UsersContent from './UsersContent';
import { UsersLoadingSkeleton } from '@/components/LoadingSkeleton';

export default function Page() {
  return (
    <Suspense fallback={<UsersLoadingSkeleton />}>
      <UsersContent />
    </Suspense>
  );
}
