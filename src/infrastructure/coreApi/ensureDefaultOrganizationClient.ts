import { env } from '@/infrastructure/config/env';
import type { CoreApiError, CoreApiResult } from '@/infrastructure/coreApi/types';

const DEFAULT_TIMEOUT_MS = 8_000;

export type EnsureDefaultOrganizationResponse = {
  readonly created: boolean;
  readonly skippedInviteFlow: boolean;
  readonly organizationId: string | null;
  readonly organizationName: string | null;
};

function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '');
}

function parseEnsureResponse(json: unknown): EnsureDefaultOrganizationResponse | null {
  if (json == null || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if (typeof o.created !== 'boolean') return null;
  return {
    created: o.created,
    skippedInviteFlow: o.skippedInviteFlow === true,
    organizationId: typeof o.organizationId === 'string' ? o.organizationId : null,
    organizationName: typeof o.organizationName === 'string' ? o.organizationName : null,
  };
}

/** `POST /users/me/ensure-default-organization` — server-side / BFF only. */
export async function ensureMyDefaultOrganization(
  accessToken: string,
  options?: { readonly skipCreateForInviteFlow?: boolean }
): Promise<CoreApiResult<EnsureDefaultOrganizationResponse>> {
  const base = env.zenformedCoreApiBaseUrl;
  if (base == null) {
    return { ok: false, error: { kind: 'unconfigured' } };
  }
  const url = `${normalizeBaseUrl(base)}/users/me/ensure-default-organization`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skipCreateForInviteFlow: options?.skipCreateForInviteFlow === true,
      }),
    });
    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return { ok: false, error: { kind: 'invalid_payload' } };
    }
    if (!res.ok) {
      return { ok: false, error: { kind: 'http_error', status: res.status, body: json } };
    }
    const parsed = parseEnsureResponse(json);
    if (parsed == null) {
      return { ok: false, error: { kind: 'invalid_payload' } };
    }
    return { ok: true, data: parsed };
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError';
    if (aborted) {
      return { ok: false, error: { kind: 'timeout' } };
    }
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: { kind: 'network', message } };
  } finally {
    clearTimeout(timer);
  }
}
