import 'server-only';

import { formatEstimatedReadTime } from '@/platform/docs/docsArticleFrontmatter';
import { clearDocsArticleProviderCache } from '@/platform/docs/docsArticleProvider';
import {
  decodeDocsAdminArticleKey,
  docsMarkdownRelativePath,
  encodeDocsAdminArticleKey,
} from '@/platform/docs/docsAdminArticleKey';
import { loadDocsAdminArticlesCached } from '@/platform/docs/docsAdminArticleLoader.server';
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

export function getDocsAdminMarkdownArticles(): readonly DocsAdminArticle[] {
  return loadDocsMarkdownFiles().map(mapMarkdownFileToAdminArticle);
}

export async function getDocsAdminArticles(): Promise<readonly DocsAdminArticle[]> {
  return loadDocsAdminArticlesCached();
}

export async function getDocsAdminArticle(editorId: string): Promise<DocsAdminArticle | undefined> {
  const articles = await getDocsAdminArticles();
  return articles.find((article) => article.editorId === editorId);
}

export async function getDocsAdminArticleByKey(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): Promise<DocsAdminArticle | undefined> {
  const articleKey = encodeDocsAdminArticleKey(product, category, slug);
  return getDocsAdminArticle(articleKey);
}

export async function getDocsAdminEditorIds(): Promise<readonly string[]> {
  const articles = await getDocsAdminArticles();
  return articles.map((article) => article.editorId);
}

export function resolveDocsAdminArticleKey(editorId: string): ReturnType<typeof decodeDocsAdminArticleKey> {
  return decodeDocsAdminArticleKey(editorId);
}

export function invalidateDocsArticleCaches(): void {
  clearDocsArticleProviderCache();
}
