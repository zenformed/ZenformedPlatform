import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/infrastructure/config/env';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import { ensureMyDefaultOrganization } from '@/infrastructure/coreApi/ensureDefaultOrganizationClient';
import { coreUpstreamHttpResponsePayload } from '@/infrastructure/coreApi/zenformedCoreRelayHttp';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!runtimeModes.isSaasMode() || runtimeModes.useMockAuth()) {
    return NextResponse.json(
      {
        error: 'bad_request',
        message: 'Organization bootstrap requires SaaS mode with real Supabase auth.',
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
      { error: 'zenformed_core_unconfigured', message: 'ZENFORMED_CORE_API_URL is required.' },
      { status: 503 }
    );
  }

  let skipCreateForInviteFlow = false;
  try {
    const body: unknown = await request.json();
    if (body != null && typeof body === 'object') {
      skipCreateForInviteFlow =
        (body as { skipCreateForInviteFlow?: unknown }).skipCreateForInviteFlow === true;
    }
  } catch {
    // Empty / invalid body → defaults
  }

  const result = await ensureMyDefaultOrganization(raw, { skipCreateForInviteFlow });
  if (!result.ok) {
    if (result.error.kind === 'http_error') {
      const upstream = coreUpstreamHttpResponsePayload(result.error);
      if (upstream != null) {
        return NextResponse.json(upstream.json, { status: upstream.status });
      }
      return NextResponse.json(
        { error: 'zenformed_core_upstream', status: result.error.status },
        { status: result.error.status >= 400 && result.error.status < 600 ? result.error.status : 502 }
      );
    }
    return NextResponse.json(
      { error: 'zenformed_core_unreachable', detail: result.error },
      { status: 502 }
    );
  }

  return NextResponse.json(result.data);
}
