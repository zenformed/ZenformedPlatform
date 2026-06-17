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
  readonly monthlySpendCents: number | null;
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

export function formatPlatformDashboardActiveSubscriptions(
  activeSubscriptionCount: number,
  loading: boolean
): string {
  if (loading) return '—';
  return String(activeSubscriptionCount);
}

export function formatPlatformDashboardMonthlySpend(
  monthlySpendCents: number | null,
  loading: boolean
): string {
  if (loading) return '—';
  if (monthlySpendCents == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monthlySpendCents / 100);
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

    return {
      isLoading: workspace.isLoading,
      loadError: workspace.loadError,
      hasLiveData: workspace.hasLiveData,
      activeMemberCount,
      pendingInviteCount,
      seatsAvailable,
      seatLimit: seats?.seatLimit ?? null,
      monthlySpendCents: null,
    };
  }, [workspace.hasLiveData, workspace.isLoading, workspace.loadError, workspace.snapshot]);
}
