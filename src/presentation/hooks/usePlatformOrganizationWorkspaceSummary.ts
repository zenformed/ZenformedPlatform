'use client';

import { useMemo } from 'react';
import { useZenformedOrganizationWorkspace } from '@zenformed/core/organization-settings';
import { platformDashboardNavigation as nav } from '@/platform/navigation/platformDashboardNavigation';

export type PlatformOrganizationWorkspaceSummary = {
  readonly isLoading: boolean;
  readonly loadError: string | null;
  readonly hasLiveData: boolean;
  readonly activeMemberCount: number | null;
  readonly pendingInviteCount: number | null;
  readonly seatsAvailable: number | null;
  readonly seatLimit: number | null;
  readonly planName: string | null;
  readonly subscriptionStatus: string | null;
  readonly renewalDateLabel: string | null;
  readonly hasBillingSummary: boolean;
};

function formatMetric(value: number | null, loading: boolean): string {
  if (loading) return '—';
  if (value == null) return '—';
  return String(value);
}

export function formatPlatformDashboardSeatsUsed(
  activeMemberCount: number | null,
  seatLimit: number | null,
  loading: boolean
): string {
  if (loading) return '—';
  if (activeMemberCount == null || seatLimit == null) return '—';
  return `${activeMemberCount} / ${seatLimit}`;
}

export function formatPlatformDashboardSummaryMetric(
  value: number | null,
  loading: boolean
): string {
  return formatMetric(value, loading);
}

function resolveSubscriptionStatus(
  source: string,
  appBreakdown: ReadonlyArray<{ entitlementStatus: string }>
): string {
  const activeEntitlement = appBreakdown.find(
    (entry) =>
      entry.entitlementStatus === 'active' ||
      entry.entitlementStatus === 'subscription_active'
  );
  if (activeEntitlement) return 'Active';
  if (source === 'entitlement_tier') return 'Connected';
  return 'Default tier';
}

export function usePlatformOrganizationWorkspaceSummary(
  getAccessToken: () => string | null,
  enabled: boolean
): PlatformOrganizationWorkspaceSummary {
  const workspace = useZenformedOrganizationWorkspace({
    apiUrls: {
      membershipContext: nav.apis.membershipContext,
      members: nav.apis.organizationMembers,
      invites: nav.apis.organizationInvites,
      seats: nav.apis.organizationSeats,
      appAccess: nav.apis.organizationAppAccess,
      memberRole: nav.apis.organizationMemberRole,
    },
    getAccessToken,
    enabled,
  });

  return useMemo((): PlatformOrganizationWorkspaceSummary => {
    const members = workspace.snapshot?.members ?? null;
    const invites = workspace.snapshot?.invites ?? null;
    const seats = workspace.snapshot?.seats ?? null;

    const activeMemberCount =
      members?.filter((member) => member.status === 'active').length ?? null;
    const pendingInviteCount =
      invites?.filter((invite) => invite.status === 'pending').length ?? null;
    const seatsAvailable =
      seats != null && activeMemberCount != null
        ? Math.max(0, seats.seatLimit - activeMemberCount)
        : null;

    const planName = seats?.planName?.trim() || null;
    const hasBillingSummary =
      workspace.hasLiveData && seats != null && seats.seatLimit > 0 && planName != null;

    const subscriptionStatus = hasBillingSummary
      ? resolveSubscriptionStatus(seats.source, seats.appBreakdown)
      : null;

    return {
      isLoading: workspace.isLoading,
      loadError: workspace.loadError,
      hasLiveData: workspace.hasLiveData,
      activeMemberCount,
      pendingInviteCount,
      seatsAvailable,
      seatLimit: seats?.seatLimit ?? null,
      planName,
      subscriptionStatus,
      renewalDateLabel: null,
      hasBillingSummary,
    };
  }, [workspace.hasLiveData, workspace.isLoading, workspace.loadError, workspace.snapshot]);
}
