import type { BillingPeriod } from '@/platform/products/productPricingCatalog';

export type CheckoutMode = 'trial' | 'paid';

export type CartCheckoutIntent = {
  readonly productSlug: string;
  readonly planSlug: string;
  readonly billingCycle: BillingPeriod;
  readonly checkoutMode: CheckoutMode;
};

const VALID_BILLING_CYCLES = new Set<BillingPeriod>(['monthly', 'annual']);
const VALID_CHECKOUT_MODES = new Set<CheckoutMode>(['trial', 'paid']);

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
  return {
    productSlug: o.productSlug.trim().toLowerCase(),
    planSlug: o.planSlug.trim().toLowerCase(),
    billingCycle: o.billingCycle as BillingPeriod,
    checkoutMode: o.checkoutMode as CheckoutMode,
  };
}

export function createCartCheckoutIntent(input: {
  readonly productSlug: string;
  readonly planSlug: string;
  readonly billingCycle: BillingPeriod;
  readonly checkoutMode: CheckoutMode;
}): CartCheckoutIntent | null {
  return parseCartCheckoutIntent({
    productSlug: input.productSlug,
    planSlug: input.planSlug,
    billingCycle: input.billingCycle,
    checkoutMode: input.checkoutMode,
  });
}
