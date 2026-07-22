'use client';

import type { ReactElement, ReactNode } from 'react';
import { ZenformedPresenceProvider } from '@zenformed/core/presence';
import { getSupabaseClient } from '@/infrastructure/supabase/supabaseClient';
import { useSaaSProfile } from '@/presentation/providers/SaaSProfileProvider';

export type PlatformPresenceProviderProps = {
  readonly children: ReactNode;
};

/** Organization-scoped Realtime Presence for Platform (shared with BuildCore). */
export function PlatformPresenceProvider({
  children,
}: PlatformPresenceProviderProps): ReactElement {
  const { user, organizationMembershipContext } = useSaaSProfile();
  const organizationId = organizationMembershipContext?.organizationId ?? null;
  const userId =
    organizationMembershipContext?.currentUserId?.trim() || user?.id?.trim() || null;

  return (
    <ZenformedPresenceProvider
      supabase={getSupabaseClient()}
      userId={userId}
      organizationId={organizationId}
      appSlug="platform"
      enabled
    >
      {children}
    </ZenformedPresenceProvider>
  );
}
