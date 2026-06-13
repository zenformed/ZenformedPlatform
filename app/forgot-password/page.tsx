'use client';

import { useCallback, type ReactElement } from 'react';
import { DEFAULT_AUTH_LABELS, ZenformedForgotPasswordForm } from '@zenformed/core/auth';
import { PlatformAuthPageShell } from '@/presentation/components/PlatformAuthPageShell';
import { requestPlatformPasswordResetEmail } from '@/infrastructure/auth/requestPlatformPasswordResetEmail';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';

export default function ForgotPasswordPage(): ReactElement {
  const handleRequestReset = useCallback(
    (email: string) => requestPlatformPasswordResetEmail(email),
    []
  );

  return (
    <PlatformAuthPageShell cardTitle={DEFAULT_AUTH_LABELS.forgotPasswordTitle}>
      <ZenformedForgotPasswordForm
        loginHref={nav.routes.login}
        onRequestReset={handleRequestReset}
      />
    </PlatformAuthPageShell>
  );
}
