import { env } from '@/infrastructure/config/env';
import {
  parseAppEntitlementEnvelopeJson,
  parseProfileEnvelopeJson,
  parseUserSettingsEnvelopeJson,
} from '@/infrastructure/coreApi/parseResponse';
import type {
  CoreApiError,
  CoreApiResult,
  ZenformedCoreAppEntitlementEnvelope,
  ZenformedCoreProfileEnvelope,
  ZenformedCoreProfilePatchRequest,
  ZenformedCoreUserSettingsEnvelope,
  ZenformedCoreUserSettingsPatchRequest,
} from '@/infrastructure/coreApi/types';
const DEFAULT_TIMEOUT_MS = 5_000;

function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '');
}

async function fetchJsonWithBearer(
  url: string,
  accessToken: string,
  timeoutMs: number
): Promise<{ ok: true; json: unknown } | { ok: false; error: CoreApiError }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
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
    return { ok: true, json };
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

async function getFromCoreWithBearer<T>(
  path: string,
  accessToken: string,
  parse: (json: unknown) => T | null,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<CoreApiResult<T>> {
  const base = env.zenformedCoreApiBaseUrl;
  if (base == null) {
    return { ok: false, error: { kind: 'unconfigured' } };
  }
  const url = `${normalizeBaseUrl(base)}${path.startsWith('/') ? path : `/${path}`}`;
  const fetched = await fetchJsonWithBearer(url, accessToken, timeoutMs);
  if (!fetched.ok) {
    return { ok: false, error: fetched.error };
  }
  const parsed = parse(fetched.json);
  if (parsed == null) {
    return { ok: false, error: { kind: 'invalid_payload' } };
  }
  return { ok: true, data: parsed };
}

async function patchFromCoreWithBearer<T>(
  path: string,
  accessToken: string,
  jsonBody: unknown,
  parse: (json: unknown) => T | null,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<CoreApiResult<T>> {
  const base = env.zenformedCoreApiBaseUrl;
  if (base == null) {
    return { ok: false, error: { kind: 'unconfigured' } };
  }
  const url = `${normalizeBaseUrl(base)}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonBody),
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
    const parsed = parse(json);
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

/** `GET /users/me/profile` — sanitized profile DTO; server-side / BFF only. */
export async function getMyProfile(
  accessToken: string
): Promise<CoreApiResult<ZenformedCoreProfileEnvelope>> {
  return getFromCoreWithBearer('/users/me/profile', accessToken, parseProfileEnvelopeJson);
}

/** `PATCH /users/me/profile` — partial profile updates; server-side / BFF only. */
export async function patchMyProfile(
  accessToken: string,
  body: ZenformedCoreProfilePatchRequest
): Promise<CoreApiResult<ZenformedCoreProfileEnvelope>> {
  return patchFromCoreWithBearer('/users/me/profile', accessToken, body, parseProfileEnvelopeJson);
}

/** `GET /users/me/settings` — account name + communication preferences; server-side / BFF only. */
export async function getMySettings(
  accessToken: string
): Promise<CoreApiResult<ZenformedCoreUserSettingsEnvelope>> {
  return getFromCoreWithBearer('/users/me/settings', accessToken, parseUserSettingsEnvelopeJson);
}

/** `PATCH /users/me/settings` — partial account/preferences update; server-side / BFF only. */
export async function patchMySettings(
  accessToken: string,
  body: ZenformedCoreUserSettingsPatchRequest
): Promise<CoreApiResult<ZenformedCoreUserSettingsEnvelope>> {
  return patchFromCoreWithBearer('/users/me/settings', accessToken, body, parseUserSettingsEnvelopeJson);
}

/** `GET /apps/:appSlug/entitlement` — platform-first entitlement snapshot; server-side / BFF only. */
export async function getAppEntitlement(
  appSlug: string,
  accessToken: string
): Promise<CoreApiResult<ZenformedCoreAppEntitlementEnvelope>> {
  const encoded = encodeURIComponent(appSlug);
  return getFromCoreWithBearer(
    `/apps/${encoded}/entitlement?authority_mode=platform`,
    accessToken,
    parseAppEntitlementEnvelopeJson
  );
}
