import DashboardContainer from '@/components/DashboardContainer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardContainer>{children}</DashboardContainer>;
}
