import type {

  ZenformedCoreOrganizationBranding,

  ZenformedCoreOrganizationInvite,

  ZenformedCoreOrganizationInvitesResponse,

  ZenformedCoreOrganizationInviteMutationResponse,

  ZenformedCoreOrganizationMemberProfileUpdateResponse,

  ZenformedCoreOrganizationMemberRemoveResponse,

  ZenformedCoreOrganizationMemberRoleUpdateResponse,

  ZenformedCoreOrganizationMembersResponse,

  ZenformedCoreOrganizationMembershipContextResponse,

  ZenformedCoreOrganizationSeatsResponse,

  ZenformedCoreProfileEnvelope,

  ZenformedCoreUserAvatarMeta,

  ZenformedCoreUserSettingsEnvelope,

} from '@/infrastructure/coreApi/types';



export function parseProfileEnvelopeJson(body: unknown): ZenformedCoreProfileEnvelope | null {

  if (body == null || typeof body !== 'object') return null;

  const o = body as Record<string, unknown>;

  const profile = o.profile;

  if (profile == null || typeof profile !== 'object') return null;

  const p = profile as Record<string, unknown>;

  if (typeof p.id !== 'string') return null;

  if (typeof p.subscription_status !== 'string') return null;

  if (p.license_tier !== 'STANDARD' && p.license_tier !== 'PRO') return null;

  if (typeof p.force_password_reset !== 'boolean') return null;

  if (typeof p.updated_at !== 'string') return null;

  const email = p.email;

  const company = p.company_name;

  const industry = p.industry;

  if (email != null && typeof email !== 'string') return null;

  if (company != null && typeof company !== 'string') return null;

  if (industry != null && typeof industry !== 'string') return null;

  return {

    profile: {

      id: p.id,

      email: email == null ? null : email,

      subscription_status: p.subscription_status,

      license_tier: p.license_tier,

      company_name: company == null ? null : company,

      industry: industry == null ? null : industry,

      force_password_reset: p.force_password_reset,

      updated_at: p.updated_at,

    },

  };

}



export function parseUserSettingsEnvelopeJson(body: unknown): ZenformedCoreUserSettingsEnvelope | null {

  if (body == null || typeof body !== 'object') return null;

  const o = body as Record<string, unknown>;

  const settings = o.settings;

  if (settings == null || typeof settings !== 'object') return null;

  const s = settings as Record<string, unknown>;

  const email = s.email;

  if (email != null && typeof email !== 'string') return null;

  const firstName = s.firstName;

  if (firstName != null && typeof firstName !== 'string') return null;

  const lastName = s.lastName;

  if (lastName != null && typeof lastName !== 'string') return null;

  if (typeof s.marketingEmailOptIn !== 'boolean') return null;

  if (typeof s.smsOptIn !== 'boolean') return null;

  return {

    settings: {

      email: email ?? null,

      firstName: firstName ?? null,

      lastName: lastName ?? null,

      marketingEmailOptIn: s.marketingEmailOptIn,

      smsOptIn: s.smsOptIn,

    },

  };

}



export function parseOrganizationBrandingJson(body: unknown): ZenformedCoreOrganizationBranding | null {

  if (body == null || typeof body !== 'object') return null;

  const o = body as Record<string, unknown>;

  if (typeof o.organizationId !== 'string') return null;

  if (typeof o.legalName !== 'string') return null;

  if (typeof o.publicDisplayName !== 'string') return null;

  if (typeof o.hasLogo !== 'boolean') return null;

  if (typeof o.canEditOrganizationProfile !== 'boolean') return null;

  const displayName = o.displayName;

  if (displayName != null && typeof displayName !== 'string') return null;

  const industry = o.industry;

  const timezone = o.timezone;

  if (industry != null && typeof industry !== 'string') return null;

  if (timezone != null && typeof timezone !== 'string') return null;

  const logoContentType = o.logoContentType;

  const logoUpdatedAt = o.logoUpdatedAt;

  const revision = o.revision;

  if (logoContentType != null && typeof logoContentType !== 'string') return null;

  if (logoUpdatedAt != null && typeof logoUpdatedAt !== 'string') return null;

  if (revision != null && typeof revision !== 'string') return null;

  return {

    organizationId: o.organizationId,

    legalName: o.legalName,

    displayName: typeof displayName === 'string' ? displayName : null,

    publicDisplayName: o.publicDisplayName,

    industry: typeof industry === 'string' ? industry : null,

    timezone: typeof timezone === 'string' ? timezone : null,

    hasLogo: o.hasLogo,

    canEditOrganizationProfile: o.canEditOrganizationProfile,

    ...(typeof logoContentType === 'string' ? { logoContentType } : {}),

    ...(typeof logoUpdatedAt === 'string' ? { logoUpdatedAt } : {}),

    ...(typeof revision === 'string' ? { revision } : {}),

  };

}



