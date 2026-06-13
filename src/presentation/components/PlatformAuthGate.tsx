'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  hasAuthRecoveryCallback,
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

    if (!isAuthenticated) {
      if (isHomePath) {
        router.replace(nav.routes.login);
        return;
      }
      if (!isPublicPath) {
        const returnTo = pathname?.startsWith('/') ? pathname : nav.routes.dashboard;
        router.replace(`${nav.routes.login}?returnTo=${encodeURIComponent(returnTo)}`);
      }
      return;
    }

    if (isHomePath) {
      router.replace(nav.routes.dashboard);
      return;
    }

    if (isLoginPath) {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const params = new URLSearchParams(search);
      const authEntryParams = parseAuthEntryQueryParams({
        get: (name) => params.get(name),
      });
      if (isBuildCoreAuthAppHandoff(authEntryParams)) {
        // Login page performs cross-app mint + redirect; returnTo is a BuildCore path.
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
    isAuthRecoveryPath,
    hasRecoveryCallback,
    pathname,
    router,
  ]);

  if (!mounted || isLoading) {
    return <LoadingShell />;
  }

  if (isAuthRecoveryPath || hasRecoveryCallback) {
    return <>{children}</>;
  }

  if (!isAuthenticated && !isPublicPath && !isHomePath) {
    return <LoadingShell />;
  }

  if (isAuthenticated && isLoginPath && !isBuildCoreLoginHandoff) {
    return <LoadingShell />;
  }

  if (isAuthenticated && isHomePath) {
    return <LoadingShell />;
  }

  if (!isAuthenticated && isHomePath) {
    return <LoadingShell />;
  }

  return <>{children}</>;
}
