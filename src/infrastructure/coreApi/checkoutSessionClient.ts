import { env } from '@/infrastructure/config/env';
import type { CoreApiResult } from '@/infrastructure/coreApi/types';
import type { CartCheckoutIntent } from '@/platform/cart/cartIntentTypes';

const DEFAULT_TIMEOUT_MS = 15_000;

export type CheckoutSessionResponse = {
  checkoutUrl: string;
};

function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '');
}

function parseCheckoutSessionJson(json: unknown): CheckoutSessionResponse | null {
  if (json == null || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if (typeof o.checkoutUrl !== 'string' || o.checkoutUrl.trim() === '') return null;
  return { checkoutUrl: o.checkoutUrl };
}

/** `POST /checkout/session` — create Stripe Checkout Session from catalog-validated intent. */
export async function createCheckoutSessionOnCore(
  accessToken: string,
  body: Pick<CartCheckoutIntent, 'productSlug' | 'planSlug' | 'billingCycle' | 'checkoutMode'>
): Promise<CoreApiResult<CheckoutSessionResponse>> {
  const base = env.zenformedCoreApiBaseUrl;
  if (base == null) {
    return { ok: false, error: { kind: 'unconfigured' } };
  }
  const url = `${normalizeBaseUrl(base)}/checkout/session`;
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
        productSlug: body.productSlug,
        planSlug: body.planSlug,
        billingCycle: body.billingCycle,
        checkoutMode: body.checkoutMode,
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
    const parsed = parseCheckoutSessionJson(json);
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
