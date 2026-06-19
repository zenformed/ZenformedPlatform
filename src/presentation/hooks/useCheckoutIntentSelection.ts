'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  createCartCheckoutIntent,
  type CheckoutMode,
  type PlanChangeType,
} from '@/platform/cart/cartIntentTypes';
import {
  canContinuePlanChange,
  formatPlanDowngradeBlockedMessage,
} from '@/platform/products/productPlanOwnership';
import { getSupabaseClient } from '@/infrastructure/supabase/supabaseClient';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { platformDashboardNavigation } from '@/platform/navigation/platformDashboardNavigation';
import type { BillingPeriod } from '@/platform/products/productPricingCatalog';
import { useCartIntent } from '@/presentation/providers/CartIntentProvider';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';

export function useCheckoutIntentSelection(): {
  readonly selectCheckoutIntent: (input: {
    readonly productSlug: string;
    readonly planSlug: string;
    readonly billingCycle: BillingPeriod;
    readonly checkoutMode: CheckoutMode;
    readonly changeType?: PlanChangeType;
    readonly targetSeatsIncluded?: number | null;
    readonly activeMemberCount?: number | null;
    readonly targetPlanName?: string;
  }) => Promise<{ readonly blockedMessage: string | null; readonly successMessage: string | null }>;
} {
  const { saveIntent } = useCartIntent();
  const { session, loading: authLoading } = useSaaSProfile();
  const router = useRouter();

  const readChangePlanErrorMessage = (body: unknown): string => {
    if (body != null && typeof body === 'object') {
      const record = body as Record<string, unknown>;
      if (typeof record.message === 'string' && record.message.trim() !== '') {
        return record.message;
      }
    }
    return 'Could not change subscription plan. Please try again.';
  };

  const selectCheckoutIntent = useCallback(
    async (input: {
      readonly productSlug: string;
      readonly planSlug: string;
      readonly billingCycle: BillingPeriod;
      readonly checkoutMode: CheckoutMode;
      readonly changeType?: PlanChangeType;
      readonly targetSeatsIncluded?: number | null;
      readonly activeMemberCount?: number | null;
      readonly targetPlanName?: string;
    }) => {
      if (
        input.changeType === 'downgrade' &&
        input.targetSeatsIncluded != null &&
        input.activeMemberCount != null &&
        !canContinuePlanChange({
          changeType: input.changeType,
          targetSeatsIncluded: input.targetSeatsIncluded,
          activeMemberCount: input.activeMemberCount,
        })
      ) {
        return {
          blockedMessage: formatPlanDowngradeBlockedMessage({
            planName: input.targetPlanName ?? input.planSlug,
            targetSeats: input.targetSeatsIncluded,
            activeMemberCount: input.activeMemberCount,
          }),
          successMessage: null,
        };
      }

      if (input.changeType != null) {
        let accessToken = session?.access_token?.trim() ?? '';
        if (accessToken === '' && authLoading) {
          const {
            data: { session: activeSession },
          } = await getSupabaseClient().auth.getSession();
          accessToken = activeSession?.access_token?.trim() ?? '';
        }
        if (accessToken === '') {
          router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(window.location.pathname)}`);
          return { blockedMessage: null, successMessage: null };
        }

        try {
          const response = await fetch(platformDashboardNavigation.apis.changeAppSubscriptionPlan, {
            method: 'POST',
            cache: 'no-store',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productSlug: input.productSlug,
              planSlug: input.planSlug,
              billingCycle: input.billingCycle,
            }),
          });

          let json: unknown = null;
          try {
            json = await response.json();
          } catch {
            json = null;
          }

          if (response.status === 401) {
            router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(window.location.pathname)}`);
            return { blockedMessage: null, successMessage: null };
          }

          if (!response.ok) {
            return {
              blockedMessage: readChangePlanErrorMessage(json),
              successMessage: null,
            };
          }

          const planLabel = input.targetPlanName ?? input.planSlug;
          return {
            blockedMessage: null,
            successMessage: `Your subscription is now on ${planLabel}.`,
          };
        } catch {
          return {
            blockedMessage: 'Could not reach billing service. Please try again.',
            successMessage: null,
          };
        }
      }

      const intent = createCartCheckoutIntent(input);
      if (intent == null) {
        return { blockedMessage: null, successMessage: null };
      }

      saveIntent(intent);

      let authenticated = session != null;
      if (authLoading) {
        const {
          data: { session: activeSession },
        } = await getSupabaseClient().auth.getSession();
        authenticated = activeSession != null;
      }

      if (authenticated) {
        router.push(nav.routes.cart);
        return { blockedMessage: null, successMessage: null };
      }

      router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(nav.routes.cart)}`);
      return { blockedMessage: null, successMessage: null };
    },
    [authLoading, router, saveIntent, session]
  );

  return { selectCheckoutIntent };
}
