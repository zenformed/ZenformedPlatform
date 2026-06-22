import { env } from '@/infrastructure/config/env';
import type { CoreApiError, CoreApiResult } from '@/infrastructure/coreApi/types';
import type {
  AdminAccountOwnerDetail,
  AdminListQueryParams,
  AdminPaginatedResult,
  AdminOrganizationListItem,
  AdminStaffMe,
  AdminSubscriptionListItem,
  AdminAccountOwnerListItem,
} from '@/infrastructure/coreApi/adminTypes';
import {
  parseAdminAccountOwnerDetail,
  parseAdminAccountOwnersResponse,
  parseAdminOrganizationsResponse,
  parseAdminStaffMe,
  parseAdminSubscriptionsResponse,
} from '@/infrastructure/coreApi/adminTypes';

const DEFAULT_TIMEOUT_MS = 10_000;

function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '');
}

function buildQueryString(params: AdminListQueryParams): string {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.pageSize != null) searchParams.set('pageSize', String(params.pageSize));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  if (params.search) searchParams.set('search', params.search);
  if (params.product && params.product !== 'all') searchParams.set('product', params.product);
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.plan && params.plan !== 'all') searchParams.set('plan', params.plan);
  const query = searchParams.toString();
  return query === '' ? '' : `?${query}`;
}

async function fetchAdminJson(
  path: string,
  accessToken: string,
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

async function getAdminResource<T>(
  path: string,
  accessToken: string,
  parse: (json: unknown) => T | null
): Promise<CoreApiResult<T>> {
  const fetched = await fetchAdminJson(path, accessToken);
  if (!fetched.ok) {
    return { ok: false, error: fetched.error };
  }
  const parsed = parse(fetched.json);
  if (parsed == null) {
    return { ok: false, error: { kind: 'invalid_payload' } };
  }
  return { ok: true, data: parsed };
}

export async function getAdminMe(accessToken: string): Promise<CoreApiResult<AdminStaffMe>> {
  return getAdminResource('/admin/me', accessToken, parseAdminStaffMe);
}

export async function getAdminAccountOwners(
  accessToken: string,
  params: AdminListQueryParams = {}
): Promise<CoreApiResult<AdminPaginatedResult<AdminAccountOwnerListItem>>> {
  return getAdminResource(
    `/admin/users${buildQueryString(params)}`,
    accessToken,
    parseAdminAccountOwnersResponse
  );
}

export async function getAdminAccountOwnerDetail(
  accessToken: string,
  ownerUserId: string
): Promise<CoreApiResult<AdminAccountOwnerDetail>> {
  return getAdminResource(`/admin/users/${encodeURIComponent(ownerUserId)}`, accessToken, (json) => {
    const detail = parseAdminAccountOwnerDetail(json);
    return detail;
  });
}

export async function getAdminOrganizations(
  accessToken: string,
  params: AdminListQueryParams = {}
): Promise<CoreApiResult<AdminPaginatedResult<AdminOrganizationListItem>>> {
  return getAdminResource(
    `/admin/organizations${buildQueryString(params)}`,
    accessToken,
    parseAdminOrganizationsResponse
  );
}

export async function getAdminSubscriptions(
  accessToken: string,
  params: AdminListQueryParams = {}
): Promise<CoreApiResult<AdminPaginatedResult<AdminSubscriptionListItem>>> {
  return getAdminResource(
    `/admin/subscriptions${buildQueryString(params)}`,
    accessToken,
    parseAdminSubscriptionsResponse
  );
}
