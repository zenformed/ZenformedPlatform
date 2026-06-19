import type { Metadata } from 'next';
import { Suspense, type ReactElement } from 'react';
import { CheckoutSuccessPageView } from '@/presentation/components/Checkout/CheckoutSuccessPageView';

export const metadata: Metadata = {
  title: 'Checkout complete — Zenformed',
  description: 'Your Zenformed subscription checkout is complete.',
};

export default function CheckoutSuccessPage(): ReactElement {
  return (
    <Suspense fallback={<p style={{ padding: '2rem 1.5rem' }}>Loading…</p>}>
      <CheckoutSuccessPageView />
    </Suspense>
  );
}
