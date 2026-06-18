'use client';

import { useEffect, useState } from 'react';
import { parseSaaSEntitlementSnapshotJson, type SaaSEntitlementSnapshot } from '@zenformed/core';
import {
  PLATFORM_APPS,
  type PlatformAppId,
} from '@/platform/appDefinitions/platformApps';

export type ProductEntitlementState = {
  readonly owned: boolean;
  readonly planSlug: string | null;
};

export type UsePlatformProductEntitlementsResult = {
  ownedAppIds: ReadonlySet<PlatformAppId>;
  entitlementsByApp: Partial<Record<PlatformAppId, ProductEntitlementState>>;
  isLoading: boolean;
  error: string | null;
};

type EntitlementsBatchResponse = {
  entitlements?: Partial<Record<PlatformAppId, SaaSEntitlementSnapshot>>;
};

function readProductEntitlementState(snapshot: unknown, appId: PlatformAppId): ProductEntitlementState {
  const parsed = parseSaaSEntitlementSnapshotJson(snapshot, appId);
  if (parsed == null || !parsed.subscriptionActive) {
    return { owned: false, planSlug: null };
  }

  const planSlug = parsed.planSlugNormalized.trim();
  return {
    owned: true,
    planSlug: planSlug !== '' ? planSlug : null,
  };
}

export function usePlatformProductEntitlements(
  accessToken: string | null | undefined
): UsePlatformProductEntitlementsResult {
  const [ownedAppIds, setOwnedAppIds] = useState<ReadonlySet<PlatformAppId>>(new Set());
  const [entitlementsByApp, setEntitlementsByApp] = useState<
    Partial<Record<PlatformAppId, ProductEntitlementState>>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = accessToken?.trim() ?? '';
    if (!token) {
      setOwnedAppIds(new Set());
      setEntitlementsByApp({});
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
            setEntitlementsByApp({});
          }
          return;
        }

        const json = (await res.json()) as EntitlementsBatchResponse;
        const owned = new Set<PlatformAppId>();
        const byApp: Partial<Record<PlatformAppId, ProductEntitlementState>> = {};

        for (const app of PLATFORM_APPS) {
          const snapshot = json.entitlements?.[app.id];
          const state = readProductEntitlementState(snapshot, app.id);
          byApp[app.id] = state;
          if (state.owned) {
            owned.add(app.id);
          }
        }

        if (!cancelled) {
          setOwnedAppIds(owned);
          setEntitlementsByApp(byApp);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load your app access.');
          setOwnedAppIds(new Set());
          setEntitlementsByApp({});
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return { ownedAppIds, entitlementsByApp, isLoading, error };
}
