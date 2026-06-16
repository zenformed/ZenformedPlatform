'use client';

import { useZenformedUserAvatar } from '@zenformed/core/dashboard-shell';
import type {
  UseZenformedUserAvatarOptions,
  UseZenformedUserAvatarResult,
  ZenformedUserAvatarIdentity,
} from '@zenformed/core/dashboard-shell';

export interface UseUserAvatarUser {
  email?: string | null;
}

export type UseUserAvatarState = UseZenformedUserAvatarResult;

/**
 * Fetches /api/auth/me for hasPhoto + avatarRevision; loads image via GET /api/auth/avatar.
 */
export function useUserAvatar(
  user: UseUserAvatarUser | null,
  getAccessToken?: () => string | null
): UseUserAvatarState {
  const identity: ZenformedUserAvatarIdentity | null = user?.email ? { email: user.email } : null;
  const options: UseZenformedUserAvatarOptions = getAccessToken ? { getAccessToken } : {};
  return useZenformedUserAvatar(identity, options);
}
