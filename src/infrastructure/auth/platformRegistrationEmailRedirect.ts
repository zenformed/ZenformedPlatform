import { resolveAuthRedirectUrl } from '@zenformed/core/auth';
import { env } from '@/infrastructure/config/env';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';

/** Absolute Supabase `emailRedirectTo` for direct Platform registration confirmation emails. */
export function resolvePlatformRegistrationEmailRedirectUrl(): string {
  return resolveAuthRedirectUrl({
    appOrigin: env.appUrl,
    path: nav.routes.login,
  });
}
