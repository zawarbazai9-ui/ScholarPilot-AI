import { DashboardShell } from '@/components/dashboard-shell';
import { RequireAuth } from '@/components/require-auth';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}
