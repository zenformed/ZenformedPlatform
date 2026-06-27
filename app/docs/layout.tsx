import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docs — Zenformed',
  description: 'Find guides, references, and answers across all Zenformed products.',
};

export default function DocsLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return children;
}
