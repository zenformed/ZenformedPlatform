import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import { getDocsCategory, getDocsProduct } from '@/platform/docs/docsCatalog';
import type { DocsCategory, DocsProduct } from '@/platform/docs/docsTypes';

export function mapDocsAdminArticleToDocsArticle(article: DocsAdminArticle): DocsArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    product: article.product,
    category: article.category,
    visibility: article.visibility,
    tags: [...article.tags],
    estimatedReadTime: article.estimatedReadTime,
    lastUpdated: article.lastUpdated,
    author: article.author,
    relatedArticles: [...article.relatedArticles],
    previousArticle: article.previousArticle,
    nextArticle: article.nextArticle,
    content: article.content,
  };
}

export type ResolvedDocsAdminArticlePreview = {
  readonly article: DocsArticle;
  readonly adminArticle: DocsAdminArticle;
  readonly product: DocsProduct;
  readonly category: DocsCategory;
};

export function resolveDocsAdminArticlePreview(
  article: DocsAdminArticle,
): ResolvedDocsAdminArticlePreview | undefined {
  const product = getDocsProduct(article.product);
  const category = getDocsCategory(article.product, article.category);

  if (product == null || category == null) {
    return undefined;
  }

  return {
    article: mapDocsAdminArticleToDocsArticle(article),
    adminArticle: article,
    product,
    category,
  };
}
