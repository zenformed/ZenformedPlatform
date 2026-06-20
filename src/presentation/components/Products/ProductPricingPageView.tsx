'use client';



import { useCallback, useMemo, useRef, useState, type ReactElement } from 'react';

import Link from 'next/link';

import { resolveZenformedAppIconSrc } from '@zenformed/core/dashboard-shell';

import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';

import type { ProductPricingPageConfig } from '@/platform/products/productPricingCatalog';

import {

  resolvePlanCardOwnershipAction,

  type PlanCardOwnershipAction,

} from '@/platform/products/productPlanOwnership';

import { BillingPeriodToggle } from '@/presentation/components/Products/BillingPeriodToggle';

import { PlanChangeConfirmDialog } from '@/presentation/components/Products/PlanChangeConfirmDialog';

import { PricingCheckIcon } from '@/presentation/components/Products/PricingCheckIcon';

import { PricingPlanCard } from '@/presentation/components/Products/PricingPlanCard';

import { ProductNoticeToast } from '@/presentation/components/Products/ProductNoticeToast';

import { useCheckoutIntentSelection } from '@/presentation/hooks/useCheckoutIntentSelection';

import { usePlatformOrganizationWorkspaceSummary } from '@/presentation/hooks/usePlatformOrganizationWorkspaceSummary';

import { usePlatformProductEntitlements } from '@/presentation/hooks/usePlatformProductEntitlements';

import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';

import { useSubscriptionPlanChange } from '@/presentation/hooks/useSubscriptionPlanChange';

import styles from '../../../../app/products/products.module.css';



export type ProductPricingPageViewProps = {

  readonly config: ProductPricingPageConfig;

};



function resolveProductIconSrc(config: ProductPricingPageConfig): string | undefined {

  const product = PLATFORM_APPS.find((app) => app.id === config.appSlug);

  if (product == null) return undefined;

  return resolveZenformedAppIconSrc(product);

}



function PricingFootnoteIcon(): ReactElement {

  return (

    <svg

      className={styles.pricingFootnoteIcon}

      viewBox="0 0 24 24"

      width={20}

      height={20}

      aria-hidden="true"

      focusable="false"

    >

      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.75" fill="none" />

      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />

    </svg>

  );

}



