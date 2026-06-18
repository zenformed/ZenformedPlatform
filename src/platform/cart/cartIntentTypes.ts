import type { BillingPeriod } from '@/platform/products/productPricingCatalog';

export type CheckoutMode = 'trial' | 'paid';

export type PlanChangeType = 'upgrade' | 'downgrade' | 'switch';

export type CartCheckoutIntent = {
  readonly productSlug: string;
  readonly planSlug: string;
  readonly billingCycle: BillingPeriod;
  readonly checkoutMode: CheckoutMode;
  readonly changeType?: PlanChangeType;
};

const VALID_BILLING_CYCLES = new Set<BillingPeriod>(['monthly', 'annual']);
const VALID_CHECKOUT_MODES = new Set<CheckoutMode>(['trial', 'paid']);
const VALID_CHANGE_TYPES = new Set<PlanChangeType>(['upgrade', 'downgrade', 'switch']);

export function parseCartCheckoutIntent(raw: unknown): CartCheckoutIntent | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.productSlug !== 'string' || o.productSlug.trim() === '') return null;
  if (typeof o.planSlug !== 'string' || o.planSlug.trim() === '') return null;
  if (typeof o.billingCycle !== 'string' || !VALID_BILLING_CYCLES.has(o.billingCycle as BillingPeriod)) {
    return null;
  }
  if (typeof o.checkoutMode !== 'string' || !VALID_CHECKOUT_MODES.has(o.checkoutMode as CheckoutMode)) {
    return null;
  }
  let changeType: PlanChangeType | undefined;
  if (o.changeType != null) {
    if (typeof o.changeType !== 'string' || !VALID_CHANGE_TYPES.has(o.changeType as PlanChangeType)) {
      return null;
    }
    changeType = o.changeType as PlanChangeType;
  }
  return {
    productSlug: o.productSlug.trim().toLowerCase(),
    planSlug: o.planSlug.trim().toLowerCase(),
    billingCycle: o.billingCycle as BillingPeriod,
    checkoutMode: o.checkoutMode as CheckoutMode,
    ...(changeType != null ? { changeType } : {}),
  };
}

export function createCartCheckoutIntent(input: {
  readonly productSlug: string;
  readonly planSlug: string;
  readonly billingCycle: BillingPeriod;
  readonly checkoutMode: CheckoutMode;
  readonly changeType?: PlanChangeType;
}): CartCheckoutIntent | null {
  return parseCartCheckoutIntent({
    productSlug: input.productSlug,
    planSlug: input.planSlug,
    billingCycle: input.billingCycle,
    checkoutMode: input.checkoutMode,
    ...(input.changeType != null ? { changeType: input.changeType } : {}),
  });
}
