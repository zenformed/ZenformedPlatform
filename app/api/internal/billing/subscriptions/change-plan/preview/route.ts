import { NextRequest, NextResponse } from 'next/server';
import { previewSubscriptionPlanChangeOnCore } from '@/infrastructure/coreApi/subscriptionChangePlanPreviewClient';
import { coreUpstreamHttpResponsePayload } from '@/infrastructure/coreApi/zenformedCoreRelayHttp';
import { env } from '@/infrastructure/config/env';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';

export const dynamic = 'force-dynamic';

function readStringField(body: unknown, key: string): string | null {
  if (body == null || typeof body !== 'object') return null;
  const raw = (body as Record<string, unknown>)[key];
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  return raw.trim().toLowerCase();
}

function readBillingCycle(body: unknown): 'monthly' | 'annual' | null {
  if (body == null || typeof body !== 'object') return null;
  const raw = (body as Record<string, unknown>).billingCycle;
  if (raw !== 'monthly' && raw !== 'annual') return null;
  return raw;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!runtimeModes.isSaasMode() || runtimeModes.useMockAuth()) {
    return NextResponse.json(
      {
        error: 'bad_request',
        message: 'Subscription plan previews require SaaS mode with real Supabase auth.',
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
    return NextResponse.json(
      {
        relay: 'client_supabase_deprecated',
        reason: 'core_unconfigured',
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body', message: 'JSON body required' }, { status: 400 });
  }

  const productSlug = readStringField(body, 'productSlug');
  const planSlug = readStringField(body, 'planSlug');
  const billingCycle = readBillingCycle(body);
  if (productSlug == null || planSlug == null || billingCycle == null) {
    return NextResponse.json(
      {
        error: 'invalid_body',
        message: 'productSlug, planSlug, and billingCycle are required.',
      },
      { status: 400 }
    );
  }

  const result = await previewSubscriptionPlanChangeOnCore(raw, { productSlug, planSlug, billingCycle });
  if (!result.ok) {
    if (result.error.kind === 'http_error') {
      const upstream = coreUpstreamHttpResponsePayload(result.error);
      if (upstream != null) {
        return NextResponse.json(upstream.json, { status: upstream.status });
      }
      return NextResponse.json(result.error.body ?? { error: 'preview_failed' }, {
        status: result.error.status,
      });
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
    ...result.data,
  });
}
