import type { AuthEntryQueryParams } from '@zenformed/core/auth';

const BUILDCORE_APP_ID = 'buildcore';

export function isBuildCoreAuthAppHandoff(
  authEntryParams: Pick<AuthEntryQueryParams, 'app'>
): boolean {
  return authEntryParams.app === BUILDCORE_APP_ID;
}

/** BuildCore post-handoff path; not a Platform route. */
export function resolveBuildCoreHandoffReturnPath(
  authEntryParams: AuthEntryQueryParams,
  defaultPath = '/dashboard'
): string {
  const candidate = authEntryParams.returnTo ?? authEntryParams.redirect;
  if (candidate?.startsWith('/')) return candidate;
  return defaultPath.startsWith('/') ? defaultPath : `/${defaultPath}`;
}

function readErrorMessage(json: unknown, fallback: string): string {
  if (json != null && typeof json === 'object') {
    const o = json as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message.trim()) return o.message;
    if (typeof o.error === 'string' && o.error.trim()) return o.error;
  }
  return fallback;
}

function parseLaunchUrl(json: unknown): string | null {
  if (json == null || typeof json !== 'object') return null;
  const launchUrl = (json as Record<string, unknown>).launchUrl;
  return typeof launchUrl === 'string' && launchUrl.trim() !== '' ? launchUrl : null;
}

/**
 * Mint a one-time BuildCore launch URL via the Platform BFF (browser-safe).
 * Do not call ZenformedCore directly from the client — `ZENFORMED_CORE_API_URL` is server-only.
 */
export async function mintBuildCoreLaunchHandoff(
  accessToken: string,
  returnPath: string
): Promise<string | null> {
  const handoff = await mintBuildCoreLaunchHandoffViaBff(accessToken, returnPath);
  return handoff.ok ? handoff.launchUrl : null;
}

export async function mintBuildCoreLaunchHandoffViaBff(
  accessToken: string,
  returnPath: string
): Promise<{ ok: true; launchUrl: string } | { ok: false; message: string; status?: number }> {
  try {
    const res = await fetch('/api/internal/app-launch', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ targetApp: BUILDCORE_APP_ID, returnPath }),
    });
    const json: unknown = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: readErrorMessage(json, 'Could not open BuildCore.'),
      };
    }
    const launchUrl = parseLaunchUrl(json);
    if (!launchUrl) {
      return { ok: false, status: res.status, message: 'Could not open BuildCore.' };
    }
    return { ok: true, launchUrl };
  } catch {
    return { ok: false, message: 'Could not open BuildCore.' };
  }
}

export async function performBuildCoreLaunchHandoff(
  accessToken: string,
  authEntryParams: AuthEntryQueryParams
): Promise<{ ok: true; launchUrl: string } | { ok: false; message: string }> {
  const returnPath = resolveBuildCoreHandoffReturnPath(authEntryParams);
  const handoff = await mintBuildCoreLaunchHandoffViaBff(accessToken, returnPath);
  if (!handoff.ok) {
    return { ok: false, message: handoff.message };
  }
  return { ok: true, launchUrl: handoff.launchUrl };
}
