'use client';

import { Suspense, useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_AUTH_LABELS,
  ZenformedAuthMethodDivider,
  ZenformedAuthNavLink,
  ZenformedAuthPageLinks,
  ZenformedGoogleSignInButton,
  ZenformedLoginForm,
  buildAuthEntryHref,
  parseAuthEntryQueryParams,
  resolvePostAuthRedirectTarget,
  saveZenformedOAuthIntentFromAuthEntry,
} from '@zenformed/core/auth';
import { extractInviteTokenFromReturnPath } from '@/infrastructure/auth/oauthInviteResume';
import { logOAuthDebug } from '@/infrastructure/auth/completePlatformGoogleOAuth';
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
  const { signIn, signInWithGoogleOAuth, waitForSessionSync, isLoading, session } =
    usePlatformAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loggingIn, setLoggingIn] = useState(false);
  const [handoffPending, setHandoffPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const handoffAttemptedRef = useRef(false);

  const authEntryParams = parseAuthEntryQueryParams(searchParams);
  const isBuildCoreHandoff = isBuildCoreAuthAppHandoff(authEntryParams);
  const redirectTarget = resolvePostAuthRedirectTarget(authEntryParams, nav.routes.dashboard);

  const runBuildCoreHandoff = useCallback(async (): Promise<boolean> => {
    if (handoffAttemptedRef.current) return false;
    handoffAttemptedRef.current = true;
    setHandoffPending(true);
    setLoginError(null);

    try {
      await waitForSessionSync();
      const {
        data: { session: activeSession },
      } = await getSupabaseClient().auth.getSession();
      const accessToken = activeSession?.access_token?.trim() ?? '';
      if (!accessToken) {
        setHandoffPending(false);
        setLoginError('Could not open BuildCore.');
        return false;
      }

      const handoff = await performBuildCoreLaunchHandoff(accessToken, authEntryParams);
      if (!handoff.ok) {
        setHandoffPending(false);
        setLoginError(handoff.message);
        return false;
      }

      window.location.assign(handoff.launchUrl);
      return true;
    } catch {
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
    setGoogleError(null);
    handoffAttemptedRef.current = false;
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

  async function handleGoogleContinue(): Promise<void> {
    setGoogleError(null);
    setLoginError(null);
    const inviteToken =
      searchParams.get('inviteToken')?.trim() ||
      extractInviteTokenFromReturnPath(authEntryParams.returnTo ?? authEntryParams.redirect);

    const saved = saveZenformedOAuthIntentFromAuthEntry(authEntryParams, { inviteToken });
    logOAuthDebug('saved OAuth intent', {
      source: 'login',
      app: saved.app,
      plan: saved.plan,
      returnTo: saved.returnTo,
      redirect: saved.redirect,
      inviteTokenPresent: saved.inviteToken != null,
    });

    const result = await signInWithGoogleOAuth();
    if (!result.ok) {
      setGoogleError(result.error);
      throw new Error(result.error);
    }
    window.location.assign(result.url);
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
          <ZenformedGoogleSignInButton onContinue={handleGoogleContinue} error={googleError} />
          <ZenformedAuthMethodDivider />
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
