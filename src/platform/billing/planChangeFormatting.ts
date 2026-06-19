'use client';

import type { PlanChangeType } from '@/platform/cart/cartIntentTypes';
import type { BillingPeriod } from '@/platform/products/productPricingCatalog';
import type { PlanChangePreviewResponse } from '@/infrastructure/coreApi/subscriptionChangePlanPreviewClient';

export function formatPlanChangeMoney(amountCents: number, currency: string): string {
  const normalizedCurrency = currency.trim().toUpperCase() || 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function formatPlanChangeRenewalAmount(amountCents: number, billingCycle: BillingPeriod, currency: string): string {
  const amount = formatPlanChangeMoney(amountCents, currency);
  return billingCycle === 'annual' ? `${amount}/yr` : `${amount}/mo`;
}

export function formatPlanChangeBillingDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function resolvePlanChangeConfirmLabel(changeType: PlanChangeType | null | undefined): string {
  if (changeType === 'upgrade') return 'Confirm Upgrade';
  if (changeType === 'downgrade') return 'Confirm Downgrade';
  return 'Confirm Change';
}

export function buildPlanChangeProrationNote(preview: PlanChangePreviewResponse): string {
  const isUpgrade = preview.newPlan.amountCents > preview.currentPlan.amountCents;
  if (isUpgrade) {
    return `This estimate includes a credit for unused ${preview.currentPlan.planName} time and a prorated charge for ${preview.newPlan.planName} for the rest of the billing period.`;
  }
  if (preview.estimatedCreditIfAny > 0 && preview.estimatedAmountDueNow > 0) {
    return `This estimate includes a credit for unused ${preview.currentPlan.planName} time and a prorated charge for ${preview.newPlan.planName} for the rest of the billing period.`;
  }
  if (preview.estimatedCreditIfAny > 0) {
    return `This estimate includes a credit for unused ${preview.currentPlan.planName} time. Any remaining credit may apply to future invoices.`;
  }
  return `This estimate includes a prorated charge for ${preview.newPlan.planName} for the rest of the billing period.`;
}
