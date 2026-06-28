import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export function isPublicDocsCategoryListingArticle(article: DocsArticle): boolean {
  return article.visibility === 'public';
}

export function filterPublicDocsCategoryArticles(
  articles: readonly DocsArticle[],
  productSlug: DocsProductSlug,
  categorySlug: DocsCategorySlug,
): readonly DocsArticle[] {
  return articles
    .filter(
      (article) =>
        article.product === productSlug &&
        article.category === categorySlug &&
        isPublicDocsCategoryListingArticle(article),
    )
    .sort((left, right) => left.title.localeCompare(right.title));
}

export function countPublicDocsCategoryArticles(
  articles: readonly DocsArticle[],
  productSlug: DocsProductSlug,
  categorySlug: DocsCategorySlug,
): number {
  return filterPublicDocsCategoryArticles(articles, productSlug, categorySlug).length;
}

export function buildPublicDocsCategoryArticleCounts(
  articles: readonly DocsArticle[],
  productSlug: DocsProductSlug,
): Readonly<Partial<Record<DocsCategorySlug, number>>> {
  const counts: Partial<Record<DocsCategorySlug, number>> = {};

  for (const article of articles) {
    if (article.product !== productSlug || !isPublicDocsCategoryListingArticle(article)) {
      continue;
    }

    counts[article.category] = (counts[article.category] ?? 0) + 1;
  }

  return counts;
}
