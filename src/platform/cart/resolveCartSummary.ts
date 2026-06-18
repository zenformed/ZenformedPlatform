import type { CartCheckoutIntent } from '@/platform/cart/cartIntentTypes';
import type { ZenformedCoreProductCatalogDetail } from '@/infrastructure/coreApi/types';

export type CartSummary = {
  readonly productName: string;
  readonly planName: string;
  readonly billingCycle: CartCheckoutIntent['billingCycle'];
  readonly checkoutMode: CartCheckoutIntent['checkoutMode'];
  readonly priceLabel: string;
  readonly seatsIncluded: number | null;
  readonly trialDays: number | null;
};

function formatPriceLabel(amountCents: number, billingCycle: CartCheckoutIntent['billingCycle']): string {
  const dollars = amountCents / 100;
  if (billingCycle === 'annual') {
    return `$${dollars.toLocaleString('en-US')}/year`;
  }
  return `$${dollars.toLocaleString('en-US')}/mo`;
}

export function resolveCartSummary(
  intent: CartCheckoutIntent,
  catalog: ZenformedCoreProductCatalogDetail
): CartSummary | null {
  if (catalog.product.productSlug !== intent.productSlug) {
    return null;
  }

  const plan = catalog.plans.find((entry) => entry.planSlug === intent.planSlug);
  if (plan == null) {
    return null;
  }

  const amountCents =
    intent.billingCycle === 'annual' ? plan.annualAmountCents : plan.monthlyAmountCents;

  return {
    productName: catalog.product.name,
    planName: plan.name,
    billingCycle: intent.billingCycle,
    checkoutMode: intent.checkoutMode,
    priceLabel: formatPriceLabel(amountCents, intent.billingCycle),
    seatsIncluded: plan.seatsIncluded,
    trialDays: intent.checkoutMode === 'trial' ? plan.trialDays : null,
  };
}