function parseOrganizationMemberRole(

  raw: unknown

): ZenformedCoreOrganizationMembershipContextResponse['role'] | null {

  if (raw === 'owner' || raw === 'admin' || raw === 'coordinator' || raw === 'member') {

    return raw;

  }

  return null;

}



function parseOrganizationPermissionsJson(

  body: unknown

): ZenformedCoreOrganizationMembershipContextResponse['permissions'] | null {

  if (body == null || typeof body !== 'object') return null;

  const o = body as Record<string, unknown>;

  const keys = [

    'canViewOrganizationSettings',

    'canEditOrganizationProfile',

    'canViewTeamMembers',

    'canInviteMembers',

    'canCancelInvites',

    'canManageMemberRoles',

    'canRemoveMembers',

    'canManageMemberProfiles',

    'canViewAppsBilling',

    'canEditAccountEmail',

  ] as const;

  for (const key of keys) {

    if (typeof o[key] !== 'boolean') return null;

  }

  return o as ZenformedCoreOrganizationMembershipContextResponse['permissions'];

}



export function parseOrganizationMembershipContextJson(

  body: unknown

): ZenformedCoreOrganizationMembershipContextResponse | null {

  if (body == null || typeof body !== 'object') return null;

  const o = body as Record<string, unknown>;

  if (typeof o.hasActiveMembership !== 'boolean') return null;

  if (typeof o.hasNonPersonalOrganizationMembership !== 'boolean') return null;

  const kind = o.membershipKind;

  if (

    kind !== 'none' &&

    kind !== 'organization_bootstrap_owner' &&

    kind !== 'invited_member'

  ) {

    return null;

  }

  if (typeof o.currentUserId !== 'string') return null;

  const permissions = parseOrganizationPermissionsJson(o.permissions);

  if (permissions == null) return null;

  const role =

    o.role === null || o.role === undefined ? null : parseOrganizationMemberRole(o.role);

  if (o.role != null && role == null) return null;

  return {

    hasActiveMembership: o.hasActiveMembership,

    hasNonPersonalOrganizationMembership: o.hasNonPersonalOrganizationMembership,

    membershipKind: kind,

    organizationId: typeof o.organizationId === 'string' ? o.organizationId : null,

    currentUserId: o.currentUserId,

    role,

    permissions,

  };

}



function parseOrganizationMemberRecord(
  row: unknown
): ZenformedCoreOrganizationMembersResponse['members'][number] | null {
  if (row == null || typeof row !== 'object') return null;
  const m = row as Record<string, unknown>;
  if (typeof m.id !== 'string' || typeof m.userId !== 'string') return null;
  if (typeof m.displayName !== 'string') return null;
  if (m.firstName != null && typeof m.firstName !== 'string') return null;
  if (m.lastName != null && typeof m.lastName !== 'string') return null;
  if (m.email != null && typeof m.email !== 'string') return null;
  const role = parseOrganizationMemberRole(m.role);
  if (role == null) return null;
  if (m.status !== 'active' && m.status !== 'invited' && m.status !== 'removed') return null;
  return {
    id: m.id,
    userId: m.userId,
    displayName: m.displayName,
    firstName: m.firstName ?? null,
    lastName: m.lastName ?? null,
    email: m.email ?? null,
    role,
    status: m.status,
  };
}

