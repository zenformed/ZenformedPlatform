import {
  consumeZenformedOAuthIntent,
  resolvePostAuthRedirectTarget,
  type AuthEntryQueryParams,
  type ZenformedOAuthIntent,
} from '@zenformed/core/auth';
import {
  isInviteOAuthIntent,
  resolveAuthEntryParamsForOAuthResume,
} from '@/infrastructure/auth/oauthInviteResume';
import {
  isBuildCoreAuthAppHandoff,
  performBuildCoreLaunchHandoff,
} from '@/infrastructure/auth/platformBuildCoreLaunchHandoff';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';

export {
  extractInviteTokenFromReturnPath,
  isInviteOAuthIntent,
  resolveAuthEntryParamsForOAuthResume,
} from '@/infrastructure/auth/oauthInviteResume';

function isOAuthDebugEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}

/** Dev-only OAuth diagnostics — never logs tokens, codes, or secrets. */
export function logOAuthDebug(
  event: string,
  payload: Record<string, unknown>
): void {
  if (!isOAuthDebugEnabled()) return;
  console.info(`[zenformed-oauth] ${event}`, payload);
}

export async function ensureDefaultOrganizationViaBff(
  accessToken: string,
  options?: { readonly skipCreateForInviteFlow?: boolean }
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch('/api/internal/users-me-ensure-default-organization', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        skipCreateForInviteFlow: options?.skipCreateForInviteFlow === true,
      }),
    });
    if (!res.ok) {
      let message = 'Could not finish account setup.';
      try {
        const json: unknown = await res.json();
        if (json != null && typeof json === 'object') {
          const o = json as Record<string, unknown>;
          if (typeof o.message === 'string' && o.message.trim()) message = o.message;
        }
      } catch {
        // keep fallback
      }
      return { ok: false, message };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: 'Could not finish account setup.' };
  }
}

export type CompletePlatformOAuthResult =
  | { readonly ok: true; readonly kind: 'platform'; readonly href: string }
  | { readonly ok: true; readonly kind: 'buildcore'; readonly launchUrl: string }
  | { readonly ok: false; readonly message: string };

function summarizeIntent(intent: ZenformedOAuthIntent | null): Record<string, unknown> {
  if (intent == null) return { intent: null };
  return {
    app: intent.app,
    plan: intent.plan,
    returnTo: intent.returnTo,
    redirect: intent.redirect,
    inviteTokenPresent: intent.inviteToken != null,
    checkoutContinuationPresent: intent.checkoutContinuation != null,
    createdAt: intent.createdAt,
  };
}

/**
 * After Google OAuth session is established: consume intent, bootstrap org, resume post-login flow.
 */
export async function completePlatformGoogleOAuthSession(
  accessToken: string,
  options?: {
    readonly userId?: string | null;
    readonly userEmail?: string | null;
  }
): Promise<CompletePlatformOAuthResult> {
  const intent = consumeZenformedOAuthIntent();
  logOAuthDebug('restored OAuth intent', {
    ...summarizeIntent(intent),
    userId: options?.userId ?? null,
    userEmail: options?.userEmail ?? null,
  });

  const authEntryParams = resolveAuthEntryParamsForOAuthResume(intent);
  const skipCreateForInviteFlow = isInviteOAuthIntent(intent);

  const ensured = await ensureDefaultOrganizationViaBff(accessToken, {
    skipCreateForInviteFlow,
  });
  if (!ensured.ok) {
    logOAuthDebug('ensure-default-organization failed', { message: ensured.message });
    return { ok: false, message: ensured.message };
  }

  if (isBuildCoreAuthAppHandoff(authEntryParams) || skipCreateForInviteFlow) {
    const handoffParams: AuthEntryQueryParams = {
      ...authEntryParams,
      app: authEntryParams.app ?? 'buildcore',
    };
    const handoff = await performBuildCoreLaunchHandoff(accessToken, handoffParams);
    if (!handoff.ok) {
      return { ok: false, message: handoff.message };
    }
    logOAuthDebug('final destination', {
      kind: 'buildcore',
      returnTo: handoffParams.returnTo,
      redirect: handoffParams.redirect,
    });
    return { ok: true, kind: 'buildcore', launchUrl: handoff.launchUrl };
  }

  const href = resolvePostAuthRedirectTarget(authEntryParams, nav.routes.dashboard);
  logOAuthDebug('final destination', {
    kind: 'platform',
    href,
    authEntryReturnTo: authEntryParams.returnTo,
    authEntryRedirect: authEntryParams.redirect,
  });
  return { ok: true, kind: 'platform', href };
}
