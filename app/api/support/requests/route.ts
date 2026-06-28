import { NextRequest, NextResponse } from 'next/server';
import { readRequestBearerToken } from '@/infrastructure/auth/readRequestBearer';
import { env } from '@/infrastructure/config/env';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import { fetchAuthoritativeMembershipContext } from '@/infrastructure/organization/organizationPermissionEnforcement';
import { getSupabaseUserFromToken } from '@/infrastructure/supabase/supabaseServer';
import { createSupportRequest } from '@/platform/support/supportRequestRepository.server';
import {
  buildCreateSupportRequestInput,
  validateSupportRequestSubmission,
} from '@/platform/support/supportRequestValidation';

export const dynamic = 'force-dynamic';

type SupportRequestBody = {
  readonly subject?: string;
  readonly message?: string;
  readonly product?: string | null;
  readonly source?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!runtimeModes.isSaasMode() || runtimeModes.useMockAuth()) {
    return NextResponse.json(
      {
        error: 'bad_request',
        message: 'Support requests require SaaS mode with real Supabase auth.',
      },
      { status: 400 },
    );
  }

  const authHeader = request.headers.get('Authorization');
  const user = await getSupabaseUserFromToken(authHeader);
  const accessToken = readRequestBearerToken(request);

  if (user == null || accessToken == null) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let body: SupportRequestBody;
  try {
    body = (await request.json()) as SupportRequestBody;
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateSupportRequestSubmission({
    subject: body.subject ?? '',
    message: body.message ?? '',
    product: body.product,
    source: body.source,
  });

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: 'validation_failed',
        message: 'Support request validation failed.',
        fieldErrors: validation.errors,
      },
      { status: 400 },
    );
  }

  let organizationId: string | null = null;
  if (env.zenformedCoreApiBaseUrl != null) {
    const membershipContext = await fetchAuthoritativeMembershipContext(accessToken);
    if (membershipContext.ok) {
      organizationId = membershipContext.data.organizationId;
    }
  }

  try {
    const { supportRequestId } = await createSupportRequest(
      buildCreateSupportRequestInput(validation.value, {
        userId: user.id,
        organizationId,
      }),
    );

    return NextResponse.json({
      supportRequestId,
      message: 'Support request sent.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit support request.';
    console.error('Support request failed:', message);
    return NextResponse.json({ error: 'support_request_failed', message }, { status: 500 });
  }
}
