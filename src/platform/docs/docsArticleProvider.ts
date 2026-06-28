import 'server-only';

import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import type { DocsArticleRoute } from '@/platform/docs/docsArticleFrontmatter';
import { loadDocsArticlesFromMarkdown } from '@/platform/docs/docsMarkdownLoader';

export type DocsArticleProvider = {
  getArticle(
    productSlug: DocsProductSlug,
    categorySlug: DocsCategorySlug,
    articleSlug: string,
  ): DocsArticle | undefined;
  getAllArticles(): readonly DocsArticle[];
  getAllRoutes(): readonly DocsArticleRoute[];
};

let cachedArticles: readonly DocsArticle[] | undefined;

function getAllArticles(): readonly DocsArticle[] {
  cachedArticles ??= loadDocsArticlesFromMarkdown();
  return cachedArticles;
}

export const docsArticleProvider: DocsArticleProvider = {
  getArticle(productSlug, categorySlug, articleSlug) {
    return getAllArticles().find(
      (article) =>
        article.product === productSlug &&
        article.category === categorySlug &&
        article.slug === articleSlug,
    );
  },
  getAllArticles,
  getAllRoutes() {
    return getAllArticles().map((article) => ({
      product: article.product,
      category: article.category,
      slug: article.slug,
    }));
  },
};

export function clearDocsArticleProviderCache(): void {
  cachedArticles = undefined;
}
