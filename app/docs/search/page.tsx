import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { searchPublicDocsArticles } from '@/platform/docs/docsArticleCatalog';
import { getDocsCategory, getDocsProduct, isDocsCategorySlug } from '@/platform/docs/docsCatalog';
import type { DocsProductSlug } from '@/platform/docs/docsTypes';
import { DocsSearchPageContent } from '@/presentation/components/Docs/DocsSearchPageContent';
import { DocsShell } from '@/presentation/components/Docs/DocsShell';

export const dynamic = 'force-dynamic';

type DocsSearchPageProps = {
  readonly searchParams: {
    readonly q?: string | string[];
    readonly product?: string | string[];
    readonly category?: string | string[];
  };
};

function readSearchParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? '';
  }

  return value?.trim() ?? '';
}

function parseProductSlug(value: string): DocsProductSlug | undefined {
  if (value === 'buildcore') {
    return 'buildcore';
  }

  return undefined;
}

export function generateMetadata({ searchParams }: DocsSearchPageProps): Metadata {
  const query = readSearchParam(searchParams.q);

  if (query === '') {
    return {
      title: 'Search — Zenformed Docs',
      description: 'Search published Zenformed documentation.',
    };
  }

  return {
    title: `Search: ${query} — Zenformed Docs`,
    description: `Search results for "${query}" in Zenformed documentation.`,
  };
}

export default function DocsSearchPage({ searchParams }: DocsSearchPageProps): ReactElement {
  const query = readSearchParam(searchParams.q);
  const productParam = readSearchParam(searchParams.product);
  const categoryParam = readSearchParam(searchParams.category);
  const productSlug = parseProductSlug(productParam);
  const product = productSlug != null ? getDocsProduct(productSlug) : undefined;
  const category =
    productSlug != null && categoryParam !== '' && isDocsCategorySlug(productSlug, categoryParam)
      ? getDocsCategory(productSlug, categoryParam)
      : undefined;

  const results =
    query === ''
      ? []
      : searchPublicDocsArticles({
          query,
          product: product?.slug,
          category: category?.slug,
        });

  return (
    <DocsShell>
      <DocsSearchPageContent
        query={query}
        results={results}
        product={product}
        category={category}
      />
    </DocsShell>
  );
}
