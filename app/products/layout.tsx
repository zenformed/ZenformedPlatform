import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products — Zenformed',
  description: 'Explore BuildCore, ForgeCore, and FormCore plans.',
};

export default function ProductsLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return children;
}
