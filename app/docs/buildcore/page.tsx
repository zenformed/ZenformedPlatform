import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { BUILDCORE_DOCS_PRODUCT } from '@/platform/docs/docsCatalog';
import { DocsCategoryGrid } from '@/presentation/components/Docs/DocsCategoryGrid';
import { DocsProductPageHero } from '@/presentation/components/Docs/DocsProductPageHero';
import { DocsShell } from '@/presentation/components/Docs/DocsShell';

export const metadata: Metadata = {
  title: 'BuildCore Documentation — Zenformed',
  description: BUILDCORE_DOCS_PRODUCT.subtitle,
};

export default function BuildCoreDocsPage(): ReactElement {
  const product = BUILDCORE_DOCS_PRODUCT;

  return (
    <DocsShell>
      <DocsProductPageHero product={product} />
      <DocsCategoryGrid productSlug={product.slug} categories={product.categories} />
    </DocsShell>
  );
}
