import type { NormalizedPlanSlug } from '@zenformed/core';
import type { PlatformAppId } from '@/platform/appDefinitions/platformApps';
import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';
import { getProductCatalogListFromCore, getProductCatalogProductFromCore } from '@/infrastructure/coreApi/productCatalogClient';
import type { ZenformedCoreProductCatalogDetail } from '@/infrastructure/coreApi/types';

export type ProductPricingAppSlug = PlatformAppId;

export type BillingPeriod = 'monthly' | 'annual';

export type ProductPlanPrimarySpec = {
  readonly label: string;
  readonly value: string;
};

export type ProductPlanDisplay = {
  readonly planSlug: NormalizedPlanSlug;
  readonly displayName: string;
  readonly monthlyAmount: number;
  readonly annualAmount: number;
  readonly seats: number | null;
  readonly primarySpec: ProductPlanPrimarySpec | null;
  readonly trialDays: number;
  readonly supportLevel: string;
  readonly features: readonly string[];
  readonly tagline?: string;
  readonly recommended?: boolean;
  readonly ctaLabel: string;
  readonly ctaDisabled?: boolean;
  /** Store-ready line id for future checkout/cart (e.g. buildcore-pro). */
  readonly cartItemKey: string;
};

export type ProductPricingPageConfig = {
  readonly appSlug: ProductPricingAppSlug;
  readonly productName: string;
  readonly tagline: string;
  readonly label: string;
  readonly title: string;
  readonly titleHighlight?: string;
  readonly intro: string;
  readonly storageHighlights?: readonly string[];
  readonly annualToggleLabel: string;
  readonly plans: readonly ProductPlanDisplay[];
  readonly purchasesEnabled: boolean;
};

function cartItemKey(appSlug: string, planSlug: string): string {
  return `${appSlug}-${planSlug}`;
}

function isProductPricingAppSlug(value: string): value is ProductPricingAppSlug {
  return PLATFORM_APPS.some((app) => app.id === value);
}

function resolvePlanPrimarySpec(
  planPrimarySpec: 'seats' | 'activeForms',
  plan: ZenformedCoreProductCatalogDetail['plans'][number]
): ProductPlanPrimarySpec | null {
  if (planPrimarySpec === 'activeForms') {
    return {
      label: 'Active Forms',
      value: plan.activeFormsLimit == null ? 'Unlimited' : String(plan.activeFormsLimit),
    };
  }
  if (plan.seatsIncluded != null) {
    return {
      label: 'Seats',
      value: String(plan.seatsIncluded),
    };
  }
  return null;
}

function mapCatalogDetailToPageConfig(detail: ZenformedCoreProductCatalogDetail): ProductPricingPageConfig | null {
  const { product } = detail;
  if (!isProductPricingAppSlug(product.productSlug)) {
    return null;
  }

  return {
    appSlug: product.productSlug,
    productName: product.name,
    tagline: product.tagline,
    label: product.label,
    title: product.title,
    titleHighlight: product.titleHighlight ?? undefined,
    intro: product.intro,
    storageHighlights:
      product.storageHighlights.length > 0 ? product.storageHighlights : undefined,
    annualToggleLabel: product.annualToggleLabel,
    purchasesEnabled: product.purchasesEnabled,
    plans: detail.plans.map((plan) => ({
      planSlug: plan.planSlug as NormalizedPlanSlug,
      displayName: plan.name,
      monthlyAmount: plan.monthlyAmountCents / 100,
      annualAmount: plan.annualAmountCents / 100,
      seats: plan.seatsIncluded,
      primarySpec: resolvePlanPrimarySpec(product.planPrimarySpec, plan),
      trialDays: plan.trialDays,
      supportLevel: plan.supportLevel ?? 'Email support',
      features: plan.features,
      tagline: plan.tagline ?? undefined,
      recommended: plan.recommended ? true : undefined,
      ctaLabel: `Choose ${plan.name}`,
      ctaDisabled: !product.purchasesEnabled,
      cartItemKey: cartItemKey(product.productSlug, plan.planSlug),
    })),
  };
}

export async function fetchProductCatalogSlugs(): Promise<readonly ProductPricingAppSlug[]> {
  const result = await getProductCatalogListFromCore();
  if (!result.ok) {
    return PLATFORM_APPS.map((app) => app.id);
  }
  const slugs = result.data.products
    .map((product) => product.productSlug)
    .filter(isProductPricingAppSlug);
  return slugs.length > 0 ? slugs : PLATFORM_APPS.map((app) => app.id);
}

export async function fetchProductPricingPageConfig(
  appSlug: string
): Promise<ProductPricingPageConfig | null> {
  const result = await getProductCatalogProductFromCore(appSlug);
  if (!result.ok) {
    return null;
  }
  return mapCatalogDetailToPageConfig(result.data);
}

export function getProductPricingIndexEntries(): readonly {
  id: ProductPricingAppSlug;
  name: string;
  tagline: string;
  description: string;
  features: readonly string[];
  status: 'live' | 'coming_soon';
  pricingHref: string;
}[] {
  return PLATFORM_APPS.map((app) => ({
    id: app.id,
    name: app.name,
    tagline: app.tagline,
    description: app.description,
    features: app.features,
    status: app.status,
    pricingHref: `/products/${app.id}`,
  }));
}

export function formatPlanPriceMonthly(amount: number): string {
  return `$${amount}/mo`;
}

export function formatPlanPriceAnnual(amount: number): string {
  return `$${amount.toLocaleString('en-US')}/year`;
}

export function formatPlanAnnualEquivalent(amount: number): string {
  return `$${Math.round(amount / 12).toLocaleString('en-US')}/mo`;
}
