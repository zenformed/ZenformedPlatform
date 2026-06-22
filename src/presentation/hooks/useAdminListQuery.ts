'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminPaginatedResult } from '@/infrastructure/coreApi/adminTypes';

export type AdminListQueryState = {
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  search: string;
  product: string;
  status: string;
  plan: string;
};

type UseAdminListQueryOptions<T> = {
  apiPath: string;
  getAccessToken: () => string | null;
  defaultSortBy: string;
  parseResponse: (json: unknown) => AdminPaginatedResult<T> | null;
  debouncedSearch?: boolean;
};

export function useAdminListQuery<T>({
  apiPath,
  getAccessToken,
  defaultSortBy,
  parseResponse,
  debouncedSearch = true,
}: UseAdminListQueryOptions<T>) {
  const [query, setQuery] = useState<AdminListQueryState>({
    page: 1,
    pageSize: 25,
    sortBy: defaultSortBy,
    sortDir: 'asc',
    search: '',
    product: 'all',
    status: 'all',
    plan: 'all',
  });
  const [searchInput, setSearchInput] = useState('');
  const [result, setResult] = useState<AdminPaginatedResult<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!debouncedSearch) {
      setQuery((current) => ({ ...current, search: searchInput, page: 1 }));
      return;
    }
    const timer = window.setTimeout(() => {
      setQuery((current) => ({ ...current, search: searchInput, page: 1 }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [debouncedSearch, searchInput]);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setErrorMessage('Not authenticated.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const params = new URLSearchParams();
    params.set('page', String(query.page));
    params.set('pageSize', String(query.pageSize));
    params.set('sortBy', query.sortBy);
    params.set('sortDir', query.sortDir);
    if (query.search.trim() !== '') params.set('search', query.search.trim());
    if (query.product !== 'all') params.set('product', query.product);
    if (query.status !== 'all') params.set('status', query.status);
    if (query.plan !== 'all') params.set('plan', query.plan);

    try {
      const res = await fetch(`${apiPath}?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 403) {
        setErrorMessage('Platform staff access required.');
        setResult(null);
        return;
      }
      if (!res.ok) {
        setErrorMessage('Unable to load admin data.');
        setResult(null);
        return;
      }
      const json: unknown = await res.json();
      const parsed = parseResponse(json);
      if (parsed == null) {
        setErrorMessage('Unable to load admin data.');
        setResult(null);
        return;
      }
      setResult(parsed);
    } catch {
      setErrorMessage('Unable to load admin data.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiPath, getAccessToken, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleSort = useCallback((columnId: string) => {
    setQuery((current) => ({
      ...current,
      page: 1,
      sortBy: columnId,
      sortDir: current.sortBy === columnId && current.sortDir === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const setProduct = useCallback((product: string) => {
    setQuery((current) => ({ ...current, product, page: 1 }));
  }, []);

  const setStatus = useCallback((status: string) => {
    setQuery((current) => ({ ...current, status, page: 1 }));
  }, []);

  const setPlan = useCallback((plan: string) => {
    setQuery((current) => ({ ...current, plan, page: 1 }));
  }, []);

  const goToPreviousPage = useCallback(() => {
    setQuery((current) => ({ ...current, page: Math.max(1, current.page - 1) }));
  }, []);

  const goToNextPage = useCallback(() => {
    setQuery((current) => ({ ...current, page: current.page + 1 }));
  }, []);

  return {
    query,
    searchInput,
    setSearchInput,
    result,
    isLoading,
    errorMessage,
    toggleSort,
    setProduct,
    setStatus,
    setPlan,
    goToPreviousPage,
    goToNextPage,
  };
}
