/**
 * Server-only client for ZenformedCore public product catalog endpoints.
 * Do not import from client components — pricing must not ship in browser bundles.
 */

import { env } from '@/infrastructure/config/env';
import {
  parseProductCatalogDetailJson,
  parseProductCatalogListJson,
} from '@/infrastructure/coreApi/parseResponse';
import type {
  CoreApiError,
  CoreApiResult,
  ZenformedCoreProductCatalogDetail,
  ZenformedCoreProductCatalogList,
} from '@/infrastructure/coreApi/types';

const DEFAULT_TIMEOUT_MS = 5_000;

function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '');
}

async function fetchCatalogJson(
  path: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<{ ok: true; json: unknown } | { ok: false; error: CoreApiError }> {
  const base = env.zenformedCoreApiBaseUrl;
  if (base == null) {
    return { ok: false, error: { kind: 'unconfigured' } };
  }

  const url = `${normalizeBaseUrl(base)}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
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

export async function getProductCatalogListFromCore(
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<CoreApiResult<ZenformedCoreProductCatalogList>> {
  const fetched = await fetchCatalogJson('/products', timeoutMs);
  if (!fetched.ok) {
    return { ok: false, error: fetched.error };
  }
  const parsed = parseProductCatalogListJson(fetched.json);
  if (parsed == null) {
    return { ok: false, error: { kind: 'invalid_payload' } };
  }
  return { ok: true, data: parsed };
}

export async function getProductCatalogProductFromCore(
  productSlug: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<CoreApiResult<ZenformedCoreProductCatalogDetail>> {
  const slug = productSlug.trim().toLowerCase();
  if (slug.length === 0) {
    return { ok: false, error: { kind: 'invalid_payload' } };
  }
  const fetched = await fetchCatalogJson(`/products/${encodeURIComponent(slug)}`, timeoutMs);
  if (!fetched.ok) {
    return { ok: false, error: fetched.error };
  }
  const parsed = parseProductCatalogDetailJson(fetched.json);
  if (parsed == null) {
    return { ok: false, error: { kind: 'invalid_payload' } };
  }
  return { ok: true, data: parsed };
}
