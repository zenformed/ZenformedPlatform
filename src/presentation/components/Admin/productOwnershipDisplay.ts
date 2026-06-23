import { resolveAppEntitlementBadges } from '@zenformed/core/organization-settings';
import { getPlatformProductMetadata } from '@/platform/products/platformProductMetadata';

export type ProductOwnershipDisplayItem = {
  productSlug: string;
  productName: string;
  iconSrc: string | undefined;
  tierLabel: string;
  tierPlanBadgeVariant: 'starter' | 'growth' | 'pro' | 'standard' | 'single' | 'default';
  tierStatusBadgeVariant: 'trial' | 'active' | 'inactive';
  showPlanBadge: boolean;
  showStatusBadge: boolean;
};

export type ProductOwnershipInput = {
  productSlug: string;
  planSlug: string;
  entitlementStatus: string;
};

export function mapProductOwnershipToDisplayItem(
  item: ProductOwnershipInput
): ProductOwnershipDisplayItem {
  const metadata = getPlatformProductMetadata(item.productSlug);
  const badges = resolveAppEntitlementBadges(
    item.productSlug,
    item.planSlug,
    item.entitlementStatus
  );
  const isTrial = item.entitlementStatus.trim().toLowerCase() === 'trial';

  return {
    productSlug: metadata.productSlug,
    productName: metadata.displayName,
    iconSrc: metadata.iconSrc,
    tierLabel: isTrial ? badges.statusLabel : badges.planLabel,
    tierPlanBadgeVariant: badges.planBadgeVariant,
    tierStatusBadgeVariant: badges.statusBadgeVariant,
    showPlanBadge: !isTrial,
    showStatusBadge: isTrial,
  };
}

export function mapSubscriptionStatusToEntitlementStatus(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'trialing') return 'trial';
  if (normalized === 'active') return 'active';
  return normalized;
}

export function mapProductOwnershipList(
  items: readonly ProductOwnershipInput[]
): ProductOwnershipDisplayItem[] {
  return items.map(mapProductOwnershipToDisplayItem);
}
