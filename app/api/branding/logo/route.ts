import { NextRequest, NextResponse } from 'next/server';
import { usesCoreOrganizationBranding } from '@/infrastructure/branding/organizationBrandingAuthority';
import { coreBrandingHttpFailure } from '@/infrastructure/branding/coreBrandingRelay';
import { readRequestBearerToken } from '@/infrastructure/auth/readRequestBearer';
import {
  deleteOrganizationLogo,
  getOrganizationLogoBytes,
} from '@/infrastructure/coreApi/organizationBrandingClient';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (usesCoreOrganizationBranding()) {
    const token = readRequestBearerToken(request);
    if (token == null) {
      return new NextResponse(null, { status: 401 });
    }
    const result = await getOrganizationLogoBytes(token);
    if (!result.ok) {
      if (result.error.kind === 'http_error' && result.error.status === 404) {
        return new NextResponse(null, { status: 404 });
      }
      const failure = coreBrandingHttpFailure(result.error);
      if (failure != null) {
        return NextResponse.json(failure.body, { status: failure.status });
      }
      return NextResponse.json({ error: 'logo_unavailable' }, { status: 502 });
    }
    return new NextResponse(result.data.buffer, {
      headers: {
        'Content-Type': result.data.contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  }

  return new NextResponse(null, { status: 404 });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (usesCoreOrganizationBranding()) {
    const token = readRequestBearerToken(request);
    if (token == null) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await deleteOrganizationLogo(token);
    if (!result.ok) {
      const failure = coreBrandingHttpFailure(result.error);
      if (failure != null) {
        return NextResponse.json(failure.body, { status: failure.status });
      }
      return NextResponse.json({ error: 'logo_delete_failed' }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'branding_not_configured' }, { status: 503 });
}
