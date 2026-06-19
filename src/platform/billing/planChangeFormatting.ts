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

export function isScheduledDowngradePreview(preview: PlanChangePreviewResponse): boolean {
  return preview.scheduledDowngrade === true;
}

export function buildPlanChangeProrationNote(preview: PlanChangePreviewResponse): string {
  if (isScheduledDowngradePreview(preview)) {
    const effectiveDate = formatPlanChangeBillingDate(
      preview.effectivePlanChangeDate ?? preview.nextBillingDate
    );
    return `Your plan will change to ${preview.newPlan.planName} on ${effectiveDate}. You will keep ${preview.currentPlan.planName} access until then. No charge or credit applies today.`;
  }

  const isUpgrade = preview.newPlan.amountCents > preview.currentPlan.amountCents;
  if (isUpgrade) {
    return `This estimate includes a credit for unused ${preview.currentPlan.planName} time and a prorated charge for ${preview.newPlan.planName} for the rest of the billing period.`;
  }
  if (preview.estimatedCreditIfAny > 0) {
    return `This estimate includes a credit for unused ${preview.currentPlan.planName} time. The credit will apply to your next invoice. No charge is due today.`;
  }
  if (preview.estimatedAmountDueNow > 0) {
    return `This estimate includes a prorated charge for ${preview.newPlan.planName} for the rest of the billing period.`;
  }
  return `Your plan will change to ${preview.newPlan.planName} with no charge due today.`;
}

export function buildPlanChangeSuccessMessage(preview: PlanChangePreviewResponse): string {
  if (isScheduledDowngradePreview(preview)) {
    const effectiveDate = formatPlanChangeBillingDate(
      preview.effectivePlanChangeDate ?? preview.nextBillingDate
    );
    return `Your plan will change to ${preview.newPlan.planName} on ${effectiveDate}. You will keep ${preview.currentPlan.planName} access until then.`;
  }
  return `Your subscription is now on ${preview.newPlan.planName}.`;
}
