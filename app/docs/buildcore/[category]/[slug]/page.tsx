import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { getAllDocsArticleRoutes, resolveDocsArticlePage } from '@/platform/docs/docsArticleCatalog';
import type { DocsProductSlug } from '@/platform/docs/docsTypes';
import { DocsArticleView } from '@/presentation/components/Docs/DocsArticleView';
import { DocsShell } from '@/presentation/components/Docs/DocsShell';

const PRODUCT_SLUG: DocsProductSlug = 'buildcore';

type DocsArticlePageProps = {
  readonly params: {
    readonly category: string;
    readonly slug: string;
  };
};

export function generateStaticParams(): { category: string; slug: string }[] {
  return getAllDocsArticleRoutes()
    .filter((route) => route.product === PRODUCT_SLUG)
    .map((route) => ({
      category: route.category,
      slug: route.slug,
    }));
}

export function generateMetadata({ params }: DocsArticlePageProps): Metadata {
  const resolved = resolveDocsArticlePage(PRODUCT_SLUG, params.category, params.slug);

  if (resolved == null) {
    return { title: 'Not Found — Zenformed Docs' };
  }

  return {
    title: `${resolved.article.title} — ${resolved.product.name} Documentation`,
    description: resolved.article.summary ?? resolved.article.title,
  };
}

export default function BuildCoreArticlePage({ params }: DocsArticlePageProps): ReactElement {
  const resolved = resolveDocsArticlePage(PRODUCT_SLUG, params.category, params.slug);

  if (resolved == null) {
    notFound();
  }

  return (
    <DocsShell>
      <DocsArticleView
        article={resolved.article}
        product={resolved.product}
        category={resolved.category}
      />
    </DocsShell>
  );
}
