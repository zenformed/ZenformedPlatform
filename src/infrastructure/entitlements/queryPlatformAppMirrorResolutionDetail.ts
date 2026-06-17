import type { SupabaseClient } from '@supabase/supabase-js';
import { resolvePlatformOrganizationPreferenceOrder } from '@zenformed/core';
import {
  resolvePlatformAppEntitlementFromPrefetched,
  type PlatformAppMirrorResolutionDetail,
} from '@/infrastructure/entitlements/platformAppMirrorResolution';

export type PlatformAppMirrorQueryResult = PlatformAppMirrorResolutionDetail & {
  appId: string | null;
};

export type PlatformAppMirrorResolutionDetailInput = {
  userId: string;
  appSlug: string;
};

export type PlatformAppMirrorResolutionQueryFn = (
  supabase: SupabaseClient,
  input: PlatformAppMirrorResolutionDetailInput
) => Promise<PlatformAppMirrorQueryResult>;

export async function queryPlatformAppMirrorResolutionDetail(
  supabase: SupabaseClient,
  input: PlatformAppMirrorResolutionDetailInput
): Promise<PlatformAppMirrorQueryResult> {
  const { userId, appSlug } = input;

  const { data: appRow, error: appErr } = await supabase
    .from('platform_apps')
    .select('id')
    .eq('slug', appSlug)
    .maybeSingle();

  if (appErr || appRow?.id == null) {
    return { snapshot: null, resolvedSpine: null, appId: null, failureDetail: 'app_row_missing' };
  }

  const appId = appRow.id as string;

  const { data: memberRows, error: memErr } = await supabase
    .from('platform_organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('membership_status', 'active');

  const memberOrgIds =
    !memErr && memberRows != null && memberRows.length > 0
      ? [...new Set(memberRows.map((m) => m.organization_id))]
      : [];

  const { data: orgRows, error: orgErr } =
    memberOrgIds.length > 0
      ? await supabase
          .from('platform_organizations')
          .select('id, status, created_for_user_id')
          .in('id', memberOrgIds)
      : { data: [] as { id: string; status: string; created_for_user_id: string | null }[], error: null };

  const sortedOrgIds =
    orgRows != null && orgRows.length > 0
      ? resolvePlatformOrganizationPreferenceOrder(orgRows, userId)
      : [];

  const { data: entitlementRows, error: entErr } =
    sortedOrgIds.length > 0
      ? await supabase
          .from('platform_app_entitlements')
          .select('id, organization_id, entitlement_status, plan_code, effective_from, effective_to')
          .eq('app_id', appId)
          .in('organization_id', sortedOrgIds)
      : {
          data: [] as {
            id: string;
            organization_id: string;
            entitlement_status: string;
            plan_code: string | null;
            effective_from: string | null;
            effective_to: string | null;
          }[],
          error: null,
        };

  const resolved = resolvePlatformAppEntitlementFromPrefetched({
    userId,
    appId,
    memberRows: memberRows ?? [],
    orgRows: orgRows ?? [],
    entitlementRows: entitlementRows ?? [],
    memberQueryFailed: !!memErr,
    orgQueryFailed: !!orgErr,
    entitlementQueryFailed: !!entErr,
  });

  return { ...resolved, appId };
}
