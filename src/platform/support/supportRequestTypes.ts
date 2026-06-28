export const PLATFORM_SUPPORT_REQUESTS_TABLE = 'platform_support_requests';

export const SUPPORT_REQUEST_SUBJECT_MAX_LENGTH = 200;
export const SUPPORT_REQUEST_MESSAGE_MAX_LENGTH = 5000;

export const SUPPORT_REQUEST_STATUSES = ['open', 'in_progress', 'closed'] as const;
export type SupportRequestStatus = (typeof SUPPORT_REQUEST_STATUSES)[number];

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

export type CreateSupportRequestInput = {
  readonly userId: string;
  readonly organizationId?: string | null;
  readonly product?: SupportRequestProduct | null;
  readonly subject: string;
  readonly message: string;
  readonly source?: SupportRequestSource;
};

export type SupportRequestSubmissionInput = {
  readonly subject: string;
  readonly message: string;
  readonly product?: string | null;
  readonly source?: string;
};
