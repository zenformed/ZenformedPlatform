export function computePlatformIsAdmin(
  isSaasMode: boolean,
  user: { id?: string; email?: string } | null | undefined
): boolean {
  return isSaasMode ? Boolean(user) : false;
}

function readOrganizationName(
  userMetadata: Record<string, unknown> | undefined
): string | null {
  if (!userMetadata) return null;
  for (const key of ['organization_name', 'company_name', 'org_name'] as const) {
    const value = userMetadata[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function resolvePlatformShopName(
  userMetadata: Record<string, unknown> | undefined,
  fallback: string
): string {
  return readOrganizationName(userMetadata) ?? fallback;
}
