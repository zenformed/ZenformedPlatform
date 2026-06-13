'use client';

import { type ReactElement } from 'react';
import {
  DEFAULT_AUTH_LABELS,
  ZenformedAuthNavLink,
  ZenformedAuthPageLinks,
  ZenformedRecoveryPasswordForm,
  authFormStyles as formStyles,
  updateRecoveredPassword,
  useZenformedPasswordRecoveryStatus,
} from '@zenformed/core/auth';
import { PlatformAuthPageShell } from '@/presentation/components/PlatformAuthPageShell';
import { getSupabaseClient } from '@/infrastructure/supabase/supabaseClient';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';

export default function ResetPasswordPage(): ReactElement {
  const supabase = getSupabaseClient();
  const status = useZenformedPasswordRecoveryStatus(supabase);

  if (status === 'loading') {
    return (
      <PlatformAuthPageShell
        cardTitle={DEFAULT_AUTH_LABELS.resetPasswordTitle}
        loading
        loadingMessage="Verifying reset link…"
      >
        {null}
      </PlatformAuthPageShell>
    );
  }

  if (status === 'invalid') {
    return (
      <PlatformAuthPageShell cardTitle={DEFAULT_AUTH_LABELS.resetPasswordTitle}>
        <p className={formStyles.error} role="alert">
          {DEFAULT_AUTH_LABELS.resetPasswordInvalidLink}
        </p>
        <ZenformedAuthPageLinks align="center">
          <ZenformedAuthNavLink href={nav.routes.forgotPassword}>
            {DEFAULT_AUTH_LABELS.sendResetLink}
          </ZenformedAuthNavLink>
          <ZenformedAuthNavLink href={nav.routes.login}>
            {DEFAULT_AUTH_LABELS.backToSignIn}
          </ZenformedAuthNavLink>
        </ZenformedAuthPageLinks>
      </PlatformAuthPageShell>
    );
  }

  return (
    <PlatformAuthPageShell cardTitle={DEFAULT_AUTH_LABELS.resetPasswordTitle}>
      <ZenformedRecoveryPasswordForm
        loginHref={nav.routes.login}
        onUpdatePassword={async (password) =>
          updateRecoveredPassword({
            supabase,
            password,
          })
        }
      />
    </PlatformAuthPageShell>
  );
}
