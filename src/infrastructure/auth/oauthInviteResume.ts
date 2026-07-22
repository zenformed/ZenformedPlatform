/** Auth entry query params used for OAuth invite resume (mirrors @zenformed/core/auth). */
export type AuthEntryQueryParams = {
  readonly app: string | null;
  readonly plan: string | null;
  readonly returnTo: string | null;
  readonly redirect: string | null;
};

/** Minimal OAuth intent shape used for invite resume. */
export type OAuthInviteIntentFields = {
  readonly app: string | null;
  readonly plan: string | null;
  readonly returnTo: string | null;
  readonly redirect: string | null;
  readonly inviteToken: string | null;
};

export function extractInviteTokenFromReturnPath(path: string | null | undefined): string | null {
  const raw = path?.trim();
  if (!raw || !raw.startsWith('/')) return null;
  try {
    const url = new URL(raw, 'https://zenformed.invalid');
    if (!url.pathname.includes('accept-invite')) return null;
    const token = url.searchParams.get('token')?.trim();
    return token || null;
  } catch {
    return null;
  }
}

export function isInviteOAuthIntent(intent: OAuthInviteIntentFields | null): boolean {
  if (intent == null) return false;
  if (intent.inviteToken) return true;
  return extractInviteTokenFromReturnPath(intent.returnTo ?? intent.redirect) != null;
}

/** Ensures invite flows hand off to BuildCore accept-invite with the token in returnTo. */
export function resolveAuthEntryParamsForOAuthResume(
  intent: OAuthInviteIntentFields | null
): AuthEntryQueryParams {
  const base: AuthEntryQueryParams = {
    app: intent?.app ?? null,
    plan: intent?.plan ?? null,
    returnTo: intent?.returnTo ?? null,
    redirect: intent?.redirect ?? null,
  };
  const inviteToken =
    intent?.inviteToken ??
    extractInviteTokenFromReturnPath(intent?.returnTo ?? intent?.redirect);

  if (!inviteToken) return base;

  const acceptPath = `/accept-invite?token=${encodeURIComponent(inviteToken)}`;
  return {
    app: base.app ?? 'buildcore',
    plan: base.plan,
    returnTo: acceptPath,
    redirect: null,
  };
}
