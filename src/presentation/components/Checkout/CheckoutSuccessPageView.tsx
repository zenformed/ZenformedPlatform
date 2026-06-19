'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, type ReactElement } from 'react';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';
import { ProductsPublicShell } from '@/presentation/components/Products/ProductsPublicShell';
import { useCartIntent } from '@/presentation/providers/CartIntentProvider';
import styles from './checkoutSuccess.module.css';

export function CheckoutSuccessPageView(): ReactElement {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearIntent } = useCartIntent();

  useEffect(() => {
    const id = sessionId?.trim() ?? '';
    if (id === '') return;
    clearIntent();
  }, [sessionId, clearIntent]);

  return (
    <ProductsPublicShell backHref={nav.routes.dashboard} backLabel="Dashboard">
      <div className={styles.main}>
        <h1 className={styles.title}>Checkout complete</h1>
        <p className={styles.intro}>
          Thank you for subscribing. Your payment was received and subscription activation is being
          finalized. This usually takes a moment — you do not need to complete checkout again.
        </p>
        {sessionId != null && sessionId.trim() !== '' ? (
          <p className={styles.reference}>Reference: {sessionId}</p>
        ) : null}
        <div className={styles.actions}>
          <Link href={nav.routes.dashboard} className={styles.primaryButton}>
            Go to dashboard
          </Link>
          <Link href={nav.routes.products} className={styles.secondaryButton}>
            Browse products
          </Link>
        </div>
      </div>
    </ProductsPublicShell>
  );
}
