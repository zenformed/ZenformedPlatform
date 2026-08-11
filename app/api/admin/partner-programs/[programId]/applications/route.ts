import { NextRequest } from 'next/server';
import { relayAdminGet } from '../../../coreAdminRelay';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: { programId: string } }) {
  return relayAdminGet(request, { upstreamPath: `/admin/partner-programs/${encodeURIComponent(context.params.programId)}/applications` });
}
