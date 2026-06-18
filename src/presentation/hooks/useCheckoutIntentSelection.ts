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
  }) => Promise<{ readonly blockedMessage: string | null }>;
} {
  const { saveIntent } = useCartIntent();
  const { session, loading: authLoading } = useSaaSProfile();
  const router = useRouter();

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
        };
      }

      const intent = createCartCheckoutIntent(input);
      if (intent == null) {
        return { blockedMessage: null };
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
        return { blockedMessage: null };
      }

      router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(nav.routes.cart)}`);
      return { blockedMessage: null };
    },
    [authLoading, router, saveIntent, session]
  );

  return { selectCheckoutIntent };
}
