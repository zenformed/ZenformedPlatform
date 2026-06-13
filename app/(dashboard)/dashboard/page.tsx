'use client';

import { type ReactElement } from 'react';
import { PlatformDashboardShell } from '@/presentation/components/DashboardShell/PlatformDashboardShell';
import { usePlatformDashboard } from '@/presentation/features/platformDashboard/usePlatformDashboard';

export default function DashboardPage(): ReactElement {
  const dash = usePlatformDashboard();
  return <PlatformDashboardShell dash={dash} />;
}
