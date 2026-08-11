import { NextRequest } from 'next/server';
import { relayAdminGet, relayAdminMutation } from '../../coreAdminRelay';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: { programId: string } }) {
  return relayAdminGet(request, { upstreamPath: `/admin/partner-programs/${encodeURIComponent(context.params.programId)}` });
}

export async function PUT(request: NextRequest, context: { params: { programId: string } }) {
  return relayAdminMutation(request, { upstreamPath: `/admin/partner-programs/${encodeURIComponent(context.params.programId)}`, method: 'PUT' });
}
