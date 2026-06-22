import type { ReactElement } from 'react';
import { PlatformAdminGate } from '@/presentation/components/Admin/PlatformAdminGate';
import { PlatformAdminShell } from '@/presentation/components/Admin/PlatformAdminShell';
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  return (
    <PlatformAdminGate>
      <PlatformAdminShell>{children}</PlatformAdminShell>
    </PlatformAdminGate>
  );
}
