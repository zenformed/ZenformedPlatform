import type { SaaSEntitlementSnapshot } from '@zenformed/core';



export type ZenformedCoreProfileDto = {

  id: string;

  email: string | null;

  subscription_status: string;

  license_tier: 'STANDARD' | 'PRO';

  company_name: string | null;

  industry: string | null;

  force_password_reset: boolean;

  updated_at: string;

};



export type ZenformedCoreProfileEnvelope = {

  profile: ZenformedCoreProfileDto;

};



export type ZenformedCoreProfilePatchRequest = {

  companyName?: string;

  industry?: string;

  forcePasswordReset?: false;

};



export type ZenformedCoreUserSettingsDto = {

  email: string | null;

  firstName: string | null;

  lastName: string | null;

  marketingEmailOptIn: boolean;

  smsOptIn: boolean;

};



export type ZenformedCoreUserSettingsEnvelope = {

  settings: ZenformedCoreUserSettingsDto;

};



export type ZenformedCoreUserSettingsPatchRequest = {

  firstName?: string | null;

  lastName?: string | null;

  email?: string | null;

  marketingEmailOptIn?: boolean;

  smsOptIn?: boolean;

};



export type ZenformedCoreUserAvatarMeta = {

  hasAvatar: boolean;

  contentType?: string;

  updatedAt?: string;

  revision?: string;

};



/** `GET|PATCH /users/me/organization/branding` and successful logo PUT/DELETE on ZenformedCore. */

export type ZenformedCoreOrganizationBranding = {

  organizationId: string;

  legalName: string;

  displayName: string | null;

  publicDisplayName: string;

  industry: string | null;

  timezone: string | null;

  hasLogo: boolean;

  canEditOrganizationProfile: boolean;

  logoContentType?: string;

  logoUpdatedAt?: string;

  revision?: string;

};



export type ZenformedCoreOrganizationMemberRole =

  | 'owner'

  | 'admin'

  | 'coordinator'

  | 'member';



export type ZenformedCoreOrganizationPermissions = {

  canViewOrganizationSettings: boolean;

  canEditOrganizationProfile: boolean;

  canViewTeamMembers: boolean;

  canInviteMembers: boolean;

  canCancelInvites: boolean;

  canManageMemberRoles: boolean;

  canRemoveMembers: boolean;

  canManageMemberProfiles: boolean;

  canViewAppsBilling: boolean;

  canEditAccountEmail: boolean;

};



export type OrganizationMembershipKind =

  | 'none'

  | 'organization_bootstrap_owner'

  | 'invited_member';



export type ZenformedCoreOrganizationMembershipContextResponse = {

  hasActiveMembership: boolean;

  hasNonPersonalOrganizationMembership: boolean;

  membershipKind: OrganizationMembershipKind;

  organizationId: string | null;

  currentUserId: string;

  role: ZenformedCoreOrganizationMemberRole | null;

  permissions: ZenformedCoreOrganizationPermissions;

};



/** `GET /organizations/me/members` */
export type ZenformedCoreOrganizationMembersResponse = {
  organizationId: string;
  members: Array<{
    id: string;
    userId: string;
    displayName: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    role: ZenformedCoreOrganizationMemberRole;
    status: 'active' | 'invited' | 'removed';
  }>;
};

/** Shared invite record shape for organization workspace APIs. */
export type ZenformedCoreOrganizationInvite = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired' | 'canceled';
  role: ZenformedCoreOrganizationMemberRole;
  invitedBy: string | null;
  expiresAt: string | null;
  createdAt: string;
  sentLabel: string;
  emailDeliveryStatus?: 'sent' | 'failed' | null;
};

/** `GET /organizations/me/invites` */
export type ZenformedCoreOrganizationInvitesResponse = {
  organizationId: string;
  invites: ZenformedCoreOrganizationInvite[];
};

/** `POST /organizations/me/invites`, `PATCH /organizations/me/invites/:id/cancel` */
export type ZenformedCoreOrganizationInviteMutationResponse = {
  organizationId: string;
  invite: ZenformedCoreOrganizationInvite;
  acceptUrl?: string;
  emailDeliveryStatus?: 'sent' | 'failed';
};

export type ZenformedCoreOrganizationInviteCreateRequest = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: 'admin' | 'coordinator' | 'member';
};

/** `PATCH /organizations/me/members/:memberId/role` */
export type ZenformedCoreOrganizationMemberRoleUpdateRequest = {
  role: 'admin' | 'coordinator' | 'member';
};

export type ZenformedCoreOrganizationMemberRoleUpdateResponse = {
  organizationId: string;
  member: ZenformedCoreOrganizationMembersResponse['members'][number];
};

/** `DELETE /organizations/me/members/:memberId` */
export type ZenformedCoreOrganizationMemberRemoveResponse = {
  organizationId: string;
  memberId: string;
  removed: true;
};

/** `PATCH /organizations/me/members/:memberId` */
export type ZenformedCoreOrganizationMemberProfileUpdateRequest = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

export type ZenformedCoreOrganizationMemberProfileUpdateResponse = {
  organizationId: string;
  member: ZenformedCoreOrganizationMembersResponse['members'][number];
};

/** `GET /organizations/me/seats` */
export type ZenformedCoreOrganizationSeatsResponse = {
  organizationId: string;
  seatsUsed: number;
  seatLimit: number;
  seatsAvailable: number;
  source: string;
  notes: string | null;
  planName: string | null;
  appBreakdown: Array<{
    appSlug: string;
    appName: string;
    planCode: string | null;
    entitlementStatus: string;
  }>;
};

export type CoreApiError =

  | { kind: 'unconfigured' }

  | { kind: 'http_error'; status: number; body?: unknown }

  | { kind: 'timeout' }

  | { kind: 'network'; message?: string }

  | { kind: 'invalid_payload' };



export type CoreApiResult<T> =

  | { ok: true; data: T }

  | { ok: false; error: CoreApiError };



export type { SaaSEntitlementSnapshot };


