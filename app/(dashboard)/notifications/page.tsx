'use client';

import type { ReactElement } from 'react';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  pickDashboardPageLoadingClassNames,
  ZenformedDashboardPageLoading,
  ZenformedNotificationsPage,
} from '@zenformed/core/dashboard-shell';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import { createPlatformNotificationsApi } from '@/infrastructure/notifications/createPlatformNotificationsApi';
import { navigateNotificationDestination } from '@/presentation/features/notifications/navigateNotificationDestination';
import { PlatformDashboardShell } from '@/presentation/components/DashboardShell/PlatformDashboardShell';
import { usePlatformDashboard } from '@/presentation/features/platformDashboard/usePlatformDashboard';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import styles from '../dashboard/dashboard.module.css';

const pageLoadingClassNames = pickDashboardPageLoadingClassNames(styles);

export default function NotificationsPage(): ReactElement {
  const router = useRouter();
  const dash = usePlatformDashboard();
  const { session, organizationMembershipContext, membershipContextStatus } = useSaaSProfile();

  const api = useMemo(
    () =>
      createPlatformNotificationsApi(
        () => (runtimeModes.isSaasMode() ? session?.access_token ?? null : null)
      ),
    [session?.access_token]
  );

  const onNavigate = useCallback(
    (destinationUrl: string) => {
      navigateNotificationDestination(destinationUrl, {
        push: (href) => router.push(href),
      });
    },
    [router]
  );

  let main: ReactElement;
  if (membershipContextStatus === 'pending') {
    main = (
      <ZenformedDashboardPageLoading
        classNames={pageLoadingClassNames}
        message="Loading notifications…"
      />
    );
  } else {
    const organizationId = organizationMembershipContext?.organizationId?.trim() ?? '';
    if (!organizationId || !organizationMembershipContext?.hasActiveMembership) {
      main = (
        <div className={styles.page}>
          <h1>Notifications</h1>
          <p>Join an organization to view notifications.</p>
        </div>
      );
    } else {
      main = (
        <ZenformedNotificationsPage
          organizationId={organizationId}
          api={api}
          onNavigate={onNavigate}
        />
      );
    }
  }

  return <PlatformDashboardShell dash={dash}>{main}</PlatformDashboardShell>;
}
