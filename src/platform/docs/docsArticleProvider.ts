import 'server-only';

import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import type { DocsArticleRoute } from '@/platform/docs/docsArticleFrontmatter';
import { loadPublicDocsArticles } from '@/platform/docs/docsPublicArticleLoader.server';

export async function getAllDocsArticlesFromProvider(): Promise<readonly DocsArticle[]> {
  return loadPublicDocsArticles();
}

export async function getDocsArticleFromProvider(
  productSlug: DocsProductSlug,
  categorySlug: DocsCategorySlug,
  articleSlug: string,
): Promise<DocsArticle | undefined> {
  const articles = await getAllDocsArticlesFromProvider();
  return articles.find(
    (article) =>
      article.product === productSlug &&
      article.category === categorySlug &&
      article.slug === articleSlug,
  );
}

export async function getAllDocsArticleRoutesFromProvider(): Promise<readonly DocsArticleRoute[]> {
  const articles = await getAllDocsArticlesFromProvider();
  return articles.map((article) => ({
    product: article.product,
    category: article.category,
    slug: article.slug,
  }));
}

export function clearDocsArticleProviderCache(): void {
  // React cache() is request-scoped; public loader invalidation is handled by revalidation/noStore.
}
