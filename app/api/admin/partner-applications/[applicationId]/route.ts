import { NextRequest } from 'next/server';
import { relayAdminGet } from '../../coreAdminRelay';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: { applicationId: string } }) {
  return relayAdminGet(request, { upstreamPath: `/admin/partner-applications/${encodeURIComponent(context.params.applicationId)}` });
}
