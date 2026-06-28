import 'server-only';

import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import type { DocsArticleRoute } from '@/platform/docs/docsArticleFrontmatter';
import {
  getAllDocsArticleRoutesFromProvider,
  getAllDocsArticlesFromProvider,
  getDocsArticleFromProvider,
} from '@/platform/docs/docsArticleProvider';
import { getDocsCategory, getDocsProduct } from '@/platform/docs/docsCatalog';
import type { DocsCategory, DocsProduct } from '@/platform/docs/docsTypes';
import {
  buildPublicDocsCategoryArticleCounts,
  filterPublicDocsCategoryArticles,
} from '@/platform/docs/docsPublicArticleCatalog';
import {
  searchPublicDocsArticles as searchPublicDocsArticlesCore,
  type DocsPublicSearchResult,
} from '@/platform/docs/docsPublicArticleSearch';
import type { DocsPublicSearchOptions } from '@/platform/docs/docsPublicArticleSearch';

export async function getDocsArticle(
  productSlug: DocsProductSlug,
  categorySlug: DocsCategorySlug,
  articleSlug: string,
): Promise<DocsArticle | undefined> {
  return getDocsArticleFromProvider(productSlug, categorySlug, articleSlug);
}

export async function getAllDocsArticleRoutes(): Promise<readonly DocsArticleRoute[]> {
  return getAllDocsArticleRoutesFromProvider();
}

export async function getAllDocsArticles(): Promise<readonly DocsArticle[]> {
  return getAllDocsArticlesFromProvider();
}

export async function getPublicDocsCategoryArticles(
  productSlug: DocsProductSlug,
  categorySlug: DocsCategorySlug,
): Promise<readonly DocsArticle[]> {
  const articles = await getAllDocsArticles();
  return filterPublicDocsCategoryArticles(articles, productSlug, categorySlug);
}

export async function getPublicDocsCategoryArticleCounts(
  productSlug: DocsProductSlug,
): Promise<Readonly<Partial<Record<DocsCategorySlug, number>>>> {
  const articles = await getAllDocsArticles();
  return buildPublicDocsCategoryArticleCounts(articles, productSlug);
}

export type SearchPublicDocsArticlesOptions = Pick<
  DocsPublicSearchOptions,
  'query' | 'product' | 'category'
>;

export async function searchPublicDocsArticles(
  options: SearchPublicDocsArticlesOptions,
): Promise<readonly DocsPublicSearchResult[]> {
  const articles = await getAllDocsArticles();
  return searchPublicDocsArticlesCore(articles, {
    ...options,
    resolveCategoryTitle: (productSlug, categorySlug) =>
      getDocsCategory(productSlug, categorySlug)?.title,
    resolveProductName: (productSlug) => getDocsProduct(productSlug).name,
  });
}

export type ResolvedDocsArticlePage = {
  readonly article: DocsArticle;
  readonly product: DocsProduct;
  readonly category: DocsCategory;
};

export async function resolveDocsArticlePage(
  productSlug: DocsProductSlug,
  categorySlug: string,
  articleSlug: string,
): Promise<ResolvedDocsArticlePage | undefined> {
  const product = getDocsProduct(productSlug);
  const category = getDocsCategory(productSlug, categorySlug);
  if (category == null) {
    return undefined;
  }

  const article = await getDocsArticle(productSlug, category.slug, articleSlug);
  if (article == null) {
    return undefined;
  }

  return { article, product, category };
}
