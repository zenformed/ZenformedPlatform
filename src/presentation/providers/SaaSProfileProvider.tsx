'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AuthChangeEvent, User } from '@supabase/supabase-js';
import { mapLegacyProfilesFieldsToSnapshot } from '@zenformed/core';
import type { SaaSEntitlementSnapshot, ZenformedCoreOrganizationMembershipContextResponse } from '@/infrastructure/coreApi/types';
import { parseOrganizationMembershipContextJson } from '@/infrastructure/coreApi/parseResponse';
import { runtimeModes } from '@/infrastructure/config/runtimeModes';
import {
  resolveSaasProfileAuthReaction,
  shouldApplyAuthCallbackSession,
  shouldShowSaasProfileFullPageLoading,
  recordSessionInvalidation,
  recordUnexpectedSignedOut,
} from '@zenformed/core';
import { EMPTY_ORGANIZATION_PERMISSIONS } from '@zenformed/core/organization-settings';
import { getSupabaseClient, type Session } from '@/infrastructure/supabase/supabaseClient';

export type LicenseTier = 'STANDARD' | 'PRO';

export type SaaSProfile = {
  id: string;
  email: string | null;
  subscription_status: string;
  license_tier: LicenseTier;
  company_name: string | null;
  industry: string | null;
  force_password_reset: boolean;
  updated_at: string;
};

export type OrganizationMembershipContext = ZenformedCoreOrganizationMembershipContextResponse;

export type MembershipContextStatus = 'pending' | 'ready' | 'failed';

