import { NextRequest, NextResponse } from 'next/server';
import type { SaaSEntitlementSnapshot } from '@zenformed/core';
import { inactiveAppEntitlementSnapshot } from '@zenformed/core';
import { PlatformTableEntitlementReader } from '@/infrastructure/entitlements/PlatformTableEntitlementReader';
import { ORGANIZATION_WORKSPACE_NO_STORE_HEADERS } from '@/infrastructure/coreApi/zenformedCoreRelayHttp';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const platformEntitlementReader = new PlatformTableEntitlementReader();

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
  const snapshot: SaaSEntitlementSnapshot =
    (await platformEntitlementReader.loadEntitlementsForApp({
      userId: user.id,
      appSlug: normalizedSlug,
      accessToken: raw,
    })) ?? inactiveAppEntitlementSnapshot(normalizedSlug);

  return entitlementJson({
    relay: 'platform_tables',
    appSlug: normalizedSlug,
    entitlement: snapshot,
  });
}
