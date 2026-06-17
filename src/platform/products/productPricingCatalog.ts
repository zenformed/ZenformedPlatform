import { getAppPlanCatalogEntries, type NormalizedPlanSlug } from '@zenformed/core';
import type { PlatformAppId } from '@/platform/appDefinitions/platformApps';
import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';

export type ProductPricingAppSlug = PlatformAppId;

export const PRODUCT_PRICING_APP_SLUGS: readonly ProductPricingAppSlug[] = [
  'buildcore',
  'forgecore',
  'formcore',
];

export type BillingPeriod = 'monthly' | 'annual';

export type ProductPlanDisplay = {
  readonly planSlug: NormalizedPlanSlug;
  readonly displayName: string;
  readonly monthlyAmount: number;
  readonly annualAmount: number;
  readonly seats: number;
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

const BUILDCORE_SHARED_FEATURES = [
  'Construction CRM',
  'Project and subproject management',
  'Workflow tasks',
  'Customer uploads',
  'Unlimited project photos and documents',
  'Milestone payments',
  'Budgets',
  'Reporting and PDF exports',
] as const;

const FORGECORE_SHARED_FEATURES = [
  'Inventory and supplier management',
  'Purchase orders',
  'Fabrication workflows',
  'Work order board',
  'Quote to production',
  'Reporting exports',
] as const;

const FORMCORE_SHARED_FEATURES = [
  'Custom forms and templates',
  'PDF generation',
  'E-signatures',
  'Approval workflows',
  'Mobile capture',
  'Organization-wide document library',
] as const;

function cartItemKey(appSlug: string, planSlug: string): string {
  return `${appSlug}-${planSlug}`;
}

function catalogDisplayName(appSlug: ProductPricingAppSlug, planSlug: NormalizedPlanSlug): string {
  const entry = getAppPlanCatalogEntries(appSlug).find((p) => p.planSlug === planSlug);
  return entry?.displayName ?? planSlug;
}

const BUILDCORE_PRICING: ProductPricingPageConfig = {
  appSlug: 'buildcore',
  productName: 'BuildCore',
  tagline: 'Construction CRM',
  label: 'BuildCore',
  title: 'Choose the plan that',
  titleHighlight: 'fits your team',
  intro:
    'BuildCore is a construction CRM for project and subproject management, workflow tasks, customer uploads, milestone payments, budgets, and reporting.',
  storageHighlights: [
    'Unlimited project photos',
    'Documents',
    'Customer uploads included',
  ],
  annualToggleLabel: 'SAVE 20%',
  purchasesEnabled: true,
  plans: [
    {
      planSlug: 'starter',
      displayName: catalogDisplayName('buildcore', 'starter'),
      monthlyAmount: 129,
      annualAmount: 1290,
      seats: 3,
      supportLevel: 'Email support',
      features: BUILDCORE_SHARED_FEATURES,
      tagline: 'Everything you need to get started with project management.',
      ctaLabel: 'Choose Starter',
      cartItemKey: cartItemKey('buildcore', 'starter'),
    },
    {
      planSlug: 'growth',
      displayName: catalogDisplayName('buildcore', 'growth'),
      monthlyAmount: 299,
      annualAmount: 2990,
      seats: 10,
      supportLevel: 'Priority email support',
      features: BUILDCORE_SHARED_FEATURES,
      tagline: 'For growing teams who need more seats and priority support.',
      recommended: true,
      ctaLabel: 'Choose Growth',
      cartItemKey: cartItemKey('buildcore', 'growth'),
    },
    {
      planSlug: 'pro',
      displayName: catalogDisplayName('buildcore', 'pro'),
      monthlyAmount: 499,
      annualAmount: 4990,
      seats: 25,
      supportLevel: 'Priority support and onboarding',
      features: BUILDCORE_SHARED_FEATURES,
      tagline: 'For large teams with advanced needs and dedicated onboarding.',
      ctaLabel: 'Choose Pro',
      cartItemKey: cartItemKey('buildcore', 'pro'),
    },
  ],
};

const FORGECORE_PRICING: ProductPricingPageConfig = {
  appSlug: 'forgecore',
  productName: 'ForgeCore',
  tagline: 'Manufacturing ERP',
  label: 'ForgeCore',
  title: 'Manufacturing operations plans',
  intro:
    'ForgeCore helps fabricators and manufacturers manage inventory, suppliers, purchase orders, and production workflows from quote to shop floor.',
  annualToggleLabel: '2 months free',
  purchasesEnabled: false,
  plans: [
    {
      planSlug: 'starter',
      displayName: catalogDisplayName('forgecore', 'starter'),
      monthlyAmount: 149,
      annualAmount: 1490,
      seats: 3,
      supportLevel: 'Email support',
      features: FORGECORE_SHARED_FEATURES,
      tagline: 'Get started with core manufacturing workflows.',
      ctaLabel: 'Choose Starter',
      ctaDisabled: true,
      cartItemKey: cartItemKey('forgecore', 'starter'),
    },
    {
      planSlug: 'growth',
      displayName: catalogDisplayName('forgecore', 'growth'),
      monthlyAmount: 349,
      annualAmount: 3490,
      seats: 10,
      supportLevel: 'Priority email support',
      features: FORGECORE_SHARED_FEATURES,
      tagline: 'Scale production with more seats and priority support.',
      recommended: true,
      ctaLabel: 'Choose Growth',
      ctaDisabled: true,
      cartItemKey: cartItemKey('forgecore', 'growth'),
    },
    {
      planSlug: 'pro',
      displayName: catalogDisplayName('forgecore', 'pro'),
      monthlyAmount: 549,
      annualAmount: 5490,
      seats: 25,
      supportLevel: 'Priority support and onboarding',
      features: FORGECORE_SHARED_FEATURES,
      tagline: 'For high-volume shops with advanced operational needs.',
      ctaLabel: 'Choose Pro',
      ctaDisabled: true,
      cartItemKey: cartItemKey('forgecore', 'pro'),
    },
  ],
};

const FORMCORE_PRICING: ProductPricingPageConfig = {
  appSlug: 'formcore',
  productName: 'FormCore',
  tagline: 'Forms & Document Automation',
  label: 'FormCore',
  title: 'One plan for your whole organization',
  intro:
    'FormCore delivers digital forms, document automation, e-signatures, and approval workflows with a single organization-wide subscription.',
  annualToggleLabel: '2 months free',
  purchasesEnabled: false,
  plans: [
    {
      planSlug: 'standard',
      displayName: catalogDisplayName('formcore', 'standard'),
      monthlyAmount: 199,
      annualAmount: 1990,
      seats: 15,
      supportLevel: 'Email and chat support',
      features: FORMCORE_SHARED_FEATURES,
      tagline: 'One subscription for forms, documents, and approvals across your org.',
      ctaLabel: 'Choose Standard',
      ctaDisabled: true,
      cartItemKey: cartItemKey('formcore', 'standard'),
    },
  ],
};

const PRICING_BY_APP: Record<ProductPricingAppSlug, ProductPricingPageConfig> = {
  buildcore: BUILDCORE_PRICING,
  forgecore: FORGECORE_PRICING,
  formcore: FORMCORE_PRICING,
};

export function isProductPricingAppSlug(value: string): value is ProductPricingAppSlug {
  return (PRODUCT_PRICING_APP_SLUGS as readonly string[]).includes(value);
}

export function getProductPricingPageConfig(
  appSlug: string
): ProductPricingPageConfig | null {
  if (!isProductPricingAppSlug(appSlug)) return null;
  return PRICING_BY_APP[appSlug];
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
