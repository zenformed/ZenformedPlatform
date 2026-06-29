import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { getPublicDocsCategoryArticles } from '@/platform/docs/docsArticleCatalog';
import {
  paginateDocsCategoryArticles,
  parseDocsCategoryPageParam,
} from '@/platform/docs/docsCategoryPagination';
import {
  getDocsCategory,
  getDocsProduct,
  getDocsProductCategorySlugs,
} from '@/platform/docs/docsCatalog';
import type { DocsProductSlug } from '@/platform/docs/docsTypes';
import { DocsCategoryPageContent } from '@/presentation/components/Docs/DocsCategoryPageContent';
import { DocsShell } from '@/presentation/components/Docs/DocsShell';

const PRODUCT_SLUG: DocsProductSlug = 'buildcore';

export const dynamic = 'force-dynamic';

type BuildCoreCategoryPageProps = {
  readonly params: {
    readonly category: string;
  };
  readonly searchParams: {
    readonly page?: string | string[];
  };
};

export function generateStaticParams(): { category: string }[] {
  return getDocsProductCategorySlugs(PRODUCT_SLUG).map((category) => ({ category }));
}

export function generateMetadata({ params }: BuildCoreCategoryPageProps): Metadata {
  const product = getDocsProduct(PRODUCT_SLUG);
  const category = getDocsCategory(PRODUCT_SLUG, params.category);

  if (category == null) {
    return { title: 'Not Found — Zenformed Docs' };
  }

  return {
    title: `${category.title} — ${product.name} Documentation`,
    description: category.description,
  };
}

export default async function BuildCoreCategoryPage({
  params,
  searchParams,
}: BuildCoreCategoryPageProps): Promise<ReactElement> {
  const product = getDocsProduct(PRODUCT_SLUG);
  const category = getDocsCategory(PRODUCT_SLUG, params.category);

  if (category == null) {
    notFound();
  }

  const allArticles = await getPublicDocsCategoryArticles(PRODUCT_SLUG, category.slug);
  const pagination = paginateDocsCategoryArticles(
    allArticles,
    parseDocsCategoryPageParam(searchParams.page),
  );

  return (
    <DocsShell>
      <DocsCategoryPageContent
        product={product}
        category={category}
        articles={pagination.items}
        pagination={pagination}
      />
    </DocsShell>
  );
}
