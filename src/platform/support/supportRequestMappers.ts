import type {
  PlatformSupportRequestMessageRow,
  PlatformSupportRequestRow,
  SupportRequest,
  SupportRequestMessage,
  SupportRequestSenderType,
  SupportRequestStatus,
  SupportRequestTicketPatch,
} from '@/platform/support/supportRequestTypes';
import {
  SUPPORT_REQUEST_SENDER_TYPES,
  SUPPORT_REQUEST_STATUSES,
} from '@/platform/support/supportRequestTypes';
import { parseSupportRequestProduct } from '@/platform/support/supportRequestValidation';

export function isSupportRequestStatus(value: string): value is SupportRequestStatus {
  return (SUPPORT_REQUEST_STATUSES as readonly string[]).includes(value);
}

export function isSupportRequestSenderType(value: string): value is SupportRequestSenderType {
  return (SUPPORT_REQUEST_SENDER_TYPES as readonly string[]).includes(value);
}

export function mapPlatformSupportRequestRow(row: PlatformSupportRequestRow): SupportRequest {
  return {
    id: row.id,
    userId: row.user_id,
    organizationId: row.organization_id,
    product: parseSupportRequestProduct(row.product),
    subject: row.subject,
    source: row.source,
    status: row.status,
    priority: row.priority,
    assignedToUserId: row.assigned_to_user_id,
    lastCustomerMessageAt: row.last_customer_message_at,
    lastSupportMessageAt: row.last_support_message_at,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPlatformSupportRequestMessageRow(
  row: PlatformSupportRequestMessageRow,
): SupportRequestMessage {
  return {
    id: row.id,
    requestId: row.request_id,
    senderUserId: row.sender_user_id,
    senderType: row.sender_type,
    message: row.message,
    createdAt: row.created_at,
  };
}

export function buildSupportRequestInsert(input: {
  readonly userId: string;
  readonly organizationId?: string | null;
  readonly product?: ReturnType<typeof parseSupportRequestProduct>;
  readonly subject: string;
  readonly source?: string;
}) {
  return {
    user_id: input.userId,
    organization_id: input.organizationId ?? null,
    product: input.product ?? null,
    subject: input.subject,
    source: input.source ?? 'docs',
    status: 'open' as const,
    priority: 'normal' as const,
  };
}

export function buildSupportRequestMessageInsert(input: {
  readonly requestId: string;
  readonly senderUserId: string;
  readonly senderType: SupportRequestSenderType;
  readonly message: string;
}) {
  return {
    request_id: input.requestId,
    sender_user_id: input.senderUserId,
    sender_type: input.senderType,
    message: input.message,
  };
}

export function buildSupportRequestPatchAfterMessage(input: {
  readonly senderType: SupportRequestSenderType;
  readonly currentStatus: SupportRequestStatus;
  readonly timestamp: string;
}): SupportRequestTicketPatch {
  if (input.senderType === 'customer') {
    return {
      updated_at: input.timestamp,
      last_customer_message_at: input.timestamp,
      ...(input.currentStatus === 'waiting_on_customer' ? { status: 'open' as const } : {}),
    };
  }

  if (input.senderType === 'support') {
    return {
      updated_at: input.timestamp,
      last_support_message_at: input.timestamp,
    };
  }

  return {
    updated_at: input.timestamp,
  };
}

export function buildInitialCustomerMessageTicketPatch(input: {
  readonly timestamp: string;
}): SupportRequestTicketPatch {
  return {
    updated_at: input.timestamp,
    last_customer_message_at: input.timestamp,
  };
}
