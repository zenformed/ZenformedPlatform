import type { DocsArticleFrontmatter } from '@/platform/docs/docsArticleFrontmatter';
import { parseEstimatedReadTimeMinutes } from '@/platform/docs/docsFrontmatterGenerator';
import type { UpsertPlatformDocsArticleInput } from '@/platform/docs/docsDatabaseTypes';

export function mapFrontmatterToUpsertInput(
  frontmatter: DocsArticleFrontmatter,
  content: string,
  options?: { readonly source?: string; readonly publishedAt?: string | null },
): UpsertPlatformDocsArticleInput {
  return {
    product: frontmatter.product,
    category: frontmatter.category,
    slug: frontmatter.slug,
    title: frontmatter.title,
    summary: frontmatter.summary?.trim() ?? '',
    visibility: frontmatter.visibility,
    status: frontmatter.published ? 'published' : 'draft',
    tags: frontmatter.tags,
    estimatedReadTimeMinutes:
      typeof frontmatter.estimatedReadTime === 'number'
        ? frontmatter.estimatedReadTime
        : parseEstimatedReadTimeMinutes(String(frontmatter.estimatedReadTime)),
    author: frontmatter.author,
    bodyMarkdown: content,
    authorContext: frontmatter.authorContext,
    source: options?.source ?? 'markdown',
    publishedAt: frontmatter.published ? (options?.publishedAt ?? null) : null,
  };
}
