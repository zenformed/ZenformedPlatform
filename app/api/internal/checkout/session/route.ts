import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSessionOnCore } from '@/infrastructure/coreApi/checkoutSessionClient';
import { coreUpstreamHttpResponsePayload } from '@/infrastructure/coreApi/zenformedCoreRelayHttp';
import { env } from '@/infrastructure/config/env';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import { parseCartCheckoutIntent } from '@/platform/cart/cartIntentTypes';
import type { CheckoutLegalAcceptancePayload } from '@zenformed/core/legal';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';

export const dynamic = 'force-dynamic';

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function readCheckoutSessionBody(body: unknown): (ReturnType<typeof parseCartCheckoutIntent> & CheckoutLegalAcceptancePayload) | null {
  if (body == null || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  const intent = parseCartCheckoutIntent({
    productSlug: record.productSlug,
    planSlug: record.planSlug,
    billingCycle: record.billingCycle,
    checkoutMode: record.checkoutMode,
  });
  if (intent == null) return null;

  const acceptedTermsVersion = readNonEmptyString(record.acceptedTermsVersion);
  const acceptedPrivacyVersion = readNonEmptyString(record.acceptedPrivacyVersion);
  if (acceptedTermsVersion == null || acceptedPrivacyVersion == null) return null;

  return {
    ...intent,
    acceptedTermsVersion,
    acceptedPrivacyVersion,
  };
}

function mapUpstreamCheckoutError(status: number, body: unknown): NextResponse {
  if (status === 401 || status === 403) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (body != null && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.error === 'string') {
      return NextResponse.json(
        {
          relay: 'zenformed_core',
          error: record.error,
          message: typeof record.message === 'string' ? record.message : undefined,
        },
        { status }
      );
    }
  }
  return NextResponse.json(
    { relay: 'zenformed_core', error: 'checkout_session_failed' },
    { status }
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!runtimeModes.isSaasMode() || runtimeModes.useMockAuth()) {
    return NextResponse.json(
      {
        error: 'bad_request',
        message: 'Checkout requires SaaS mode with real Supabase auth.',
      },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get('Authorization');
  const user = await getSupabaseUserFromToken(authHeader);
  if (!user || !authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const raw = authHeader.slice('Bearer '.length).trim();
  if (!raw) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  if (env.zenformedCoreApiBaseUrl == null) {
    return NextResponse.json({
      relay: 'client_supabase_deprecated',
      reason: 'core_unconfigured',
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body', message: 'JSON body required' }, { status: 400 });
  }

  const intent = readCheckoutSessionBody(body);
  if (intent == null) {
    return NextResponse.json(
      {
        error: 'invalid_body',
        message:
          'productSlug, planSlug, billingCycle, checkoutMode, acceptedTermsVersion, and acceptedPrivacyVersion are required.',
      },
      { status: 400 }
    );
  }

  const result = await createCheckoutSessionOnCore(raw, intent);
  if (!result.ok) {
    if (result.error.kind === 'http_error') {
      const st = result.error.status;
      if (st >= 400 && st <= 599) {
        const upstream = coreUpstreamHttpResponsePayload(result.error);
        if (upstream != null) {
          return NextResponse.json(upstream.json, { status: upstream.status });
        }
        return mapUpstreamCheckoutError(st, result.error.body);
      }
    }
    return NextResponse.json(
      {
        relay: 'error',
        error: 'zenformed_core_unreachable',
        detail: result.error,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    relay: 'zenformed_core',
    checkoutUrl: result.data.checkoutUrl,
  });
}
