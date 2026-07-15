/**
 * Pure gate for when Platform may mount the shared notifications controller.
 */
export type PlatformNotificationsConfigGateInput = {
  readonly isSaasMode: boolean;
  readonly useMockAuth: boolean;
  readonly hasAccessToken: boolean;
  readonly membershipContextStatus: string;
  readonly organizationId: string | null | undefined;
  readonly hasActiveMembership: boolean | null | undefined;
};

export function shouldEnablePlatformNotifications(
  input: PlatformNotificationsConfigGateInput
): boolean {
  if (!input.isSaasMode || input.useMockAuth) return false;
  if (!input.hasAccessToken) return false;
  if (input.membershipContextStatus !== 'ready') return false;
  const organizationId = input.organizationId?.trim() ?? '';
  if (!organizationId) return false;
  if (!input.hasActiveMembership) return false;
  return true;
}
