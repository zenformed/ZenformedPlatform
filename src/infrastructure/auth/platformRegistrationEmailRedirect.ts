import {
  resolveAuthRedirectUrl,
  resolvePostAuthRedirectTarget,
  type AuthEntryQueryParams,
} from '@zenformed/core/auth';
import { env } from '@/infrastructure/config/env';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { buildRegistrationConfirmationLoginPath } from './registrationConfirmationLoginPath';

/** Absolute Supabase `emailRedirectTo` for direct Platform registration confirmation emails. */
export function resolvePlatformRegistrationEmailRedirectUrl(
  authEntryParams?: AuthEntryQueryParams
): string {
  const loginPath = authEntryParams == null
    ? nav.routes.login
    : buildRegistrationConfirmationLoginPath({
        loginPath: nav.routes.login,
        app: authEntryParams.app,
        plan: authEntryParams.plan,
        returnTo: resolvePostAuthRedirectTarget(authEntryParams, nav.routes.dashboard),
      });
  return resolveAuthRedirectUrl({
    appOrigin: env.appUrl,
    path: loginPath,
  });
}
