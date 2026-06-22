import { NextRequest, NextResponse } from 'next/server';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import { env } from '@/infrastructure/config/env';
import { coreUpstreamHttpResponsePayload } from '@/infrastructure/coreApi/zenformedCoreRelayHttp';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';

export const dynamic = 'force-dynamic';

type AdminRelayOptions = {
  upstreamPath: string;
};

export async function relayAdminGet(
  request: NextRequest,
  { upstreamPath }: AdminRelayOptions
): Promise<NextResponse> {
  if (!runtimeModes.isSaasMode() || runtimeModes.useMockAuth()) {
    return NextResponse.json(
      {
        error: 'bad_request',
        message: 'Admin relay requires SaaS mode with real Supabase auth.',
      },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get('Authorization');
  const user = await getSupabaseUserFromToken(authHeader);
  if (!user || !authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const accessToken = authHeader.slice('Bearer '.length).trim();
  if (!accessToken) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  if (env.zenformedCoreApiBaseUrl == null) {
    return NextResponse.json(
      { relay: 'error', error: 'core_unconfigured' },
      { status: 503 }
    );
  }

  const query = request.nextUrl.search;
  const url = `${env.zenformedCoreApiBaseUrl.replace(/\/+$/, '')}${upstreamPath}${query}`;

  const res = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return NextResponse.json({ relay: 'error', error: 'invalid_upstream_payload' }, { status: 502 });
  }

  if (!res.ok) {
    if (res.status === 401) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }
    if (res.status === 403) {
      return NextResponse.json({ error: 'forbidden', message: 'Platform staff access required.' }, { status: 403 });
    }
    const upstream = coreUpstreamHttpResponsePayload({
      kind: 'http_error',
      status: res.status,
      body: json,
    });
    if (upstream != null) {
      return NextResponse.json(upstream.json, { status: upstream.status });
    }
    return NextResponse.json({ relay: 'error', error: 'zenformed_core_error', detail: json }, { status: res.status });
  }

  return NextResponse.json({ relay: 'zenformed_core', ...(json as object) });
}
