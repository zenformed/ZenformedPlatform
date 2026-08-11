import { NextRequest } from 'next/server';
import { relayAdminGet, relayAdminMutation } from '../coreAdminRelay';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return relayAdminGet(request, { upstreamPath: '/admin/partner-programs' });
}

export async function POST(request: NextRequest) {
  return relayAdminMutation(request, { upstreamPath: '/admin/partner-programs', method: 'POST' });
}
