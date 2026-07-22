'use client';

import { Suspense, useEffect, useRef, useState, type ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ZenformedAuthNavLink,
  ZenformedAuthPageLinks,
  authFormStyles,
  parseAuthEntryQueryParams,
  saveZenformedOAuthIntentFromAuthEntry,
  signInWithGoogle,
} from '@zenformed/core/auth';
import { extractInviteTokenFromReturnPath } from '@/infrastructure/auth/oauthInviteResume';
import { logOAuthDebug } from '@/infrastructure/auth/completePlatformGoogleOAuth';
import { resolvePlatformGoogleOAuthCallbackUrl } from '@/infrastructure/auth/platformGoogleOAuthCallbackUrl';
import { getSupabaseClient } from '@/infrastructure/supabase/supabaseClient';
import { PlatformAuthPageShell } from '@/presentation/components/PlatformAuthPageShell';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import pageStyles from '@/presentation/components/platformAuthPage.module.css';

/**
 * Cross-app entry (e.g. BuildCore invite): save OAuth intent from query, then start Google OAuth.
 * Login/register pages start OAuth inline; this route avoids an extra click when coming from BuildCore.
 */
function GoogleAuthStartContent(): ReactElement {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    void (async () => {
      try {
        const authEntryParams = parseAuthEntryQueryParams(searchParams);
        const inviteToken =
          searchParams.get('inviteToken')?.trim() ||
          extractInviteTokenFromReturnPath(authEntryParams.returnTo ?? authEntryParams.redirect);

        const saved = saveZenformedOAuthIntentFromAuthEntry(authEntryParams, {
          inviteToken,
        });
        logOAuthDebug('saved OAuth intent', {
          source: 'auth/google',
          app: saved.app,
          plan: saved.plan,
          returnTo: saved.returnTo,
          redirect: saved.redirect,
          inviteTokenPresent: saved.inviteToken != null,
        });

        const result = await signInWithGoogle(getSupabaseClient(), {
          redirectTo: resolvePlatformGoogleOAuthCallbackUrl(),
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        window.location.assign(result.url);
      } catch {
        setError('Could not start Google sign-in.');
      }
    })();
  }, [searchParams]);

  if (error) {
    return (
      <PlatformAuthPageShell cardTitle="Sign-in error">
        <p className={authFormStyles.error} role="alert">
          {error}
        </p>
        <ZenformedAuthPageLinks align="center">
          <ZenformedAuthNavLink href={nav.routes.login}>Back to sign in</ZenformedAuthNavLink>
        </ZenformedAuthPageLinks>
      </PlatformAuthPageShell>
    );
  }

  return (
    <PlatformAuthPageShell
      cardTitle="Continue with Google"
      loading
      loadingMessage="Redirecting to Google…"
    >
      {null}
    </PlatformAuthPageShell>
  );
}

export default function GoogleAuthStartPage(): ReactElement {
  return (
    <Suspense
      fallback={
        <div className={pageStyles.page}>
          <p className={pageStyles.loading}>Redirecting to Google…</p>
        </div>
      }
    >
      <GoogleAuthStartContent />
    </Suspense>
  );
}
