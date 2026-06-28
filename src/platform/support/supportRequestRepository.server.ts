import 'server-only';

import { requireSupabaseServiceRoleClient } from '@/infrastructure/supabase/supabaseServiceRole.server';
import {
  buildInitialCustomerMessageTicketPatch,
  buildSupportRequestInsert,
  buildSupportRequestMessageInsert,
  buildSupportRequestPatchAfterMessage,
  mapPlatformSupportRequestMessageRow,
  mapPlatformSupportRequestRow,
} from '@/platform/support/supportRequestMappers';
import type {
  AddSupportRequestMessageInput,
  CreateSupportRequestInput,
  PlatformSupportRequestMessageRow,
  PlatformSupportRequestRow,
  SupportRequest,
  SupportRequestMessage,
} from '@/platform/support/supportRequestTypes';
import {
  PLATFORM_SUPPORT_REQUEST_MESSAGES_TABLE,
  PLATFORM_SUPPORT_REQUESTS_TABLE,
} from '@/platform/support/supportRequestTypes';

export async function createSupportRequest(
  input: CreateSupportRequestInput,
): Promise<{ readonly supportRequestId: string }> {
  const supabase = requireSupabaseServiceRoleClient();
  const { data: requestRow, error: requestError } = await supabase
    .from(PLATFORM_SUPPORT_REQUESTS_TABLE)
    .insert(buildSupportRequestInsert(input))
    .select('*')
    .single();

  if (requestError) {
    throw new Error(`Failed to create support request: ${requestError.message}`);
  }

  const request = requestRow as PlatformSupportRequestRow;
  const { error: messageError } = await supabase
    .from(PLATFORM_SUPPORT_REQUEST_MESSAGES_TABLE)
    .insert(
      buildSupportRequestMessageInsert({
        requestId: request.id,
        senderUserId: input.userId,
        senderType: 'customer',
        message: input.message,
      }),
    );

  if (messageError) {
    throw new Error(`Failed to create initial support request message: ${messageError.message}`);
  }

  const { error: touchError } = await supabase
    .from(PLATFORM_SUPPORT_REQUESTS_TABLE)
    .update(buildInitialCustomerMessageTicketPatch({ timestamp: request.created_at }))
    .eq('id', request.id);

  if (touchError) {
    throw new Error(`Failed to update support request timestamps: ${touchError.message}`);
  }

  return { supportRequestId: request.id };
}

export async function addSupportRequestMessage(
  input: AddSupportRequestMessageInput,
): Promise<{ readonly messageId: string }> {
  const supabase = requireSupabaseServiceRoleClient();
  const { data: requestRow, error: requestError } = await supabase
    .from(PLATFORM_SUPPORT_REQUESTS_TABLE)
    .select('id, status')
    .eq('id', input.requestId)
    .maybeSingle();

  if (requestError) {
    throw new Error(`Failed to load support request for message update: ${requestError.message}`);
  }

  if (requestRow == null) {
    throw new Error('Support request not found.');
  }

  const { data, error } = await supabase
    .from(PLATFORM_SUPPORT_REQUEST_MESSAGES_TABLE)
    .insert(buildSupportRequestMessageInsert(input))
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to add support request message: ${error.message}`);
  }

  const timestamp = new Date().toISOString();
  const patch = buildSupportRequestPatchAfterMessage({
    senderType: input.senderType,
    currentStatus: (requestRow as Pick<PlatformSupportRequestRow, 'status'>).status,
    timestamp,
  });

  const { error: touchError } = await supabase
    .from(PLATFORM_SUPPORT_REQUESTS_TABLE)
    .update(patch)
    .eq('id', input.requestId);

  if (touchError) {
    throw new Error(`Failed to update support request timestamps: ${touchError.message}`);
  }

  return { messageId: data.id as string };
}

export async function getSupportRequest(requestId: string): Promise<SupportRequest | null> {
  const supabase = requireSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(PLATFORM_SUPPORT_REQUESTS_TABLE)
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load support request: ${error.message}`);
  }

  if (data == null) {
    return null;
  }

  return mapPlatformSupportRequestRow(data as PlatformSupportRequestRow);
}

export async function getSupportRequestMessages(
  requestId: string,
): Promise<readonly SupportRequestMessage[]> {
  const supabase = requireSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(PLATFORM_SUPPORT_REQUEST_MESSAGES_TABLE)
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load support request messages: ${error.message}`);
  }

  return ((data ?? []) as PlatformSupportRequestMessageRow[]).map(
    mapPlatformSupportRequestMessageRow,
  );
}