export function ProductPricingPageView({ config }: ProductPricingPageViewProps): ReactElement {

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const { selectCheckoutIntent } = useCheckoutIntentSelection();

  const { session, loading: authLoading } = useSaaSProfile();

  const sessionRef = useRef(session);
  sessionRef.current = session;
  const getAccessToken = useCallback(
    (): string | null => sessionRef.current?.access_token ?? null,
    []
  );

  const { entitlementsByApp, refetch: refetchEntitlements } = usePlatformProductEntitlements(
    session?.access_token
  );

  const organizationSummary = usePlatformOrganizationWorkspaceSummary(
    getAccessToken,
    session != null && !authLoading
  );

  const planChange = useSubscriptionPlanChange({ accessToken: session?.access_token });



  const singlePlan = config.plans.length === 1;

  const productIconSrc = resolveProductIconSrc(config);

  const entitlement = entitlementsByApp[config.appSlug];

  const productOwned = entitlement?.owned === true;

  const currentPlanSlug = entitlement?.planSlug ?? null;



  const planActions = useMemo(() => {

    const actions = new Map<string, PlanCardOwnershipAction>();

    for (const plan of config.plans) {

      actions.set(

        plan.planSlug,

        resolvePlanCardOwnershipAction({

          productOwned,

          currentPlanSlug,

          targetPlan: plan,

        })

      );

    }

    return actions;

  }, [config.plans, currentPlanSlug, productOwned]);



  const handleSelectTrial = useCallback(

    (planSlug: string) => {

      void selectCheckoutIntent({

        productSlug: config.appSlug,

        planSlug,

        billingCycle: billingPeriod,

        checkoutMode: 'trial',

      });

    },

    [billingPeriod, config.appSlug, selectCheckoutIntent]

  );



  const handleSelectPaid = useCallback(

    (planSlug: string) => {

      const plan = config.plans.find((entry) => entry.planSlug === planSlug);

      const action = planActions.get(planSlug);

      if (plan == null || action == null || action.kind === 'current') {

        return;

      }



      void (async () => {

        if (action.kind === 'change') {

          const result = await planChange.requestPreview({

            productSlug: config.appSlug,

            planSlug,

            billingCycle: billingPeriod,

            changeType: action.changeType,

            targetPlanName: plan.displayName,

            targetSeatsIncluded: plan.seats,

            activeMemberCount: organizationSummary.activeMemberCount,

          });

          if (result.blockedMessage != null) {

            setNoticeMessage(result.blockedMessage);

          }

          return;

        }



        await selectCheckoutIntent({

          productSlug: config.appSlug,

          planSlug,

          billingCycle: billingPeriod,

          checkoutMode: 'paid',

        });

      })();

    },

    [

      billingPeriod,

      config.appSlug,

      config.plans,

      organizationSummary.activeMemberCount,

      planActions,

      planChange,

      selectCheckoutIntent,

    ]

  );



  const handleConfirmPlanChange = useCallback(() => {

    void (async () => {

      const result = await planChange.confirmPlanChange();

      if (result.errorMessage != null) {

        return;

      }

      if (result.successMessage != null) {

        refetchEntitlements();

        setNoticeMessage(result.successMessage);

      }

    })();

  }, [planChange, refetchEntitlements]);



  return (

    <>

      <section

        className={`${styles.pricingSection} ${singlePlan ? styles.pricingSectionSingle : ''}`}

      >

        <div className={styles.pricingHeader}>

          <div className={styles.pricingLabelPill}>

            {productIconSrc ? (

              /* eslint-disable-next-line @next/next/no-img-element */

              <img

                src={productIconSrc}

                alt=""

                className={styles.pricingLabelIcon}

                width={20}

                height={20}

              />

            ) : null}

            <p className={styles.pricingLabel}>{config.label}</p>

          </div>

          <h1 className={styles.pricingTitle}>

            {config.titleHighlight != null && config.titleHighlight.trim() !== '' ? (

              <>

                {config.title}{' '}

                <span className={styles.pricingTitleGradient}>{config.titleHighlight}</span>

              </>

            ) : (

              config.title

            )}

          </h1>

          <p className={styles.pricingIntro}>{config.intro}</p>

          {config.storageHighlights != null && config.storageHighlights.length > 0 ? (

            <ul className={styles.pricingStorageHighlights}>

              {config.storageHighlights.map((item) => (

                <li key={item}>

                  <PricingCheckIcon />

                  <span>{item}</span>

                </li>

              ))}

            </ul>

          ) : null}

          <div className={styles.pricingBillingToggleWrap}>

            <BillingPeriodToggle

              period={billingPeriod}

              annualLabel={config.annualToggleLabel}

              onChange={setBillingPeriod}

            />

          </div>

        </div>

        <div className={singlePlan ? styles.pricingCardsSingle : styles.pricingGrid}>

          {config.plans.map((plan) => (

            <PricingPlanCard

              key={plan.cartItemKey}

              plan={plan}

              billingPeriod={billingPeriod}

              ownershipAction={planActions.get(plan.planSlug)!}

              onSelectTrial={() => handleSelectTrial(plan.planSlug)}

              onSelectPaid={() => handleSelectPaid(plan.planSlug)}

            />

          ))}

        </div>

        {!config.purchasesEnabled ? (
          <div className={styles.pricingFootnoteBanner}>
            <PricingFootnoteIcon />
            <p className={styles.pricingFootnoteText}>
              Purchases are not open yet.{' '}
              <Link href="/products" className={styles.inlineLink}>
                Browse all products
              </Link>
            </p>
          </div>
        ) : null}

      </section>

      <PlanChangeConfirmDialog

        open={planChange.isModalOpen}

        preview={planChange.preview}

        changeType={planChange.pendingRequest?.changeType ?? null}

        isConfirmLoading={planChange.isConfirmLoading}

        confirmError={planChange.confirmError}

        onCancel={planChange.cancelPlanChange}

        onConfirm={handleConfirmPlanChange}

      />

      <ProductNoticeToast message={noticeMessage} onDismiss={() => setNoticeMessage(null)} />

    </>

  );

}

