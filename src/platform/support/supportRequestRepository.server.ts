import 'server-only';

import { requireSupabaseServiceRoleClient } from '@/infrastructure/supabase/supabaseServiceRole.server';
import {
  PLATFORM_SUPPORT_REQUESTS_TABLE,
  type CreateSupportRequestInput,
} from '@/platform/support/supportRequestTypes';

export async function recordSupportRequest(
  input: CreateSupportRequestInput,
): Promise<{ readonly supportRequestId: string }> {
  const supabase = requireSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(PLATFORM_SUPPORT_REQUESTS_TABLE)
    .insert({
      user_id: input.userId,
      organization_id: input.organizationId ?? null,
      product: input.product ?? null,
      subject: input.subject,
      message: input.message,
      source: input.source ?? 'docs',
      status: 'open',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to record support request: ${error.message}`);
  }

  return { supportRequestId: data.id as string };
}
