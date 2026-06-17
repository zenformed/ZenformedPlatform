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

    void Promise.all(
      PLATFORM_APPS.map(async (app) => {
        try {
          const res = await fetch(`/api/internal/apps/${encodeURIComponent(app.id)}/entitlement`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            return { id: app.id, owned: false as const };
          }
          const json: unknown = await res.json();
          return { id: app.id, owned: isPlatformAppOwned(json) };
        } catch {
          return { id: app.id, owned: false as const };
        }
      })
    )
      .then((results) => {
        if (cancelled) return;
        const owned = new Set<PlatformAppId>();
        for (const row of results) {
          if (row.owned) owned.add(row.id);
        }
        setOwnedAppIds(owned);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Could not load your app access.');
        setOwnedAppIds(new Set());
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return { ownedAppIds, isLoading, error };
}
