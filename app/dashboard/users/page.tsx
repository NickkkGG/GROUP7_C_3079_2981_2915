import { Suspense } from 'react';
import UsersContent from './UsersContent';
import { UsersLoadingSkeleton } from '@/components/LoadingSkeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users - ALTUS',
};

export default function Page() {
  return (
    <Suspense fallback={<UsersLoadingSkeleton />}>
      <UsersContent />
    </Suspense>
  );
}
