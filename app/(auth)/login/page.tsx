'use client';

import { Suspense, useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_AUTH_LABELS,
  ZenformedAuthNavLink,
  ZenformedAuthPageLinks,
  ZenformedLoginForm,
  buildAuthEntryHref,
  parseAuthEntryQueryParams,
  resolvePostAuthRedirectTarget,
} from '@zenformed/core/auth';
import {
  isBuildCoreAuthAppHandoff,
  performBuildCoreLaunchHandoff,
} from '@/infrastructure/auth/platformBuildCoreLaunchHandoff';
import { getSupabaseClient } from '@/infrastructure/supabase/supabaseClient';
import { PlatformAuthPageShell } from '@/presentation/components/PlatformAuthPageShell';
import { usePlatformAuth } from '@/presentation/hooks/usePlatformAuth';
import { platformAppDefinition } from '@/platform/appDefinitions/platform';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import pageStyles from '@/presentation/components/platformAuthPage.module.css';

function LoginPageContent(): ReactElement {
  const { signIn, waitForSessionSync, isLoading, session } = usePlatformAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loggingIn, setLoggingIn] = useState(false);
  const [handoffPending, setHandoffPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const handoffStartedRef = useRef(false);

  const authEntryParams = parseAuthEntryQueryParams(searchParams);
  const isBuildCoreHandoff = isBuildCoreAuthAppHandoff(authEntryParams);
  const redirectTarget = resolvePostAuthRedirectTarget(authEntryParams, nav.routes.dashboard);

  const runBuildCoreHandoff = useCallback(async (): Promise<boolean> => {
    if (handoffStartedRef.current) return true;
    handoffStartedRef.current = true;
    setHandoffPending(true);
    setLoginError(null);

    try {
      await waitForSessionSync();
      const {
        data: { session: activeSession },
      } = await getSupabaseClient().auth.getSession();
      const accessToken = activeSession?.access_token?.trim() ?? '';
      if (!accessToken) {
        handoffStartedRef.current = false;
        setHandoffPending(false);
        setLoginError('Could not open BuildCore.');
        return false;
      }

      const handoff = await performBuildCoreLaunchHandoff(accessToken, authEntryParams);
      if (!handoff.ok) {
        handoffStartedRef.current = false;
        setHandoffPending(false);
        setLoginError(handoff.message);
        return false;
      }

      window.location.assign(handoff.launchUrl);
      return true;
    } catch {
      handoffStartedRef.current = false;
      setHandoffPending(false);
      setLoginError('Could not open BuildCore.');
      return false;
    }
  }, [authEntryParams, waitForSessionSync]);

  useEffect(() => {
    if (!isBuildCoreHandoff || isLoading || !session) return;
    void runBuildCoreHandoff();
  }, [isBuildCoreHandoff, isLoading, session, runBuildCoreHandoff]);

  async function handleSubmit(email: string, password: string): Promise<void> {
    setLoggingIn(true);
    setLoginError(null);
    try {
      const result = await signIn(email, password);
      if (result.ok) {
        if (isBuildCoreHandoff) {
          await runBuildCoreHandoff();
          return;
        }

        await waitForSessionSync();
        router.replace(redirectTarget);
        return;
      }
      const errorMessage = result.error ?? 'Sign in failed';
      setLoginError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoggingIn(false);
    }
  }

  const showLoading = isLoading || loggingIn || handoffPending;

  return (
    <PlatformAuthPageShell
      cardTitle={handoffPending ? 'Completing sign-in' : 'Sign in'}
      brandIconId={handoffPending ? 'buildcore' : 'platform'}
      brandName={handoffPending ? 'BuildCore' : platformAppDefinition.displayName}
      loading={showLoading}
      loadingMessage={
        handoffPending ? 'Opening BuildCore…' : isLoading ? 'Checking session…' : 'Logging in…'
      }
    >
      {!showLoading ? (
        <>
          <ZenformedLoginForm onSubmit={handleSubmit} error={loginError} />
          <ZenformedAuthPageLinks>
            <ZenformedAuthNavLink href={buildAuthEntryHref(nav.routes.forgotPassword, authEntryParams)}>
              {DEFAULT_AUTH_LABELS.forgotPassword}
            </ZenformedAuthNavLink>
            <ZenformedAuthNavLink href={buildAuthEntryHref(nav.routes.register, authEntryParams)}>
              {DEFAULT_AUTH_LABELS.registerLink}
            </ZenformedAuthNavLink>
          </ZenformedAuthPageLinks>
        </>
      ) : null}
    </PlatformAuthPageShell>
  );
}

export default function LoginPage(): ReactElement {
  return (
    <Suspense
      fallback={
        <div className={pageStyles.page}>
          <p className={pageStyles.loading}>Loading…</p>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
