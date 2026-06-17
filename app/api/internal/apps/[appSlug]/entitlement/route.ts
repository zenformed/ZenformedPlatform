/**
 * GET /api/internal/apps/:appSlug/entitlement
 *
 * Relays `GET /apps/:appSlug/entitlement` on ZenformedCore when configured.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAppEntitlement } from '@/infrastructure/coreApi/client';
import { ORGANIZATION_WORKSPACE_NO_STORE_HEADERS } from '@/infrastructure/coreApi/zenformedCoreRelayHttp';
import { env } from '@/infrastructure/config/env';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';

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
        message: 'Entitlement relay requires SaaS mode with real Supabase auth.',
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

  if (env.zenformedCoreApiBaseUrl == null) {
    return entitlementJson({
      relay: 'client_supabase_deprecated',
      reason: 'core_unconfigured',
    });
  }

  const result = await getAppEntitlement(appSlug, raw);
  if (!result.ok) {
    if (result.error.kind === 'http_error') {
      const st = result.error.status;
      if (st === 401 || st === 403) {
        return entitlementJson({ error: 'unauthenticated' }, { status: 401 });
      }
      if (st === 404) {
        let coreError: string | undefined;
        if (result.error.body != null && typeof result.error.body === 'object') {
          const o = result.error.body as Record<string, unknown>;
          if (typeof o.error === 'string') coreError = o.error;
        }
        return entitlementJson(
          {
            relay: 'zenformed_core',
            appSlug,
            entitlement: null,
            error: coreError ?? 'not_found',
          },
          { status: 404 }
        );
      }
    }
    return entitlementJson(
      {
        relay: 'error',
        error: 'zenformed_core_unreachable',
        detail: result.error,
      },
      { status: 502 }
    );
  }

  return entitlementJson({
    relay: 'zenformed_core',
    ...result.data,
  });
}
