import type { PlanChangeType } from '@/platform/cart/cartIntentTypes';
import type { ProductPlanDisplay } from '@/platform/products/productPricingCatalog';

export const STANDARD_TIERED_PLAN_SLUGS = ['starter', 'growth', 'pro'] as const;

const PLAN_TIER_RANK: Readonly<Record<string, number>> = {
  starter: 1,
  growth: 2,
  pro: 3,
};

export function resolvePlanTierRank(planSlug: string | null | undefined): number | null {
  if (planSlug == null || planSlug.trim() === '') return null;
  return PLAN_TIER_RANK[planSlug.trim().toLowerCase()] ?? null;
}

export function resolveHighestPlanRank(planSlugs: readonly string[]): number {
  let highest = 0;
  for (const slug of planSlugs) {
    const rank = resolvePlanTierRank(slug);
    if (rank != null && rank > highest) {
      highest = rank;
    }
  }
  return highest;
}

export function isOwnedProductAtHighestPlan(
  currentPlanSlug: string | null,
  catalogPlanSlugs: readonly string[]
): boolean {
  const currentRank = resolvePlanTierRank(currentPlanSlug);
  if (currentRank == null) return true;
  const highestRank = resolveHighestPlanRank(catalogPlanSlugs);
  if (highestRank === 0) return true;
  return currentRank >= highestRank;
}

export function resolveProductListingCtaLabel(input: {
  readonly isLive: boolean;
  readonly owned: boolean;
  readonly currentPlanSlug: string | null;
  readonly catalogPlanSlugs: readonly string[];
  readonly viewPlansLabel: string;
  readonly previewPlansLabel: string;
}): string {
  if (!input.owned) {
    return input.isLive ? input.viewPlansLabel : input.previewPlansLabel;
  }
  if (isOwnedProductAtHighestPlan(input.currentPlanSlug, input.catalogPlanSlugs)) {
    return 'Change Plan';
  }
  return 'Upgrade';
}

export type PlanCardOwnershipAction =
  | {
      readonly kind: 'purchase';
      readonly showTrial: true;
      readonly primaryLabel: string;
      readonly owned: false;
    }
  | {
      readonly kind: 'current';
      readonly primaryLabel: 'Current Plan';
      readonly owned: true;
      readonly disabled: true;
    }
  | {
      readonly kind: 'change';
      readonly primaryLabel: string;
      readonly changeType: PlanChangeType;
      readonly owned: false;
    };

export function resolvePlanCardOwnershipAction(input: {
  readonly productOwned: boolean;
  readonly currentPlanSlug: string | null;
  readonly targetPlan: Pick<ProductPlanDisplay, 'planSlug' | 'displayName' | 'ctaLabel'>;
}): PlanCardOwnershipAction {
  if (!input.productOwned || input.currentPlanSlug == null || input.currentPlanSlug.trim() === '') {
    return {
      kind: 'purchase',
      showTrial: true,
      primaryLabel: input.targetPlan.ctaLabel,
      owned: false,
    };
  }

  const currentSlug = input.currentPlanSlug.trim().toLowerCase();
  const targetSlug = input.targetPlan.planSlug.trim().toLowerCase();
  if (targetSlug === currentSlug) {
    return {
      kind: 'current',
      primaryLabel: 'Current Plan',
      owned: true,
      disabled: true,
    };
  }

  const targetRank = resolvePlanTierRank(targetSlug);
  const currentRank = resolvePlanTierRank(currentSlug);

  if (targetRank != null && currentRank != null && targetRank > currentRank) {
    return {
      kind: 'change',
      primaryLabel: `Upgrade to ${input.targetPlan.displayName}`,
      changeType: 'upgrade',
      owned: false,
    };
  }

  return {
    kind: 'change',
    primaryLabel: `Switch to ${input.targetPlan.displayName}`,
    changeType:
      targetRank != null && currentRank != null && targetRank < currentRank ? 'downgrade' : 'switch',
    owned: false,
  };
}

export function canContinuePlanChange(input: {
  readonly changeType: PlanChangeType;
  readonly targetSeatsIncluded: number | null;
  readonly activeMemberCount: number | null;
}): boolean {
  if (input.changeType !== 'downgrade') return true;
  if (input.targetSeatsIncluded == null) return true;
  if (input.activeMemberCount == null) return true;
  return input.activeMemberCount <= input.targetSeatsIncluded;
}

export function formatPlanDowngradeBlockedMessage(input: {
  readonly planName: string;
  readonly targetSeats: number;
  readonly activeMemberCount: number;
}): string {
  return `Remove seated team members before switching to ${input.planName}. This plan includes ${input.targetSeats} seats, but your organization currently has ${input.activeMemberCount} active members.`;
}
