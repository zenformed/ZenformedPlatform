import { NextRequest, NextResponse } from 'next/server';
import { ORGANIZATION_WORKSPACE_NO_STORE_HEADERS } from '@/infrastructure/coreApi/zenformedCoreRelayHttp';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';
import { env } from '@/infrastructure/config/env';
import { fetchCoreAppEntitlementSnapshot } from '@/infrastructure/coreApi/coreAppEntitlementRelay';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function entitlementJson(body: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...ORGANIZATION_WORKSPACE_NO_STORE_HEADERS,
      ...(init?.headers ?? {}),
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: { appSlug: string } }
): Promise<NextResponse> {
  if (!runtimeModes.isSaasMode() || runtimeModes.useMockAuth()) {
    return entitlementJson(
      {
        error: 'bad_request',
        message: 'Entitlement resolution requires SaaS mode with real Supabase auth.',
      },
      { status: 400 }
    );
  }

  const { appSlug } = context.params;
  if (typeof appSlug !== 'string' || appSlug.trim() === '') {
    return entitlementJson({ error: 'bad_request', message: 'Missing appSlug.' }, { status: 400 });
  }

  const authHeader = request.headers.get('Authorization');
  const user = await getSupabaseUserFromToken(authHeader);
  if (!user || !authHeader?.startsWith('Bearer ')) {
    return entitlementJson({ error: 'unauthenticated' }, { status: 401 });
  }
  const raw = authHeader.slice('Bearer '.length).trim();
  if (!raw) {
    return entitlementJson({ error: 'unauthenticated' }, { status: 401 });
  }

  const normalizedSlug = appSlug.trim().toLowerCase();

  if (env.zenformedCoreApiBaseUrl == null) {
    return entitlementJson(
      {
        relay: 'client_supabase_deprecated',
        reason: 'core_unconfigured',
      },
      { status: 503 }
    );
  }

  const result = await fetchCoreAppEntitlementSnapshot(normalizedSlug, raw);
  if (!result.ok) {
    if (result.kind === 'unauthenticated') {
      return entitlementJson({ error: 'unauthenticated' }, { status: 401 });
    }
    if (result.kind === 'not_found') {
      return entitlementJson(
        {
          relay: 'zenformed_core',
          appSlug: normalizedSlug,
          entitlement: null,
          error: 'not_found',
        },
        { status: 404 }
      );
    }
    return entitlementJson(
      {
        relay: 'error',
        error: 'zenformed_core_unreachable',
      },
      { status: 502 }
    );
  }

  return entitlementJson({
    relay: 'zenformed_core',
    appSlug: normalizedSlug,
    entitlement: result.snapshot,
  });
}
