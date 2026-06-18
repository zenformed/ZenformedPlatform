import type { AccountMenuUserIdentity } from '@zenformed/core/dashboard-shell';

export function readNameFieldsFromUserMetadata(
  metadata: unknown
): Pick<AccountMenuUserIdentity, 'firstName' | 'lastName' | 'displayName'> {
  if (metadata == null || typeof metadata !== 'object') {
    return { firstName: null, lastName: null, displayName: null };
  }

  const record = metadata as Record<string, unknown>;
  const firstName =
    typeof record.first_name === 'string' && record.first_name.trim() !== ''
      ? record.first_name.trim()
      : null;
  const lastName =
    typeof record.last_name === 'string' && record.last_name.trim() !== ''
      ? record.last_name.trim()
      : null;
  const displayName =
    typeof record.display_name === 'string' && record.display_name.trim() !== ''
      ? record.display_name.trim()
      : null;

  return { firstName, lastName, displayName };
}

export function resolvePlatformAccountMenuUser(
  email: string,
  metadata: unknown
): AccountMenuUserIdentity {
  return {
    email,
    ...readNameFieldsFromUserMetadata(metadata),
  };
}
