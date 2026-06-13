import {
  DEFAULT_AUTH_LABELS,
  requestPasswordResetEmail,
  type RequestPasswordResetResult,
} from '@zenformed/core/auth';
import { getSupabaseClient } from '@/infrastructure/supabase/supabaseClient';
import { resolvePlatformPasswordResetRedirectUrl } from '@/infrastructure/auth/platformPasswordResetRedirect';

export async function requestPlatformPasswordResetEmail(
  email: string
): Promise<RequestPasswordResetResult> {
  const redirectTo = resolvePlatformPasswordResetRedirectUrl();
  if (!redirectTo.trim()) {
    return { ok: false, error: DEFAULT_AUTH_LABELS.forgotPasswordError };
  }

  return requestPasswordResetEmail({
    supabase: getSupabaseClient(),
    email,
    redirectTo,
  });
}
