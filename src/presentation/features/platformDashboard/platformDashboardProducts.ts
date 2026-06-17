import {
  PLATFORM_APPS,
  type PlatformAppEntry,
  type PlatformAppId,
} from '@/platform/appDefinitions/platformApps';

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
