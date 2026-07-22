'use client';

import { useMemo, type ReactElement } from 'react';
import { useZenformedOrganizationWorkspace } from '@zenformed/core/organization-settings';
import {
  formatOrganizationRoleLabel,
  getUserInitials,
  userCircleColor,
} from '@zenformed/core/dashboard-shell';
import {
  PRESENCE_EFFECTIVE_STATUS_LABELS,
  ZenformedPresenceAvatarBadge,
  useUserPresence,
} from '@zenformed/core/presence';
import { platformDashboardNavigation as nav } from '@/platform/navigation/platformDashboardNavigation';
import styles from './PlatformCollapsibleSidebar.module.css';

export type PlatformSidebarTeamSectionProps = {
  readonly getAccessToken: () => string | null;
  readonly enabled?: boolean;
};

/** Capitalize the first letter of each whitespace-separated word. */
function toTitleCaseName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function memberDisplayName(name: string): { firstLast: string; initialsSource: string } {
  const trimmed = toTitleCaseName(name) || 'Member';
  return { firstLast: trimmed, initialsSource: trimmed };
}

type TeamMemberRow = {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly email: string | null;
  readonly role: string;
  readonly roleLabel: string;
};

/**
 * Host-supplied Team section: active organization members (excluding current user).
 * Keep mounted across sidebar expand/collapse — do not recreate its element each render.
 */
export function PlatformSidebarTeamSection({
  getAccessToken,
  enabled = true,
}: PlatformSidebarTeamSectionProps): ReactElement {
  const workspace = useZenformedOrganizationWorkspace({
    apiUrls: {
      membershipContext: nav.apis.membershipContext,
      members: nav.apis.organizationMembers,
      invites: nav.apis.organizationInvites,
      seats: nav.apis.organizationSeats,
      appEntitlements: nav.apis.organizationAppEntitlements,
      memberRole: nav.apis.organizationMemberRole,
    },
    getAccessToken,
    enabled,
  });

  const members = useMemo((): readonly TeamMemberRow[] => {
    const list = workspace.snapshot?.members ?? [];
    const currentUserId = workspace.snapshot?.membershipContext?.currentUserId?.trim() || null;
    return list
      .filter((row) => {
        if (row.status !== 'active') return false;
        if (currentUserId && row.userId === currentUserId) return false;
        return true;
      })
      .map((member) => {
        const name =
          [member.firstName, member.lastName].filter(Boolean).join(' ').trim() ||
          member.displayName ||
          member.email ||
          'Member';
        return {
          id: member.id,
          userId: member.userId,
          name,
          email: member.email,
          role: member.role,
          roleLabel: formatOrganizationRoleLabel(member.role) ?? member.role,
        };
      });
  }, [workspace.snapshot]);

  if (workspace.isLoading && members.length === 0) {
    return <p className={styles.teamHint}>Loading team…</p>;
  }

  if (members.length === 0) {
    return <p className={styles.teamHint}>No team members yet.</p>;
  }

  return (
    <ul className={styles.teamList} aria-label="Organization team members">
      {members.map((member) => (
        <PlatformSidebarTeamMemberRow key={member.id} member={member} />
      ))}
    </ul>
  );
}

function PlatformSidebarTeamMemberRow({
  member,
}: {
  readonly member: TeamMemberRow;
}): ReactElement {
  const { firstLast, initialsSource } = memberDisplayName(member.name);
  const email = member.email ?? member.id;
  const status = useUserPresence(member.userId);
  const statusLabel = PRESENCE_EFFECTIVE_STATUS_LABELS[status];

  return (
    <li className={styles.teamRow} title={`${firstLast} · ${statusLabel}`}>
      <ZenformedPresenceAvatarBadge status={status} announceDot={false}>
        <span
          className={styles.teamAvatar}
          style={{ backgroundColor: userCircleColor(email) }}
          aria-hidden
        >
          {getUserInitials({ email }, initialsSource)}
        </span>
      </ZenformedPresenceAvatarBadge>
      <span className={styles.teamMeta}>
        <span className={styles.teamName}>{firstLast}</span>
        <span className={styles.teamRolePill} data-role={member.role}>
          {member.roleLabel}
        </span>
        <span className={styles.teamPresenceSrOnly}>{statusLabel}</span>
      </span>
    </li>
  );
}
