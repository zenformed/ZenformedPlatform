'use client';



import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import {

  createCartCheckoutIntent,

  type CheckoutMode,

} from '@/platform/cart/cartIntentTypes';

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

  }) => Promise<void>;

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

    }) => {

      const intent = createCartCheckoutIntent(input);

      if (intent == null) return;



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

        return;

      }



      router.push(`${nav.routes.login}?returnTo=${encodeURIComponent(nav.routes.cart)}`);

    },

    [authLoading, router, saveIntent, session]

  );



  return { selectCheckoutIntent };

}

