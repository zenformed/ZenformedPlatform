import { NextRequest } from 'next/server';
import { relayAdminMutation } from '../../../coreAdminRelay';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, context: { params: { applicationId: string } }) {
  return relayAdminMutation(request, { upstreamPath: `/admin/partner-applications/${encodeURIComponent(context.params.applicationId)}/review`, method: 'PATCH' });
}
