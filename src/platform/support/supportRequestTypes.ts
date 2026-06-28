export const PLATFORM_SUPPORT_REQUESTS_TABLE = 'platform_support_requests';
export const PLATFORM_SUPPORT_REQUEST_MESSAGES_TABLE = 'platform_support_request_messages';

export const SUPPORT_REQUEST_SUBJECT_MAX_LENGTH = 200;
export const SUPPORT_REQUEST_MESSAGE_MAX_LENGTH = 5000;

export const SUPPORT_REQUEST_STATUSES = [
  'open',
  'in_progress',
  'waiting_on_customer',
  'closed',
] as const;
export type SupportRequestStatus = (typeof SUPPORT_REQUEST_STATUSES)[number];

export const SUPPORT_REQUEST_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
export type SupportRequestPriority = (typeof SUPPORT_REQUEST_PRIORITIES)[number];

export const SUPPORT_REQUEST_SENDER_TYPES = ['customer', 'support', 'system'] as const;
export type SupportRequestSenderType = (typeof SUPPORT_REQUEST_SENDER_TYPES)[number];

export const SUPPORT_REQUEST_PRODUCTS = [
  'account',
  'buildcore',
  'forgecore',
  'formcore',
  'analyticscore',
  'other',
] as const;

export type SupportRequestProduct = (typeof SUPPORT_REQUEST_PRODUCTS)[number];

export type SupportRequestSource = 'docs' | (string & {});

export type SupportRequestProductOption = {
  readonly value: SupportRequestProduct;
  readonly label: string;
};

export const SUPPORT_REQUEST_PRODUCT_OPTIONS: readonly SupportRequestProductOption[] = [
  { value: 'account', label: 'My Account' },
  { value: 'buildcore', label: 'BuildCore' },
  { value: 'forgecore', label: 'ForgeCore' },
  { value: 'formcore', label: 'FormCore' },
  { value: 'analyticscore', label: 'AnalyticsCore' },
  { value: 'other', label: 'Other' },
];

export type PlatformSupportRequestRow = {
  readonly id: string;
  readonly user_id: string;
  readonly organization_id: string | null;
  readonly product: string | null;
  readonly subject: string;
  readonly source: string;
  readonly status: SupportRequestStatus;
  readonly priority: SupportRequestPriority;
  readonly assigned_to_user_id: string | null;
  readonly last_customer_message_at: string | null;
  readonly last_support_message_at: string | null;
  readonly closed_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
};

export type PlatformSupportRequestMessageRow = {
  readonly id: string;
  readonly request_id: string;
  readonly sender_user_id: string;
  readonly sender_type: SupportRequestSenderType;
  readonly message: string;
  readonly created_at: string;
};

export type SupportRequest = {
  readonly id: string;
  readonly userId: string;
  readonly organizationId: string | null;
  readonly product: SupportRequestProduct | null;
  readonly subject: string;
  readonly source: string;
  readonly status: SupportRequestStatus;
  readonly priority: SupportRequestPriority;
  readonly assignedToUserId: string | null;
  readonly lastCustomerMessageAt: string | null;
  readonly lastSupportMessageAt: string | null;
  readonly closedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SupportRequestMessage = {
  readonly id: string;
  readonly requestId: string;
  readonly senderUserId: string;
  readonly senderType: SupportRequestSenderType;
  readonly message: string;
  readonly createdAt: string;
};

export type CreateSupportRequestInput = {
  readonly userId: string;
  readonly organizationId?: string | null;
  readonly product?: SupportRequestProduct | null;
  readonly subject: string;
  readonly message: string;
  readonly source?: SupportRequestSource;
};

export type AddSupportRequestMessageInput = {
  readonly requestId: string;
  readonly senderUserId: string;
  readonly senderType: SupportRequestSenderType;
  readonly message: string;
};

export type SupportRequestSubmissionInput = {
  readonly subject: string;
  readonly message: string;
  readonly product?: string | null;
  readonly source?: string;
};

export type SupportRequestTicketPatch = {
  readonly updated_at: string;
  readonly last_customer_message_at?: string;
  readonly last_support_message_at?: string;
  readonly status?: SupportRequestStatus;
};
