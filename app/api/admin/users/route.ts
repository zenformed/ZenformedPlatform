import { NextRequest } from 'next/server';
import { relayAdminGet } from '../coreAdminRelay';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return relayAdminGet(request, { upstreamPath: '/admin/users' });
}
