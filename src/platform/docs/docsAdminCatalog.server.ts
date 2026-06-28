import 'server-only';

import { formatEstimatedReadTime } from '@/platform/docs/docsArticleFrontmatter';
import { clearDocsArticleProviderCache } from '@/platform/docs/docsArticleProvider';
import {
  decodeDocsAdminArticleKey,
  docsMarkdownRelativePath,
  encodeDocsAdminArticleKey,
} from '@/platform/docs/docsAdminArticleKey';
import { DOCS_ADMIN_PLACEHOLDER_ARTICLES } from '@/platform/docs/docsAdminCatalogData';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import { loadDocsMarkdownFiles } from '@/platform/docs/docsMarkdownLoader';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { docsArticleId } from '@/platform/docs/docsArticleFrontmatter';

function mapMarkdownFileToAdminArticle(
  file: ReturnType<typeof loadDocsMarkdownFiles>[number],
): DocsAdminArticle {
  const { frontmatter, content } = file;
  const articleKey = encodeDocsAdminArticleKey(
    frontmatter.product,
    frontmatter.category,
    frontmatter.slug,
  );

  return {
    id: docsArticleId(frontmatter.product, frontmatter.category, frontmatter.slug),
    editorId: articleKey,
    articleKey,
    contentPath: docsMarkdownRelativePath(
      frontmatter.product,
      frontmatter.category,
      frontmatter.slug,
    ),
    source: 'markdown',
    slug: frontmatter.slug,
    title: frontmatter.title,
    summary: frontmatter.summary ?? '',
    product: frontmatter.product,
    category: frontmatter.category,
    visibility: frontmatter.visibility,
    status: frontmatter.published ? 'published' : 'draft',
    tags: [...frontmatter.tags],
    estimatedReadTime: formatEstimatedReadTime(frontmatter.estimatedReadTime),
    lastUpdated: frontmatter.lastUpdated,
    author: frontmatter.author,
    authorContext: frontmatter.authorContext ?? '',
    relatedArticles: [],
    content,
  };
}

function markdownArticleIdentity(article: DocsAdminArticle): string {
  return `${article.product}/${article.category}/${article.slug}`;
}

export function getDocsAdminMarkdownArticles(): readonly DocsAdminArticle[] {
  return loadDocsMarkdownFiles().map(mapMarkdownFileToAdminArticle);
}

export function getDocsAdminArticles(): readonly DocsAdminArticle[] {
  const markdownArticles = getDocsAdminMarkdownArticles();
  const markdownIdentities = new Set(markdownArticles.map(markdownArticleIdentity));

  const placeholders = DOCS_ADMIN_PLACEHOLDER_ARTICLES.filter((article) => {
    const identity = `${article.product}/${article.category}/${article.slug}`;
    return !markdownIdentities.has(identity);
  }).map((article) => ({
    ...article,
    articleKey: article.editorId,
    source: 'placeholder' as const,
  }));

  return [...markdownArticles, ...placeholders].sort((left, right) =>
    left.title.localeCompare(right.title),
  );
}

export function getDocsAdminArticle(editorId: string): DocsAdminArticle | undefined {
  return getDocsAdminArticles().find((article) => article.editorId === editorId);
}

export function getDocsAdminArticleByKey(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): DocsAdminArticle | undefined {
  const articleKey = encodeDocsAdminArticleKey(product, category, slug);
  return getDocsAdminArticle(articleKey);
}

export function getDocsAdminEditorIds(): readonly string[] {
  return getDocsAdminArticles().map((article) => article.editorId);
}

export function resolveDocsAdminArticleKey(editorId: string): ReturnType<typeof decodeDocsAdminArticleKey> {
  return decodeDocsAdminArticleKey(editorId);
}

export function invalidateDocsArticleCaches(): void {
  clearDocsArticleProviderCache();
}