export function parseOrganizationMembersJson(
  body: unknown
): ZenformedCoreOrganizationMembersResponse | null {
  if (body == null || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  if (typeof o.organizationId !== 'string') return null;
  if (!Array.isArray(o.members)) return null;
  const members: ZenformedCoreOrganizationMembersResponse['members'] = [];
  for (const m of o.members) {
    const parsed = parseOrganizationMemberRecord(m);
    if (parsed == null) return null;
    members.push(parsed);
  }
  return { organizationId: o.organizationId, members };
}

function parseOrganizationInviteRecord(row: unknown): ZenformedCoreOrganizationInvite | null {
  if (row == null || typeof row !== 'object') return null;
  const inv = row as Record<string, unknown>;
  if (typeof inv.id !== 'string' || typeof inv.email !== 'string') return null;
  if (typeof inv.displayName !== 'string') return null;
  if (
    inv.status !== 'pending' &&
    inv.status !== 'accepted' &&
    inv.status !== 'revoked' &&
    inv.status !== 'expired' &&
    inv.status !== 'canceled'
  ) {
    return null;
  }
  const role = parseOrganizationMemberRole(inv.role);
  if (role == null) return null;
  if (inv.invitedBy != null && typeof inv.invitedBy !== 'string') return null;
  if (inv.expiresAt != null && typeof inv.expiresAt !== 'string') return null;
  if (inv.firstName != null && typeof inv.firstName !== 'string') return null;
  if (inv.lastName != null && typeof inv.lastName !== 'string') return null;
  if (typeof inv.createdAt !== 'string' || typeof inv.sentLabel !== 'string') return null;
  if (
    inv.emailDeliveryStatus != null &&
    inv.emailDeliveryStatus !== 'sent' &&
    inv.emailDeliveryStatus !== 'failed'
  ) {
    return null;
  }
  return {
    id: inv.id,
    email: inv.email,
    firstName: inv.firstName ?? null,
    lastName: inv.lastName ?? null,
    displayName: inv.displayName,
    status: inv.status,
    role,
    invitedBy: inv.invitedBy ?? null,
    expiresAt: inv.expiresAt ?? null,
    createdAt: inv.createdAt,
    sentLabel: inv.sentLabel,
    emailDeliveryStatus:
      inv.emailDeliveryStatus === 'sent' || inv.emailDeliveryStatus === 'failed'
        ? inv.emailDeliveryStatus
        : null,
  };
}

export function parseOrganizationInvitesJson(
  body: unknown
): ZenformedCoreOrganizationInvitesResponse | null {
  if (body == null || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  if (typeof o.organizationId !== 'string') return null;
  if (!Array.isArray(o.invites)) return null;
  const invites: ZenformedCoreOrganizationInvitesResponse['invites'] = [];
  for (const inv of o.invites) {
    const parsed = parseOrganizationInviteRecord(inv);
    if (parsed == null) return null;
    invites.push(parsed);
  }
  return { organizationId: o.organizationId, invites };
}

export function parseOrganizationInviteMutationJson(
  body: unknown
): ZenformedCoreOrganizationInviteMutationResponse | null {
  if (body == null || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  if (typeof o.organizationId !== 'string') return null;

  if (o.reactivated === true) {
    const member = parseOrganizationMemberRecord(o.member);
    if (member == null) return null;
    if (o.message != null && typeof o.message !== 'string') return null;
    return {
      organizationId: o.organizationId,
      reactivated: true,
      member,
      ...(typeof o.message === 'string' ? { message: o.message } : {}),
    };
  }

  const invite = parseOrganizationInviteRecord(o.invite);
  if (invite == null) return null;
  if (o.acceptUrl != null && typeof o.acceptUrl !== 'string') return null;
  if (
    o.emailDeliveryStatus != null &&
    o.emailDeliveryStatus !== 'sent' &&
    o.emailDeliveryStatus !== 'failed'
  ) {
    return null;
  }
  return {
    organizationId: o.organizationId,
    invite,
    ...(typeof o.acceptUrl === 'string' ? { acceptUrl: o.acceptUrl } : {}),
    ...(o.emailDeliveryStatus === 'sent' || o.emailDeliveryStatus === 'failed'
      ? { emailDeliveryStatus: o.emailDeliveryStatus }
      : {}),
  };
}

export function parseOrganizationMemberRoleUpdateJson(
  body: unknown
): ZenformedCoreOrganizationMemberRoleUpdateResponse | null {
  if (body == null || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  if (typeof o.organizationId !== 'string') return null;
  if (o.member == null || typeof o.member !== 'object') return null;
  const row = o.member as Record<string, unknown>;
  if (typeof row.id !== 'string' || typeof row.userId !== 'string') return null;
  if (typeof row.displayName !== 'string') return null;
  if (row.firstName != null && typeof row.firstName !== 'string') return null;
  if (row.lastName != null && typeof row.lastName !== 'string') return null;
  if (row.email != null && typeof row.email !== 'string') return null;
  const role = parseOrganizationMemberRole(row.role);
  if (role == null) return null;
  if (row.status !== 'active' && row.status !== 'invited' && row.status !== 'removed') return null;
  return {
    organizationId: o.organizationId,
    member: {
      id: row.id,
      userId: row.userId,
      displayName: row.displayName,
      firstName: row.firstName ?? null,
      lastName: row.lastName ?? null,
      email: row.email ?? null,
      role,
      status: row.status,
    },
  };
}

export function parseOrganizationMemberProfileUpdateJson(
  body: unknown
): ZenformedCoreOrganizationMemberProfileUpdateResponse | null {
  return parseOrganizationMemberRoleUpdateJson(body);
}

export function parseOrganizationMemberRemoveJson(
  body: unknown
): ZenformedCoreOrganizationMemberRemoveResponse | null {
  if (body == null || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  if (typeof o.organizationId !== 'string') return null;
  if (typeof o.memberId !== 'string') return null;
  if (o.removed !== true) return null;
  return {
    organizationId: o.organizationId,
    memberId: o.memberId,
    removed: true,
  };
}

export function parseOrganizationSeatsJson(
  body: unknown
): ZenformedCoreOrganizationSeatsResponse | null {
  if (body == null || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  if (typeof o.organizationId !== 'string') return null;
  if (typeof o.seatsUsed !== 'number' || typeof o.seatLimit !== 'number') return null;
  if (typeof o.seatsAvailable !== 'number' || typeof o.source !== 'string') return null;
  if (o.notes != null && typeof o.notes !== 'string') return null;
  if (o.planName != null && typeof o.planName !== 'string') return null;
  if (!Array.isArray(o.appBreakdown)) return null;
  const appBreakdown: ZenformedCoreOrganizationSeatsResponse['appBreakdown'] = [];
  for (const a of o.appBreakdown) {
    if (a == null || typeof a !== 'object') return null;
    const row = a as Record<string, unknown>;
    if (typeof row.appSlug !== 'string' || typeof row.appName !== 'string') return null;
    if (row.planCode != null && typeof row.planCode !== 'string') return null;
    if (typeof row.entitlementStatus !== 'string') return null;
    appBreakdown.push({
      appSlug: row.appSlug,
      appName: row.appName,
      planCode: row.planCode ?? null,
      entitlementStatus: row.entitlementStatus,
    });
  }
  return {
    organizationId: o.organizationId,
    seatsUsed: o.seatsUsed,
    seatLimit: o.seatLimit,
    seatsAvailable: o.seatsAvailable,
    source: o.source,
    notes: o.notes ?? null,
    planName: o.planName ?? null,
    appBreakdown,
  };
}

export function parseUserAvatarMetaJson(body: unknown): ZenformedCoreUserAvatarMeta | null {

  if (body == null || typeof body !== 'object') return null;

  const o = body as Record<string, unknown>;

  if (typeof o.hasAvatar !== 'boolean') return null;

  const contentType = o.contentType;

  const updatedAt = o.updatedAt;

  const revision = o.revision;

  if (contentType != null && typeof contentType !== 'string') return null;

  if (updatedAt != null && typeof updatedAt !== 'string') return null;

  if (revision != null && typeof revision !== 'string') return null;

  return {

    hasAvatar: o.hasAvatar,

    ...(typeof contentType === 'string' ? { contentType } : {}),

    ...(typeof updatedAt === 'string' ? { updatedAt } : {}),

    ...(typeof revision === 'string' ? { revision } : {}),

  };

}
import { parseSaaSEntitlementSnapshotJson } from '@zenformed/core';

export function parseEntitlementSnapshotJson(
  raw: unknown,
  fallbackAppSlug?: string
): import('@/infrastructure/coreApi/types').SaaSEntitlementSnapshot | null {
  return parseSaaSEntitlementSnapshotJson(raw, fallbackAppSlug);
}

export function parseAppEntitlementEnvelopeJson(
  body: unknown
): import('@/infrastructure/coreApi/types').ZenformedCoreAppEntitlementEnvelope | null {
  if (body == null || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  if (typeof o.appSlug !== 'string') return null;
  const ent = parseEntitlementSnapshotJson(o.entitlement, o.appSlug);
  if (ent == null) return null;
  return { appSlug: o.appSlug, entitlement: ent };
}

