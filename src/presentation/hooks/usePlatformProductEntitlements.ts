'use client';

import { useEffect, useState } from 'react';
import {
  PLATFORM_APPS,
  type PlatformAppId,
} from '@/platform/appDefinitions/platformApps';
import { isPlatformAppOwned } from '@/presentation/features/platformDashboard/platformDashboardProducts';

export type UsePlatformProductEntitlementsResult = {
  ownedAppIds: ReadonlySet<PlatformAppId>;
  isLoading: boolean;
  error: string | null;
};

type EntitlementsBatchResponse = {
  entitlements?: Partial<Record<PlatformAppId, unknown>>;
};

export function usePlatformProductEntitlements(
  accessToken: string | null | undefined
): UsePlatformProductEntitlementsResult {
  const [ownedAppIds, setOwnedAppIds] = useState<ReadonlySet<PlatformAppId>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = accessToken?.trim() ?? '';
    if (!token) {
      setOwnedAppIds(new Set());
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetch('/api/internal/apps/entitlements', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (!cancelled) {
            setError(res.status === 401 ? null : 'Could not load your app access.');
            setOwnedAppIds(new Set());
          }
          return;
        }

        const json = (await res.json()) as EntitlementsBatchResponse;
        const owned = new Set<PlatformAppId>();
        for (const app of PLATFORM_APPS) {
          const entitlement = json.entitlements?.[app.id];
          if (
            isPlatformAppOwned({
              entitlement,
            })
          ) {
            owned.add(app.id);
          }
        }

        if (!cancelled) {
          setOwnedAppIds(owned);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load your app access.');
          setOwnedAppIds(new Set());
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return { ownedAppIds, isLoading, error };
}
