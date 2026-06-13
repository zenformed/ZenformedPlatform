import { resolveAuthRedirectUrl } from '@zenformed/core/auth';
import { env } from '@/infrastructure/config/env';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';

/** Absolute Supabase `redirectTo` for platform password recovery emails. */
export function resolvePlatformPasswordResetRedirectUrl(): string {
  return resolveAuthRedirectUrl({
    appOrigin: env.appUrl,
    path: nav.routes.resetPassword,
  });
}
