'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import {
  CheckoutLegalAcceptance,
  CHECKOUT_LEGAL_ACCEPTANCE_VALIDATION_MESSAGE,
  DEFAULT_LEGAL_PRIVACY_PATH,
  DEFAULT_LEGAL_TERMS_PATH,
  buildCheckoutLegalAcceptancePayload,
} from '@zenformed/core/legal';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { ProductsPublicShell } from '@/presentation/components/Products/ProductsPublicShell';
import { useCartSummary } from '@/presentation/hooks/useCartSummary';
import { useCreateCheckoutSession } from '@/presentation/hooks/useCreateCheckoutSession';
import { useCartIntent } from '@/presentation/providers/CartIntentProvider';
import styles from './cart.module.css';

function formatBillingCycleLabel(billingCycle: 'monthly' | 'annual'): string {
  return billingCycle === 'annual' ? 'Annual' : 'Monthly';
}

export function CartPageView(): ReactElement {
  const { intent, hydrated, clearIntent } = useCartIntent();
  const summaryState = useCartSummary(intent, hydrated);
  const { state: checkoutState, startCheckout } = useCreateCheckoutSession();
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legalValidationMessage, setLegalValidationMessage] = useState<string | null>(null);

  const checkoutLoading = checkoutState.status === 'loading';
  const checkoutError = checkoutState.status === 'error' ? checkoutState.message : null;
  const canContinueToCheckout = legalAccepted && !checkoutLoading;

  return (
    <ProductsPublicShell backHref={nav.routes.products} backLabel="All products">
      <div className={styles.main}>
        <h1 className={styles.title}>Cart</h1>
        <p className={styles.intro}>Review your selected plan before checkout.</p>

        {!hydrated || summaryState.status === 'loading' ? (
          <p className={styles.loadingState}>Loading cart…</p>
        ) : intent == null || summaryState.status === 'idle' ? (
          <>
            <p className={styles.emptyState}>Your cart is empty.</p>
            <Link href={nav.routes.products} className={styles.backLink}>
              Browse products
            </Link>
          </>
        ) : summaryState.status === 'invalid' || summaryState.status === 'error' ? (
          <>
            <p className={styles.errorState}>
              This cart item is invalid or unavailable. Choose a plan again from the products
              page.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={clearIntent}>
                Clear cart
              </button>
              <Link href={nav.routes.products} className={styles.secondaryButton}>
                Browse products
              </Link>
            </div>
          </>
        ) : (
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Selected plan</h2>
            <dl className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <dt className={styles.summaryLabel}>Product</dt>
                <dd className={styles.summaryValue}>{summaryState.summary.productName}</dd>
              </div>
              <div className={styles.summaryRow}>
                <dt className={styles.summaryLabel}>Plan</dt>
                <dd className={styles.summaryValue}>{summaryState.summary.planName}</dd>
              </div>
              <div className={styles.summaryRow}>
                <dt className={styles.summaryLabel}>Billing cycle</dt>
                <dd className={styles.summaryValue}>
                  {formatBillingCycleLabel(summaryState.summary.billingCycle)}
                </dd>
              </div>
              <div className={styles.summaryRow}>
                <dt className={styles.summaryLabel}>Price</dt>
                <dd className={styles.summaryValue}>{summaryState.summary.priceLabel}</dd>
              </div>
              {summaryState.summary.seatsIncluded != null ? (
                <div className={styles.summaryRow}>
                  <dt className={styles.summaryLabel}>Seats included</dt>
                  <dd className={styles.summaryValue}>{summaryState.summary.seatsIncluded}</dd>
                </div>
              ) : null}
            </dl>

            {summaryState.summary.checkoutMode === 'trial' ? (
              <p className={styles.modeBanner}>
                {summaryState.summary.trialDays ?? 14}-day free trial selected
              </p>
            ) : (
              <p className={styles.modeBanner}>Paid plan selected</p>
            )}

            {checkoutError != null ? (
              <p className={styles.checkoutError} role="alert">
                {checkoutError}
              </p>
            ) : null}

            <CheckoutLegalAcceptance
              termsHref={nav.routes.legalTerms ?? DEFAULT_LEGAL_TERMS_PATH}
              privacyHref={nav.routes.legalPrivacy ?? DEFAULT_LEGAL_PRIVACY_PATH}
              checked={legalAccepted}
              onCheckedChange={(checked) => {
                setLegalAccepted(checked);
                if (checked) {
                  setLegalValidationMessage(null);
                }
              }}
              validationMessage={legalValidationMessage}
            />

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={!canContinueToCheckout}
                onClick={() => {
                  if (intent == null) return;
                  if (!legalAccepted) {
                    setLegalValidationMessage(CHECKOUT_LEGAL_ACCEPTANCE_VALIDATION_MESSAGE);
                    return;
                  }
                  setLegalValidationMessage(null);
                  void startCheckout(intent, buildCheckoutLegalAcceptancePayload());
                }}
              >
                {checkoutLoading ? 'Starting checkout…' : 'Continue to checkout'}
              </button>
              <button type="button" className={styles.ghostButton} onClick={clearIntent} disabled={checkoutLoading}>
                Remove item
              </button>
            </div>
          </article>
        )}
      </div>
    </ProductsPublicShell>
  );
}
