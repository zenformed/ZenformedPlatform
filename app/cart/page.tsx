import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { CartPageView } from '@/presentation/components/Cart/CartPageView';

export const metadata: Metadata = {
  title: 'Cart — Zenformed',
  description: 'Review your selected Zenformed product plan.',
};

export default function CartPage(): ReactElement {
  return <CartPageView />;
}
