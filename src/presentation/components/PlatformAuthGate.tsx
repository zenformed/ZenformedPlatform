'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  hasAuthRecoveryCallback,
  isAuthEntryReturnPath,
  parseAuthEntryQueryParams,
  resolvePostAuthRedirectTarget,
} from '@zenformed/core/auth';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import { isBuildCoreAuthAppHandoff } from '@/infrastructure/auth/platformBuildCoreLaunchHandoff';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';

const PUBLIC_PATHS = [
  nav.routes.login,
  nav.routes.register,
  nav.routes.forgotPassword,
  nav.routes.resetPassword,
  nav.routes.authCallback,
  '/auth/google',
  '/products',
  nav.routes.docs,
  nav.routes.checkoutSuccess,
  '/legal',
] as const;

const LoadingShell = (): React.ReactElement => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <p>Loading…</p>
  </div>
);

export interface PlatformAuthGateProps {
  children: React.ReactNode;
}

export function PlatformAuthGate({ children }: PlatformAuthGateProps): React.ReactElement {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { session, user, loading: isLoading } = useSaaSProfile();

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));
  const isHomePath = pathname === nav.routes.home;
  const isLoginPath = pathname?.startsWith(nav.routes.login);
  const isResetPasswordPath = pathname?.startsWith(nav.routes.resetPassword);
  const isForgotPasswordPath = pathname?.startsWith(nav.routes.forgotPassword);
  const isAuthRecoveryPath = isResetPasswordPath || isForgotPasswordPath;
  const hasRecoveryCallback = hasAuthRecoveryCallback();
  const isAuthenticated = session != null && user != null;
  const isAuthEntryPath = pathname != null && isAuthEntryReturnPath(pathname);
  const isOAuthProcessingPath =
    pathname?.startsWith(nav.routes.authCallback) === true ||
    pathname?.startsWith('/auth/google') === true;

  const isBuildCoreLoginHandoff =
    mounted &&
    isLoginPath &&
    isBuildCoreAuthAppHandoff(
      parseAuthEntryQueryParams({
        get: (name) => new URLSearchParams(window.location.search).get(name),
      })
    );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;
    if (isAuthRecoveryPath || hasRecoveryCallback) return;
    // Let /auth/callback finish session exchange + intent resume.
    if (isOAuthProcessingPath) return;

    if (!isAuthenticated) {
      // `/` is a public marketing homepage — do not redirect to login.
      if (isHomePath || isPublicPath) {
        return;
      }
      const returnTo = pathname?.startsWith('/') ? pathname : nav.routes.dashboard;
      // Never encode auth-entry pages as returnTo (e.g. bouncing through /register).
      const safeReturnTo = isAuthEntryReturnPath(returnTo) ? nav.routes.dashboard : returnTo;
      router.replace(`${nav.routes.login}?returnTo=${encodeURIComponent(safeReturnTo)}`);
      return;
    }

    if (isBuildCoreLoginHandoff) {
      // Login page performs cross-app mint + redirect; returnTo is a BuildCore path.
      return;
    }

    if (isLoginPath || isAuthEntryPath) {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const params = new URLSearchParams(search);
      const authEntryParams = parseAuthEntryQueryParams({
        get: (name) => params.get(name),
      });
      if (isLoginPath && isBuildCoreAuthAppHandoff(authEntryParams)) {
        return;
      }
      router.replace(resolvePostAuthRedirectTarget(authEntryParams, nav.routes.dashboard));
    }
  }, [
    mounted,
    isLoading,
    isAuthenticated,
    isPublicPath,
    isHomePath,
    isLoginPath,
    isAuthEntryPath,
    isOAuthProcessingPath,
    isAuthRecoveryPath,
    hasRecoveryCallback,
    isBuildCoreLoginHandoff,
    pathname,
    router,
  ]);

  if (!mounted || isLoading) {
    return <LoadingShell />;
  }

  if (isAuthRecoveryPath || hasRecoveryCallback || isOAuthProcessingPath) {
    return <>{children}</>;
  }

  if (!isAuthenticated && !isPublicPath && !isHomePath) {
    return <LoadingShell />;
  }

  if (isAuthenticated && (isLoginPath || isAuthEntryPath) && !isBuildCoreLoginHandoff) {
    return <LoadingShell />;
  }

  return <>{children}</>;
}
