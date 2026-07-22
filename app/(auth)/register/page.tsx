'use client';

import { Suspense, useState, type ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DEFAULT_AUTH_LABELS,
  ZenformedAuthMethodDivider,
  ZenformedAuthNavLink,
  ZenformedAuthPageLinks,
  ZenformedGoogleSignInButton,
  ZenformedRegisterForm,
  authFormStyles,
  buildAuthEntryHref,
  parseAuthEntryQueryParams,
  saveZenformedOAuthIntentFromAuthEntry,
} from '@zenformed/core/auth';
import { extractInviteTokenFromReturnPath } from '@/infrastructure/auth/oauthInviteResume';
import { logOAuthDebug } from '@/infrastructure/auth/completePlatformGoogleOAuth';
import { PlatformAuthPageShell } from '@/presentation/components/PlatformAuthPageShell';
import { resolvePlatformRegistrationEmailRedirectUrl } from '@/infrastructure/auth/platformRegistrationEmailRedirect';
import { usePlatformAuth } from '@/presentation/hooks/usePlatformAuth';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import pageStyles from '@/presentation/components/platformAuthPage.module.css';

function RegisterPageContent(): ReactElement {
  const { signUp, signInWithGoogleOAuth, isLoading } = usePlatformAuth();
  const searchParams = useSearchParams();
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const authEntryParams = parseAuthEntryQueryParams(searchParams);

  async function handleSubmit(input: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
  }): Promise<void> {
    setRegistering(true);
    setRegisterError(null);
    setGoogleError(null);
    try {
      const result = await signUp(input.email, input.password, {
        firstName: input.firstName,
        lastName: input.lastName,
        bootstrapDefaultOrganization: true,
        requireEmailConfirmation: true,
        emailRedirectTo: resolvePlatformRegistrationEmailRedirectUrl(),
      });
      if (result.ok && result.pendingEmailVerification) {
        setRegistrationComplete(true);
        return;
      }
      if (!result.ok) {
        const message = result.error ?? 'Could not create account.';
        setRegisterError(message);
        throw new Error(message);
      }
    } finally {
      setRegistering(false);
    }
  }

  async function handleGoogleContinue(): Promise<void> {
    setGoogleError(null);
    setRegisterError(null);
    const inviteToken =
      searchParams.get('inviteToken')?.trim() ||
      extractInviteTokenFromReturnPath(authEntryParams.returnTo ?? authEntryParams.redirect);

    const saved = saveZenformedOAuthIntentFromAuthEntry(authEntryParams, { inviteToken });
    logOAuthDebug('saved OAuth intent', {
      source: 'register',
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

  return (
    <PlatformAuthPageShell
      cardTitle={DEFAULT_AUTH_LABELS.createAccount}
      loading={isLoading || registering}
      loadingMessage={isLoading ? 'Checking session…' : 'Creating account…'}
    >
      {!isLoading && !registering ? (
        registrationComplete ? (
          <>
            <p className={authFormStyles.success} role="status">
              {DEFAULT_AUTH_LABELS.registerEmailVerificationSuccess}
            </p>
            <ZenformedAuthPageLinks align="center">
              <ZenformedAuthNavLink href={buildAuthEntryHref(nav.routes.login, authEntryParams)}>
                {DEFAULT_AUTH_LABELS.backToSignIn}
              </ZenformedAuthNavLink>
            </ZenformedAuthPageLinks>
          </>
        ) : (
          <>
            <ZenformedGoogleSignInButton onContinue={handleGoogleContinue} error={googleError} />
            <ZenformedAuthMethodDivider />
            <ZenformedRegisterForm
              onSubmit={handleSubmit}
              error={registerError}
              collectName
              requireName
            />
            <ZenformedAuthPageLinks>
              <ZenformedAuthNavLink href={buildAuthEntryHref(nav.routes.login, authEntryParams)}>
                {DEFAULT_AUTH_LABELS.backToSignIn}
              </ZenformedAuthNavLink>
            </ZenformedAuthPageLinks>
          </>
        )
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
