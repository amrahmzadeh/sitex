import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { CurrentOrgProvider } from '@/contexts/CurrentOrgContext';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/giris');

  return (
    <CurrentOrgProvider>
      <DashboardShell>{children}</DashboardShell>
    </CurrentOrgProvider>
  );
}
