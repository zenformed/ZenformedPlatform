import { resolveAuthRedirectUrl } from '@zenformed/core/auth';
import { env } from '@/infrastructure/config/env';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';

/** Absolute Supabase OAuth `redirectTo` for Platform Google Sign-In. */
export function resolvePlatformGoogleOAuthCallbackUrl(): string {
  return resolveAuthRedirectUrl({
    appOrigin: env.appUrl,
    path: nav.routes.authCallback,
  });
}
