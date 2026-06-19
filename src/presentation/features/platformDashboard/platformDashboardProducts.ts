import {
  PLATFORM_APPS,
  type PlatformAppEntry,
  type PlatformAppId,
} from '@/platform/appDefinitions/platformApps';
import { resolveAppEntitlementBadges } from '@zenformed/core/organization-settings';
import type { ZenformedAppRegistryEntry } from '@zenformed/core/dashboard-shell';
import type { ProductEntitlementState } from '@/presentation/hooks/usePlatformProductEntitlements';
export {
  getAppPlanCatalogEntries,
  listPurchasablePlansForApp,
  PLATFORM_APP_PLAN_CATALOG,
} from '@zenformed/core';

export function isPlatformAppOwned(
  entitlementBody: unknown
): boolean {
  if (entitlementBody == null || typeof entitlementBody !== 'object') return false;
  const o = entitlementBody as Record<string, unknown>;
  const ent = o.entitlement;
  if (ent == null || typeof ent !== 'object') return false;
  return (ent as Record<string, unknown>).subscriptionActive === true;
}

export function countActivePlatformSubscriptions(
  ownedAppIds: ReadonlySet<PlatformAppId>
): number {
  return ownedAppIds.size;
}

export function partitionPlatformAppsByOwnership(
  ownedAppIds: ReadonlySet<PlatformAppId>
): {
  myApps: PlatformAppEntry[];
  availableProducts: PlatformAppEntry[];
} {
  const myApps: PlatformAppEntry[] = [];
  const availableProducts: PlatformAppEntry[] = [];
  for (const app of PLATFORM_APPS) {
    if (ownedAppIds.has(app.id)) {
      myApps.push(app);
    } else {
      availableProducts.push(app);
    }
  }
  return { myApps, availableProducts };
}

export function enrichMyAppsWithEntitlementBadges(
  myApps: readonly PlatformAppEntry[],
  entitlementsByApp: Partial<Record<PlatformAppId, ProductEntitlementState>>
): ZenformedAppRegistryEntry[] {
  return myApps.map((app) => {
    const entitlement = entitlementsByApp[app.id];
    if (
      entitlement?.owned &&
      entitlement.planSlug != null &&
      entitlement.entitlementStatus != null
    ) {
      return {
        ...app,
        entitlementBadges: resolveAppEntitlementBadges(
          app.id,
          entitlement.planSlug,
          entitlement.entitlementStatus
        ),
      };
    }
    return app;
  });
}
