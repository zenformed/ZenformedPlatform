import { NextRequest, NextResponse } from 'next/server';
import { readRequestBearerToken } from '@/infrastructure/auth/readRequestBearer';
import { getMyAvatarBytes } from '@/infrastructure/coreApi/userAvatarClient';
import { coreUpstreamHttpResponsePayload } from '@/infrastructure/coreApi/zenformedCoreRelayHttp';
import { usesCoreUserAvatars } from '@/infrastructure/userPhoto/userPhotoAuthority';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store, must-revalidate' };

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (usesCoreUserAvatars()) {
    const emailParam = request.nextUrl.searchParams.get('email');
    if (emailParam != null && emailParam.trim() !== '') {
      return NextResponse.json({ error: 'email_query_not_allowed' }, { status: 400, headers: NO_STORE_HEADERS });
    }
    const token = readRequestBearerToken(request);
    if (token == null) {
      return new NextResponse(null, { status: 401, headers: NO_STORE_HEADERS });
    }
    const result = await getMyAvatarBytes(token);
    if (!result.ok) {
      if (result.error.kind === 'http_error' && result.error.status === 404) {
        return new NextResponse(null, { status: 404, headers: NO_STORE_HEADERS });
      }
      if (result.error.kind === 'http_error') {
        const upstream = coreUpstreamHttpResponsePayload(result.error);
        if (upstream != null) {
          return NextResponse.json(upstream.json, { status: upstream.status, headers: NO_STORE_HEADERS });
        }
      }
      return NextResponse.json({ error: 'avatar_unavailable' }, { status: 502, headers: NO_STORE_HEADERS });
    }
    return new NextResponse(result.data.buffer, {
      headers: {
        'Content-Type': result.data.contentType,
        ...NO_STORE_HEADERS,
      },
    });
  }

  return new NextResponse(null, { status: 404, headers: NO_STORE_HEADERS });
}
