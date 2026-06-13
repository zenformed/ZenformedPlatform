'use client';

import { Suspense, useState, type ReactElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_AUTH_LABELS,
  ZenformedAuthNavLink,
  ZenformedAuthPageLinks,
  ZenformedRegisterForm,
  buildAuthEntryHref,
  parseAuthEntryQueryParams,
  resolvePostAuthRedirectTarget,
} from '@zenformed/core/auth';
import { PlatformAuthPageShell } from '@/presentation/components/PlatformAuthPageShell';
import { usePlatformAuth } from '@/presentation/hooks/usePlatformAuth';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import pageStyles from '@/presentation/components/platformAuthPage.module.css';

function RegisterPageContent(): ReactElement {
  const { signUp, waitForSessionSync, isLoading } = usePlatformAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const authEntryParams = parseAuthEntryQueryParams(searchParams);
  const redirectTarget = resolvePostAuthRedirectTarget(authEntryParams, nav.routes.dashboard);

  async function handleSubmit(input: {
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> {
    setRegistering(true);
    setRegisterError(null);
    try {
      const result = await signUp(input.email, input.password);
      if (!result.ok) {
        const message = result.error ?? 'Could not create account.';
        setRegisterError(message);
        throw new Error(message);
      }
      await waitForSessionSync();
      router.replace(redirectTarget);
    } finally {
      setRegistering(false);
    }
  }

  return (
    <PlatformAuthPageShell
      cardTitle={DEFAULT_AUTH_LABELS.createAccount}
      loading={isLoading || registering}
      loadingMessage={isLoading ? 'Checking session…' : 'Creating account…'}
    >
      {!isLoading && !registering ? (
        <>
          <ZenformedRegisterForm onSubmit={handleSubmit} error={registerError} />
          <ZenformedAuthPageLinks>
            <ZenformedAuthNavLink href={buildAuthEntryHref(nav.routes.login, authEntryParams)}>
              {DEFAULT_AUTH_LABELS.backToSignIn}
            </ZenformedAuthNavLink>
          </ZenformedAuthPageLinks>
        </>
      ) : null}
    </PlatformAuthPageShell>
  );
}

export default function RegisterPage(): ReactElement {
  return (
    <Suspense
      fallback={
        <div className={pageStyles.page}>
          <p className={pageStyles.loading}>Loading…</p>
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
