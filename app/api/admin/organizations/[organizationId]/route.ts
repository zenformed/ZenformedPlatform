import { NextRequest } from 'next/server';

import { relayAdminGet } from '../../coreAdminRelay';



export const dynamic = 'force-dynamic';



type RouteContext = {

  params: { organizationId: string };

};



export async function GET(request: NextRequest, context: RouteContext) {

  const organizationId = context.params.organizationId;

  return relayAdminGet(request, {

    upstreamPath: `/admin/organizations/${encodeURIComponent(organizationId)}`,

  });

}