type SaaSProfileContextValue = {
  session: Session | null;
  user: User | null;
  profile: SaaSProfile | null;
  organizationMembershipContext: OrganizationMembershipContext | null;
  membershipContextStatus: MembershipContextStatus;
  entitlementSnapshot: SaaSEntitlementSnapshot | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const SaaSProfileContext = createContext<SaaSProfileContextValue | null>(null);

const MEMBERSHIP_CONTEXT_API = '/api/internal/organizations-me-membership-context';

function hasUsableAccessToken(session: Session | null): session is Session & { access_token: string } {
  return typeof session?.access_token === 'string' && session.access_token.length > 0;
}

async function fetchProfileFromCoreRelay(accessToken: string): Promise<Response> {
  return globalThis.fetch('/api/internal/users-me-profile', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function fetchMembershipContextFromRelay(
  accessToken: string
): Promise<OrganizationMembershipContext | null> {
  try {
    const res = await globalThis.fetch(MEMBERSHIP_CONTEXT_API, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return null;
    }
    if (!res.ok) return null;
    return parseOrganizationMembershipContextJson(json);
  } catch {
    return null;
  }
}

function shouldResolveMembershipContextForSaas(): boolean {
  return runtimeModes.isSaasMode() && !runtimeModes.useMockAuth();
}

export function SaaSProfileProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SaaSProfile | null>(null);
  const [organizationMembershipContext, setOrganizationMembershipContext] =
    useState<OrganizationMembershipContext | null>(null);
  const [membershipContextStatus, setMembershipContextStatus] =
    useState<MembershipContextStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inFlightRef = useRef<Promise<void> | null>(null);
  const bootstrappedUserIdRef = useRef<string | null>(null);
  const profileRef = useRef<SaaSProfile | null>(null);
  const hadAuthenticatedSessionRef = useRef(false);
  profileRef.current = profile;
  if (profile?.id) {
    bootstrappedUserIdRef.current = profile.id;
  }
  if (session != null && user != null) {
    hadAuthenticatedSessionRef.current = true;
  }

  const loadProfile = useCallback(async (options?: { soft?: boolean; force?: boolean }) => {
    const soft = options?.soft ?? false;
    const force = options?.force ?? false;

    const run = async (): Promise<void> => {
      if (shouldShowSaasProfileFullPageLoading(soft, profileRef.current != null)) {
        setLoading(true);
      }
      setError(null);

      const syncMembershipContext = async (
        token: string | null | undefined,
        currentUserId: string | null
      ): Promise<void> => {
        const canRelay =
          runtimeModes.isSaasMode() &&
          !runtimeModes.useMockAuth() &&
          typeof token === 'string' &&
          token.length > 0;
        if (!canRelay) {
          setOrganizationMembershipContext(null);
          setMembershipContextStatus('ready');
          return;
        }
        setMembershipContextStatus('pending');
        const ctx = await fetchMembershipContextFromRelay(token);
        if (ctx == null) {
          setOrganizationMembershipContext({
            hasActiveMembership: false,
            hasNonPersonalOrganizationMembership: false,
            membershipKind: 'none',
            organizationId: null,
            currentUserId: currentUserId ?? '',
            role: null,
            permissions: EMPTY_ORGANIZATION_PERMISSIONS,
          });
          setMembershipContextStatus('failed');
          return;
        }
        setOrganizationMembershipContext(ctx);
        setMembershipContextStatus('ready');
      };

      try {
        const supabase = getSupabaseClient();
        const {
          data: { session: s },
        } = await supabase.auth.getSession();
        setSession(s);
        setUser(s?.user ?? null);
        if (!s?.user) {
          setProfile(null);
          bootstrappedUserIdRef.current = null;
          setOrganizationMembershipContext(null);
          setMembershipContextStatus('ready');
          return;
        }

        if (shouldResolveMembershipContextForSaas()) {
          setOrganizationMembershipContext(null);
          setMembershipContextStatus('pending');
        }

        let activeSession: Session = s;
        const tryZenformedCoreRelay =
          runtimeModes.isSaasMode() &&
          !runtimeModes.useMockAuth() &&
          hasUsableAccessToken(activeSession);

        if (tryZenformedCoreRelay) {
          try {
            let relayRes = await fetchProfileFromCoreRelay(activeSession.access_token);

            if (relayRes.status === 401 || relayRes.status === 403) {
              const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
              if (!refreshError && hasUsableAccessToken(refreshed.session)) {
                activeSession = refreshed.session;
                setSession(refreshed.session);
                setUser(refreshed.session.user);
                relayRes = await fetchProfileFromCoreRelay(refreshed.session.access_token);
              } else {
                // Refresh failed → session revoked/expired. Do not treat a successful
                // refresh followed by a later 403 as session death (permission only).
                recordSessionInvalidation(refreshError, 'ended');
                await supabase.auth.signOut();
                hadAuthenticatedSessionRef.current = false;
                bootstrappedUserIdRef.current = null;
                setSession(null);
                setUser(null);
                setProfile(null);
                setOrganizationMembershipContext(null);
                setMembershipContextStatus('ready');
                return;
              }
            }

            // After a successful refresh, a remaining 401 means the token is still
            // unusable → clear session. A 403 is treated as authorization, not expiry.
            if (relayRes.status === 401) {
              recordSessionInvalidation('access token rejected', 'expired');
              await supabase.auth.signOut();
              hadAuthenticatedSessionRef.current = false;
              bootstrappedUserIdRef.current = null;
              setSession(null);
              setUser(null);
              setProfile(null);
              setOrganizationMembershipContext(null);
              setMembershipContextStatus('ready');
              return;
            }

            if (relayRes.status === 404) {
              if (!soft) {
                setProfile(null);
                bootstrappedUserIdRef.current = null;
                setError(null);
              }
              await syncMembershipContext(activeSession.access_token, activeSession.user.id);
              return;
            }

            if (relayRes.ok) {
              const body = (await relayRes.json()) as {
                relay?: string;
                profile?: SaaSProfile | null;
              };
              if (body.relay === 'zenformed_core' && body.profile != null) {
                setProfile(body.profile);
                bootstrappedUserIdRef.current = activeSession.user.id;
                setError(null);
                await syncMembershipContext(activeSession.access_token, activeSession.user.id);
                return;
              }
            }
          } catch {
            /* fall through to profiles table */
          }
        }

        const { data: p, error: e } = await supabase
          .from('profiles')
          .select(
            'id, email, subscription_status, license_tier, company_name, industry, force_password_reset, updated_at'
          )
          .eq('id', activeSession.user.id)
          .maybeSingle();
        if (e) {
          if (!soft) {
            setError(e.message);
            setProfile(null);
          }
        } else {
          const tier = p?.license_tier === 'PRO' ? 'PRO' : 'STANDARD';
          setProfile(p ? ({ ...p, license_tier: tier } as SaaSProfile) : null);
          if (p) {
            bootstrappedUserIdRef.current = activeSession.user.id;
          } else {
            bootstrappedUserIdRef.current = null;
          }
        }

        await syncMembershipContext(
          hasUsableAccessToken(activeSession) ? activeSession.access_token : null,
          activeSession.user.id
        );
      } catch (err) {
        if (!soft) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (inFlightRef.current != null && !force) {
      return inFlightRef.current;
    }

    const p = run();
    inFlightRef.current = p;
    try {
      await p;
    } finally {
      if (inFlightRef.current === p) {
        inFlightRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    void loadProfile({ soft: false, force: true });
    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession: Session | null) => {
      const reaction = resolveSaasProfileAuthReaction({
        event,
        userId: newSession?.user?.id ?? null,
        profileUserId: profileRef.current?.id ?? null,
        bootstrappedUserId: bootstrappedUserIdRef.current,
        hasProfile: profileRef.current != null,
      });

      const applySession = (): void => {
        if (!shouldApplyAuthCallbackSession(newSession)) return;
        setSession(newSession);
        setUser(newSession.user ?? null);
      };

      switch (reaction) {
        case 'token_only':
        case 'silent_session':
          applySession();
          return;
        case 'sign_out': {
          if (hadAuthenticatedSessionRef.current) {
            recordUnexpectedSignedOut();
          }
          hadAuthenticatedSessionRef.current = false;
          bootstrappedUserIdRef.current = null;
          setSession(null);
          setUser(null);
          setProfile(null);
          setOrganizationMembershipContext(null);
          setMembershipContextStatus('ready');
          setLoading(false);
          setError(null);
          return;
        }
        case 'load_full':
          void loadProfile({
            soft: profileRef.current != null,
            force: profileRef.current == null,
          });
          return;
        case 'load_soft':
          void loadProfile({ soft: true, force: false });
          return;
        default:
          return;
      }
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const entitlementSnapshot = useMemo((): SaaSEntitlementSnapshot | null => {
    if (!profile) return null;
    return mapLegacyProfilesFieldsToSnapshot({
      subscription_status: profile.subscription_status,
      license_tier: profile.license_tier,
    });
  }, [profile]);

  const value = useMemo<SaaSProfileContextValue>(
    () => ({
      session,
      user,
      profile,
      organizationMembershipContext,
      membershipContextStatus,
      entitlementSnapshot,
      loading,
      error,
      refetch: () => loadProfile({ soft: true, force: true }),
    }),
    [
      session,
      user,
      profile,
      organizationMembershipContext,
      membershipContextStatus,
      entitlementSnapshot,
      loading,
      error,
      loadProfile,
    ]
  );

  return <SaaSProfileContext.Provider value={value}>{children}</SaaSProfileContext.Provider>;
}

export function useSaaSProfile(): SaaSProfileContextValue {
  const ctx = useContext(SaaSProfileContext);
  if (ctx == null) {
    throw new Error('useSaaSProfile must be used within SaaSProfileProvider');
  }
  return ctx;
}
