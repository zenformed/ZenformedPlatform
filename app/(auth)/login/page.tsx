'use client';

import { Suspense, useState, type ReactElement } from 'react';
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
import { PlatformAuthPageShell } from '@/presentation/components/PlatformAuthPageShell';
import { usePlatformAuth } from '@/presentation/hooks/usePlatformAuth';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import pageStyles from '@/presentation/components/platformAuthPage.module.css';

function LoginPageContent(): ReactElement {
  const { signIn, waitForSessionSync, isLoading } = usePlatformAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const authEntryParams = parseAuthEntryQueryParams(searchParams);
  const redirectTarget = resolvePostAuthRedirectTarget(authEntryParams, nav.routes.dashboard);

  async function handleSubmit(email: string, password: string): Promise<void> {
    setLoggingIn(true);
    setLoginError(null);
    try {
      const result = await signIn(email, password);
      if (result.ok) {
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

  return (
    <PlatformAuthPageShell
      cardTitle="Sign in"
      loading={isLoading || loggingIn}
      loadingMessage={isLoading ? 'Checking session…' : 'Logging in…'}
    >
      {!isLoading && !loggingIn ? (
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
