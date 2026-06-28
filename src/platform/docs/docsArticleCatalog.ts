import 'server-only';

import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import type { DocsArticleRoute } from '@/platform/docs/docsArticleFrontmatter';
import { docsArticleProvider } from '@/platform/docs/docsArticleProvider';
import { getDocsCategory, getDocsProduct } from '@/platform/docs/docsCatalog';
import type { DocsCategory, DocsProduct } from '@/platform/docs/docsTypes';
import {
  buildPublicDocsCategoryArticleCounts,
  filterPublicDocsCategoryArticles,
} from '@/platform/docs/docsPublicArticleCatalog';

export function getDocsArticle(
  productSlug: DocsProductSlug,
  categorySlug: DocsCategorySlug,
  articleSlug: string,
): DocsArticle | undefined {
  return docsArticleProvider.getArticle(productSlug, categorySlug, articleSlug);
}

export function getAllDocsArticleRoutes(): readonly DocsArticleRoute[] {
  return docsArticleProvider.getAllRoutes();
}

export function getAllDocsArticles(): readonly DocsArticle[] {
  return docsArticleProvider.getAllArticles();
}

export function getPublicDocsCategoryArticles(
  productSlug: DocsProductSlug,
  categorySlug: DocsCategorySlug,
): readonly DocsArticle[] {
  return filterPublicDocsCategoryArticles(getAllDocsArticles(), productSlug, categorySlug);
}

export function getPublicDocsCategoryArticleCounts(
  productSlug: DocsProductSlug,
): Readonly<Partial<Record<DocsCategorySlug, number>>> {
  return buildPublicDocsCategoryArticleCounts(getAllDocsArticles(), productSlug);
}

export type ResolvedDocsArticlePage = {
  readonly article: DocsArticle;
  readonly product: DocsProduct;
  readonly category: DocsCategory;
};

export function resolveDocsArticlePage(
  productSlug: DocsProductSlug,
  categorySlug: string,
  articleSlug: string,
): ResolvedDocsArticlePage | undefined {
  const product = getDocsProduct(productSlug);
  const category = getDocsCategory(productSlug, categorySlug);
  if (category == null) {
    return undefined;
  }

  const article = getDocsArticle(productSlug, category.slug, articleSlug);
  if (article == null) {
    return undefined;
  }

  return { article, product, category };
}
