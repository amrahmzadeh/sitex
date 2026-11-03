import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function BuilderPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }
  redirect('/dashboard/theme');
}
