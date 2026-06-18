'use client';

import { useEffect, useState } from 'react';
import { parseProductCatalogDetailJson } from '@/infrastructure/coreApi/parseResponse';
import type { ZenformedCoreProductCatalogDetail } from '@/infrastructure/coreApi/types';
import type { CartCheckoutIntent } from '@/platform/cart/cartIntentTypes';
import { resolveCartSummary, type CartSummary } from '@/platform/cart/resolveCartSummary';

export type CartSummaryState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly summary: CartSummary }
  | { readonly status: 'invalid' }
  | { readonly status: 'error' };

async function fetchProductCatalogDetail(
  productSlug: string
): Promise<ZenformedCoreProductCatalogDetail | null> {
  const response = await fetch(`/api/products/${encodeURIComponent(productSlug)}`, {
    method: 'GET',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    return null;
  }
  const json: unknown = await response.json();
  if (json == null || typeof json !== 'object') {
    return null;
  }
  const body = json as Record<string, unknown>;
  if (body.relay === 'zenformed_core') {
    const { relay: _relay, ...catalogBody } = body;
    return parseProductCatalogDetailJson(catalogBody);
  }
  return parseProductCatalogDetailJson(json);
}

export function useCartSummary(intent: CartCheckoutIntent | null, hydrated: boolean): CartSummaryState {
  const [state, setState] = useState<CartSummaryState>({ status: 'idle' });

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (intent == null) {
      setState({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    void fetchProductCatalogDetail(intent.productSlug)
      .then((catalog) => {
        if (cancelled) return;
        if (catalog == null) {
          setState({ status: 'error' });
          return;
        }
        const summary = resolveCartSummary(intent, catalog);
        setState(summary == null ? { status: 'invalid' } : { status: 'ready', summary });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: 'error' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, intent]);

  return state;
}
