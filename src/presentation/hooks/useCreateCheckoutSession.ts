'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CartCheckoutIntent } from '@/platform/cart/cartIntentTypes';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { getSupabaseClient } from '@/infrastructure/supabase/supabaseClient';

export type CreateCheckoutSessionState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string };

function readCheckoutErrorMessage(body: unknown): string {
  if (body != null && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.trim() !== '') {
      return record.message;
    }
    if (typeof record.error === 'string' && record.error.trim() !== '') {
      return record.error.replace(/_/g, ' ');
    }
  }
  return 'Could not start checkout. Please try again.';
}

export function useCreateCheckoutSession(): {
  readonly state: CreateCheckoutSessionState;
  readonly startCheckout: (intent: CartCheckoutIntent) => Promise<void>;
} {
  const router = useRouter();
  const [state, setState] = useState<CreateCheckoutSessionState>({ status: 'idle' });

  const startCheckout = useCallback(async (intent: CartCheckoutIntent) => {
    setState({ status: 'loading' });

    const {
      data: { session },
    } = await getSupabaseClient().auth.getSession();
    const accessToken = session?.access_token?.trim() ?? '';
    if (accessToken === '') {
      router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(nav.routes.cart)}`);
      setState({ status: 'idle' });
      return;
    }

    try {
      const response = await fetch('/api/internal/checkout/session', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productSlug: intent.productSlug,
          planSlug: intent.planSlug,
          billingCycle: intent.billingCycle,
          checkoutMode: intent.checkoutMode,
        }),
      });

      let json: unknown = null;
      try {
        json = await response.json();
      } catch {
        json = null;
      }

      if (response.status === 401) {
        router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(nav.routes.cart)}`);
        setState({ status: 'idle' });
        return;
      }

      if (!response.ok) {
        setState({ status: 'error', message: readCheckoutErrorMessage(json) });
        return;
      }

      if (json == null || typeof json !== 'object') {
        setState({ status: 'error', message: 'Invalid checkout response.' });
        return;
      }

      const record = json as Record<string, unknown>;
      const checkoutUrl =
        typeof record.checkoutUrl === 'string' ? record.checkoutUrl.trim() : '';
      if (checkoutUrl === '') {
        setState({ status: 'error', message: 'Checkout URL was not returned.' });
        return;
      }

      window.location.assign(checkoutUrl);
    } catch {
      setState({ status: 'error', message: 'Could not reach checkout service. Please try again.' });
    }
  }, [router]);

  return { state, startCheckout };
}
