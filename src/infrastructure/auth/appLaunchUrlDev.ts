/**
 * Local dev helpers for cross-app launch handoff.
 * When Platform/BuildCore run on localhost but Core is remote, minted launch URLs must
 * target the local app origin (http://localhost:3020) instead of production.
 */

const LOCAL_DEV_LAUNCH_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

function isLocalDevHttpOrigin(origin: string): boolean {
  try {
    const parsed = new URL(origin);
    return parsed.protocol === 'http:' && LOCAL_DEV_LAUNCH_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function normalizeAppPublicOrigin(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, '');
}

/** BuildCore public origin for Platform → BuildCore handoff when running locally. */
export function resolveLocalBuildCoreLaunchOrigin(): string | null {
  const configured = normalizeAppPublicOrigin(
    process.env.BUILDCORE_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_BUILDCORE_APP_URL ??
      process.env.NEXT_PUBLIC_APP_URL
  );
  if (configured != null && isLocalDevHttpOrigin(configured)) return configured;

  if (process.env.NODE_ENV === 'production') return null;

  const platformUrl = normalizeAppPublicOrigin(
    process.env.PLATFORM_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_PLATFORM_APP_URL
  );
  if (platformUrl != null && isLocalDevHttpOrigin(platformUrl)) {
    return 'http://localhost:3020';
  }

  return null;
}

/** Rewrite a Core-minted launch URL to the local BuildCore origin (fallback when Core is not updated). */
export function rewriteBuildCoreLaunchUrlForLocalDev(launchUrl: string): string {
  const localOrigin = resolveLocalBuildCoreLaunchOrigin();
  if (localOrigin == null) return launchUrl;
  try {
    const url = new URL(launchUrl);
    const local = new URL(localOrigin);
    url.protocol = local.protocol;
    url.host = local.host;
    return url.toString();
  } catch {
    return launchUrl;
  }
}
