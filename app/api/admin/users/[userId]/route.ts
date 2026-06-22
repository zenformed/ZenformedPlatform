import { NextRequest } from 'next/server';
import { relayAdminGet } from '../../coreAdminRelay';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: { userId: string };
};

export async function GET(request: NextRequest, context: RouteContext) {
  const ownerUserId = context.params.userId;
  return relayAdminGet(request, { upstreamPath: `/admin/users/${encodeURIComponent(ownerUserId)}` });
}
