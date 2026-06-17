import { NextRequest, NextResponse } from 'next/server';
import { inactiveAppEntitlementSnapshot, type SaaSEntitlementSnapshot } from '@zenformed/core';
import { PLATFORM_APPS, type PlatformAppId } from '@/platform/appDefinitions/platformApps';
import { PlatformTableEntitlementReader } from '@/infrastructure/entitlements/PlatformTableEntitlementReader';
import { ORGANIZATION_WORKSPACE_NO_STORE_HEADERS } from '@/infrastructure/coreApi/zenformedCoreRelayHttp';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const platformEntitlementReader = new PlatformTableEntitlementReader();

function entitlementsJson(body: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...ORGANIZATION_WORKSPACE_NO_STORE_HEADERS,
      ...(init?.headers ?? {}),
    },
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!runtimeModes.isSaasMode() || runtimeModes.useMockAuth()) {
    return entitlementsJson(
      {
        error: 'bad_request',
        message: 'Entitlement resolution requires SaaS mode with real Supabase auth.',
      },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get('Authorization');
  const user = await getSupabaseUserFromToken(authHeader);
  if (!user || !authHeader?.startsWith('Bearer ')) {
    return entitlementsJson({ error: 'unauthenticated' }, { status: 401 });
  }
  const raw = authHeader.slice('Bearer '.length).trim();
  if (!raw) {
    return entitlementsJson({ error: 'unauthenticated' }, { status: 401 });
  }

  const entitlements: Partial<Record<PlatformAppId, SaaSEntitlementSnapshot>> = {};
  await Promise.all(
    PLATFORM_APPS.map(async (app) => {
      const snapshot =
        (await platformEntitlementReader.loadEntitlementsForApp({
          userId: user.id,
          appSlug: app.id,
          accessToken: raw,
        })) ?? inactiveAppEntitlementSnapshot(app.id);
      entitlements[app.id] = snapshot;
    })
  );

  return entitlementsJson({
    relay: 'platform_tables',
    entitlements,
  });
}
