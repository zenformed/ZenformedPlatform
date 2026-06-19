import { env } from '@/infrastructure/config/env';

import type { CoreApiResult } from '@/infrastructure/coreApi/types';

import type { BillingPeriod } from '@/platform/products/productPricingCatalog';



const DEFAULT_TIMEOUT_MS = 15_000;



export type PlanChangePreviewPlan = {

  planSlug: string;

  planName: string;

  billingCycle: BillingPeriod;

  amountCents: number;

  displayLabel: string;

};



export type PlanChangePreviewResponse = {

  productSlug: string;

  productName: string;

  subscriptionId: string;

  currency: string;

  currentPlan: PlanChangePreviewPlan;

  newPlan: PlanChangePreviewPlan;

  estimatedAmountDueNow: number;

  estimatedCreditIfAny: number;

  nextRenewalAmount: number;

  nextBillingDate: string;

  prorationDate: string;

  scheduledDowngrade: boolean;

  effectivePlanChangeDate: string | null;

};



function normalizeBaseUrl(raw: string): string {

  return raw.replace(/\/+$/, '');

}



function readPreviewPlan(raw: unknown): PlanChangePreviewPlan | null {

  if (raw == null || typeof raw !== 'object') return null;

  const o = raw as Record<string, unknown>;

  if (typeof o.planSlug !== 'string' || o.planSlug.trim() === '') return null;

  if (typeof o.planName !== 'string' || o.planName.trim() === '') return null;

  if (o.billingCycle !== 'monthly' && o.billingCycle !== 'annual') return null;

  if (typeof o.amountCents !== 'number' || !Number.isFinite(o.amountCents)) return null;

  if (typeof o.displayLabel !== 'string' || o.displayLabel.trim() === '') return null;

  return {

    planSlug: o.planSlug.trim().toLowerCase(),

    planName: o.planName.trim(),

    billingCycle: o.billingCycle,

    amountCents: o.amountCents,

    displayLabel: o.displayLabel.trim(),

  };

}



function parsePlanChangePreviewJson(json: unknown): PlanChangePreviewResponse | null {

  if (json == null || typeof json !== 'object') return null;

  const o = json as Record<string, unknown>;

  if (typeof o.productSlug !== 'string' || o.productSlug.trim() === '') return null;

  if (typeof o.productName !== 'string' || o.productName.trim() === '') return null;

  if (typeof o.subscriptionId !== 'string' || o.subscriptionId.trim() === '') return null;

  if (typeof o.currency !== 'string' || o.currency.trim() === '') return null;

  const currentPlan = readPreviewPlan(o.currentPlan);

  const newPlan = readPreviewPlan(o.newPlan);

  if (currentPlan == null || newPlan == null) return null;

  if (typeof o.estimatedAmountDueNow !== 'number' || !Number.isFinite(o.estimatedAmountDueNow)) return null;

  if (typeof o.estimatedCreditIfAny !== 'number' || !Number.isFinite(o.estimatedCreditIfAny)) return null;

  if (typeof o.nextRenewalAmount !== 'number' || !Number.isFinite(o.nextRenewalAmount)) return null;

  if (typeof o.nextBillingDate !== 'string' || o.nextBillingDate.trim() === '') return null;

  if (typeof o.prorationDate !== 'string' || o.prorationDate.trim() === '') return null;

  const scheduledDowngrade = o.scheduledDowngrade === true;
  const effectivePlanChangeDate =
    typeof o.effectivePlanChangeDate === 'string' && o.effectivePlanChangeDate.trim() !== ''
      ? o.effectivePlanChangeDate.trim()
      : null;

  return {

    productSlug: o.productSlug.trim().toLowerCase(),

    productName: o.productName.trim(),

    subscriptionId: o.subscriptionId.trim(),

    currency: o.currency.trim().toLowerCase(),

    currentPlan,

    newPlan,

    estimatedAmountDueNow: o.estimatedAmountDueNow,

    estimatedCreditIfAny: o.estimatedCreditIfAny,

    nextRenewalAmount: o.nextRenewalAmount,

    nextBillingDate: o.nextBillingDate,

    prorationDate: o.prorationDate,

    scheduledDowngrade,

    effectivePlanChangeDate,

  };

}



/** POST /billing/subscriptions/:productSlug/change-plan/preview */

export async function previewSubscriptionPlanChangeOnCore(

  accessToken: string,

  input: {

    readonly productSlug: string;

    readonly planSlug: string;

    readonly billingCycle: BillingPeriod;

  }

): Promise<CoreApiResult<PlanChangePreviewResponse>> {

  const base = env.zenformedCoreApiBaseUrl;

  if (base == null) {

    return { ok: false, error: { kind: 'unconfigured' } };

  }



  const slug = input.productSlug.trim().toLowerCase();

  const url = `${normalizeBaseUrl(base)}/billing/subscriptions/${encodeURIComponent(slug)}/change-plan/preview`;

  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);



  try {

    const res = await fetch(url, {

      method: 'POST',

      signal: controller.signal,

      headers: {

        Accept: 'application/json',

        Authorization: `Bearer ${accessToken}`,

        'Content-Type': 'application/json',

      },

      body: JSON.stringify({

        productSlug: slug,

        planSlug: input.planSlug.trim().toLowerCase(),

        billingCycle: input.billingCycle,

      }),

    });



    let json: unknown;

    try {

      json = await res.json();

    } catch {

      return { ok: false, error: { kind: 'invalid_payload' } };

    }



    if (!res.ok) {

      return { ok: false, error: { kind: 'http_error', status: res.status, body: json } };

    }



    const parsed = parsePlanChangePreviewJson(json);

    if (parsed == null) {

      return { ok: false, error: { kind: 'invalid_payload' } };

    }

    return { ok: true, data: parsed };

  } catch (e) {

    const aborted = e instanceof Error && e.name === 'AbortError';

    if (aborted) {

      return { ok: false, error: { kind: 'timeout' } };

    }

    const message = e instanceof Error ? e.message : String(e);

    return { ok: false, error: { kind: 'network', message } };

  } finally {

    clearTimeout(timer);

  }

}

