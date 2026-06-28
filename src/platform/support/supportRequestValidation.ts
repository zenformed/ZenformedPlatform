import {
  SUPPORT_REQUEST_MESSAGE_MAX_LENGTH,
  SUPPORT_REQUEST_PRODUCTS,
  SUPPORT_REQUEST_SUBJECT_MAX_LENGTH,
  type CreateSupportRequestInput,
  type SupportRequestProduct,
  type SupportRequestSubmissionInput,
} from '@/platform/support/supportRequestTypes';

export type SupportRequestFieldErrors = {
  readonly subject?: string;
  readonly message?: string;
  readonly product?: string;
  readonly source?: string;
};

export type ValidatedSupportRequestSubmission = {
  readonly subject: string;
  readonly message: string;
  readonly product: SupportRequestProduct | null;
  readonly source: string;
};

function isSupportRequestProduct(value: string): value is SupportRequestProduct {
  return (SUPPORT_REQUEST_PRODUCTS as readonly string[]).includes(value);
}

export function parseSupportRequestProduct(
  value: string | null | undefined,
): SupportRequestProduct | null {
  const trimmed = value?.trim().toLowerCase() ?? '';
  if (trimmed === '') {
    return null;
  }

  return isSupportRequestProduct(trimmed) ? trimmed : null;
}

export function validateSupportRequestSubmission(
  input: SupportRequestSubmissionInput,
): { readonly ok: true; readonly value: ValidatedSupportRequestSubmission } | {
  readonly ok: false;
  readonly errors: SupportRequestFieldErrors;
} {
  const subject = input.subject.trim();
  const message = input.message.trim();
  const source = input.source?.trim() ?? 'docs';
  const product = parseSupportRequestProduct(input.product);
  const errors: SupportRequestFieldErrors = {};

  if (subject.length === 0) {
    errors.subject = 'Subject is required.';
  } else if (subject.length > SUPPORT_REQUEST_SUBJECT_MAX_LENGTH) {
    errors.subject = `Subject must be ${SUPPORT_REQUEST_SUBJECT_MAX_LENGTH} characters or fewer.`;
  }

  if (message.length === 0) {
    errors.message = 'Message is required.';
  } else if (message.length > SUPPORT_REQUEST_MESSAGE_MAX_LENGTH) {
    errors.message = `Message must be ${SUPPORT_REQUEST_MESSAGE_MAX_LENGTH} characters or fewer.`;
  }

  if (input.product != null && input.product.trim() !== '' && product == null) {
    errors.product = 'Select a valid product.';
  }

  if (source.length === 0) {
    errors.source = 'Source is required.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      subject,
      message,
      product,
      source,
    },
  };
}

export function buildCreateSupportRequestInput(
  submission: ValidatedSupportRequestSubmission,
  context: {
    readonly userId: string;
    readonly organizationId?: string | null;
  },
): CreateSupportRequestInput {
  return {
    userId: context.userId,
    organizationId: context.organizationId ?? null,
    product: submission.product,
    subject: submission.subject,
    message: submission.message,
    source: submission.source,
  };
}
