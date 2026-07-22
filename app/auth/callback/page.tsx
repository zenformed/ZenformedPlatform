'use client';

import { Suspense, useEffect, useRef, useState, type ReactElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ZenformedAuthNavLink,
  ZenformedAuthPageLinks,
  authFormStyles,
} from '@zenformed/core/auth';
import { completePlatformGoogleOAuthSession } from '@/infrastructure/auth/completePlatformGoogleOAuth';
import { getSupabaseClient } from '@/infrastructure/supabase/supabaseClient';
import { PlatformAuthPageShell } from '@/presentation/components/PlatformAuthPageShell';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import pageStyles from '@/presentation/components/platformAuthPage.module.css';

function readOAuthCallbackError(searchParams: URLSearchParams): string | null {
  const error = searchParams.get('error')?.trim();
  const description = searchParams.get('error_description')?.trim();
  if (!error && !description) return null;

  const combined = [error, description].filter(Boolean).join(': ');
  const lower = combined.toLowerCase();
  if (
    lower.includes('identity') ||
    lower.includes('already been registered') ||
    lower.includes('manual linking') ||
    lower.includes('email link')
  ) {
    return 'This Google account could not be linked to an existing Zenformed login. Sign in with email and password, or use the Google account that matches your Zenformed email.';
  }
  return description || error || 'Google sign-in failed.';
}

function AuthCallbackContent(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const oauthError = readOAuthCallbackError(
      new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    );
    if (oauthError) {
      setError(oauthError);
      return;
    }

    void (async () => {
      try {
        const supabase = getSupabaseClient();
        const code = searchParams.get('code')?.trim() ?? '';

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            const message = exchangeError.message || 'Could not complete Google sign-in.';
            const lower = message.toLowerCase();
            if (
              lower.includes('identity') ||
              lower.includes('already') ||
              lower.includes('linking')
            ) {
              setError(
                'This Google account could not be linked to an existing Zenformed login. Sign in with email and password, or use the Google account that matches your Zenformed email.'
              );
              return;
            }
            setError(message);
            return;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        const accessToken = session?.access_token?.trim() ?? '';
        if (!accessToken) {
          setError('Google sign-in did not establish a session. Please try again.');
          return;
        }

        const result = await completePlatformGoogleOAuthSession(accessToken, {
          userId: session?.user?.id ?? null,
          userEmail: session?.user?.email ?? null,
        });
        if (!result.ok) {
          setError(result.message);
          return;
        }

        if (result.kind === 'buildcore') {
          window.location.assign(result.launchUrl);
          return;
        }

        router.replace(result.href);
      } catch {
        setError('Google sign-in failed. Please try again.');
      }
    })();
  }, [router, searchParams]);

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
      cardTitle="Completing sign-in"
      loading
      loadingMessage="Finishing Google sign-in…"
    >
      {null}
    </PlatformAuthPageShell>
  );
}

export default function AuthCallbackPage(): ReactElement {
  return (
    <Suspense
      fallback={
        <div className={pageStyles.page}>
          <p className={pageStyles.loading}>Finishing Google sign-in…</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
