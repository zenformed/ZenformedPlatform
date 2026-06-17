import type { SaaSEntitlementSnapshot } from '@zenformed/core';
import { resolvePlatformOrganizationPreferenceOrder } from '@zenformed/core';

/** True when mirrored entitlement_status is the active lifecycle state. */
export function isPlatformEntitlementStatusActive(entitlementStatus: string): boolean {
  return typeof entitlementStatus === 'string' && entitlementStatus.trim().toLowerCase() === 'active';
}

export type PlatformAppEntitlementEffectiveWindow = {
  entitlement_status: string;
  effective_from?: string | null;
  effective_to?: string | null;
  now?: Date;
};

/** Active when status is active and the effective window includes `now`. */
export function isPlatformAppEntitlementCurrentlyActive(
  row: PlatformAppEntitlementEffectiveWindow
): boolean {
  if (!isPlatformEntitlementStatusActive(row.entitlement_status)) return false;

  const now = row.now ?? new Date();

  const effectiveFrom = row.effective_from;
  if (effectiveFrom != null && String(effectiveFrom).trim() !== '') {
    const from = new Date(effectiveFrom);
    if (!Number.isNaN(from.getTime()) && from.getTime() > now.getTime()) return false;
  }

  const effectiveTo = row.effective_to;
  if (effectiveTo != null && String(effectiveTo).trim() !== '') {
    const to = new Date(effectiveTo);
    if (!Number.isNaN(to.getTime()) && to.getTime() <= now.getTime()) return false;
  }

  return true;
}

function resolvePlanCode(planCode: string | null | undefined): string {
  if (planCode == null) return '';
  return String(planCode).trim();
}

/** Maps a platform_app_entitlements row to the runtime entitlement snapshot. */
export function mapPlatformEntitlementRowToSnapshot(
  row: {
    entitlement_status: string;
    plan_code: string | null;
    effective_from?: string | null;
    effective_to?: string | null;
  },
  now?: Date
): SaaSEntitlementSnapshot {
  const subscriptionActive = isPlatformAppEntitlementCurrentlyActive({
    entitlement_status: row.entitlement_status,
    effective_from: row.effective_from ?? null,
    effective_to: row.effective_to ?? null,
    now,
  });

  return {
    subscriptionActive,
    licenseTier: resolvePlanCode(row.plan_code),
    resolutionSource: 'platform_tables',
  };
}

export interface PlatformAppMirrorResolutionDetail {
  snapshot: SaaSEntitlementSnapshot | null;
  resolvedSpine?: { id: string; organization_id: string } | null;
  failureDetail?:
    | 'app_row_missing'
    | 'members_query_failed_or_empty'
    | 'organizations_query_failed_or_empty'
    | 'no_active_organizations_after_sort'
    | 'entitlements_query_failed_or_empty'
    | 'no_entitlement_row_for_preferred_org_chain';
}

export type PlatformAppEntitlementPrefetchedRow = {
  id?: string;
  organization_id: string;
  entitlement_status: string;
  plan_code: string | null;
  effective_from?: string | null;
  effective_to?: string | null;
};

export function resolvePlatformAppEntitlementFromPrefetched(params: {
  userId: string;
  appId: string | null;
  memberRows: { organization_id: string }[] | null;
  orgRows: { id: string; status: string; created_for_user_id: string | null }[] | null;
  entitlementRows: PlatformAppEntitlementPrefetchedRow[] | null;
  memberQueryFailed?: boolean;
  orgQueryFailed?: boolean;
  entitlementQueryFailed?: boolean;
  now?: Date;
}): PlatformAppMirrorResolutionDetail {
  const { userId, appId, now } = params;

  if (appId == null) {
    return { snapshot: null, failureDetail: 'app_row_missing' };
  }

  if (params.memberQueryFailed) {
    return { snapshot: null, failureDetail: 'members_query_failed_or_empty' };
  }
  if (params.orgQueryFailed) {
    return { snapshot: null, failureDetail: 'organizations_query_failed_or_empty' };
  }
  if (params.entitlementQueryFailed) {
    return { snapshot: null, failureDetail: 'entitlements_query_failed_or_empty' };
  }

  const memberRows = params.memberRows ?? [];
  if (memberRows.length === 0) {
    return { snapshot: null, failureDetail: 'members_query_failed_or_empty' };
  }

  const orgRows = params.orgRows ?? [];
  if (orgRows.length === 0) {
    return { snapshot: null, failureDetail: 'organizations_query_failed_or_empty' };
  }

  const sortedOrgIds = resolvePlatformOrganizationPreferenceOrder(orgRows, userId);
  if (sortedOrgIds.length === 0) {
    return { snapshot: null, failureDetail: 'no_active_organizations_after_sort' };
  }

  const entitlementRows = params.entitlementRows ?? [];
  if (entitlementRows.length === 0) {
    return { snapshot: null, failureDetail: 'entitlements_query_failed_or_empty' };
  }

  const byOrgId = new Map(entitlementRows.map((r) => [r.organization_id, r]));

  function snapshotFromRow(
    row: PlatformAppEntitlementPrefetchedRow,
    organizationId: string
  ): PlatformAppMirrorResolutionDetail {
    const sid = row.id != null && String(row.id).trim() !== '' ? String(row.id) : null;
    return {
      snapshot: mapPlatformEntitlementRowToSnapshot(row, now),
      resolvedSpine: sid != null ? { id: sid, organization_id: organizationId } : null,
    };
  }

  for (const organizationId of sortedOrgIds) {
    const row = byOrgId.get(organizationId);
    if (row != null && isPlatformAppEntitlementCurrentlyActive({ ...row, now })) {
      return snapshotFromRow(row, organizationId);
    }
  }

  for (const organizationId of sortedOrgIds) {
    const row = byOrgId.get(organizationId);
    if (row != null) {
      return snapshotFromRow(row, organizationId);
    }
  }

  return { snapshot: null, failureDetail: 'no_entitlement_row_for_preferred_org_chain' };
}
