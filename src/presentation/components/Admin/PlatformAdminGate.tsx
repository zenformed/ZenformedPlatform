'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import { platformAdminNavigation as nav } from '@/platform/navigation/platformAdminNavigation';
import { platformAdminContent as content } from '@/platform/content/platformAdminContent';
import { parseAdminStaffMe } from '@/infrastructure/coreApi/adminTypes';

export type PlatformAdminGateState =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'allowed'; role: string };

export function usePlatformAdminGate(): PlatformAdminGateState {
  const { session, loading: authLoading } = useSaaSProfile();
  const router = useRouter();
  const [state, setState] = useState<PlatformAdminGateState>({ status: 'loading' });

  useEffect(() => {
    if (authLoading) return;

    const token = session?.access_token;
    if (!token) {
      router.replace(`/login?returnTo=${encodeURIComponent(nav.basePath)}`);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(nav.api.me, {
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (cancelled) return;
        if (res.status === 403) {
          setState({ status: 'denied' });
          return;
        }
        if (!res.ok) {
          setState({ status: 'denied' });
          return;
        }
        const json: unknown = await res.json();
        const staff = parseAdminStaffMe(json);
        if (staff == null) {
          setState({ status: 'denied' });
          return;
        }
        setState({ status: 'allowed', role: staff.role });
      } catch {
        if (!cancelled) {
          setState({ status: 'denied' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, router, session?.access_token]);

  return useMemo(() => (authLoading ? { status: 'loading' } : state), [authLoading, state]);
}

export function PlatformAdminGate({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const gate = usePlatformAdminGate();

  if (gate.status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>{content.loading}</p>
      </div>
    );
  }

  if (gate.status === 'denied') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <h1 style={{ marginTop: 0 }}>{content.accessDeniedTitle}</h1>
          <p>{content.accessDeniedMessage}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function useAdminAccessToken(): () => string | null {
  const { session } = useSaaSProfile();
  return useCallback(() => session?.access_token ?? null, [session?.access_token]);
}
