import 'server-only';

import {
  invalidateDocsArticleCaches,
  getDocsAdminArticle,
} from '@/platform/docs/docsAdminCatalog.server';
import { validateDocsArticleForPublish } from '@/platform/docs/docsArticlePublishValidation';
import {
  articleExistsInDatabase,
  getPlatformDocsArticleRow,
  mapFrontmatterToUpsertInput,
  softDeletePlatformDocsDraftArticle,
  upsertPlatformDocsArticle,
} from '@/platform/docs/docsArticleRepository.server';
import { isDocsDatabaseContentSource } from '@/platform/docs/docsContentSource';
import { discardDocsDraftMarkdownArticle } from '@/platform/docs/docsDiscardDraft.server';
import {
  buildNewDocsMarkdownFile,
  buildSaveDocsArticleFrontmatter,
  composeDocsMarkdownFile,
  parseEstimatedReadTimeMinutes,
} from '@/platform/docs/docsFrontmatterGenerator';
import { writeDocsMarkdownFile } from '@/platform/docs/docsMarkdownWriter.server';
import type { DocsArticlePublishValidationErrorCode } from '@/platform/docs/docsArticlePublishValidation';
import type { DocsArticleVisibility } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { formatDocsLastUpdatedFromTimestamp } from '@/platform/docs/docsDatabaseArticleMapper';

export type SaveDocsAdminArticleInput = {
  readonly title: string;
  readonly slug: string;
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly summary: string;
  readonly visibility: DocsArticleVisibility;
  readonly tags: readonly string[];
  readonly estimatedReadTime: string;
  readonly author: string;
  readonly content: string;
  readonly authorContext?: string;
};

export type PublishDocsAdminArticleResult =
  | { readonly ok: true; readonly lastUpdated: string }
  | {
      readonly ok: false;
      readonly error: 'not_found' | 'already_published' | DocsArticlePublishValidationErrorCode;
    };

export async function saveDocsAdminArticle(
  articleKey: string,
  input: SaveDocsAdminArticleInput,
  options?: { readonly allowPublishedStatus?: boolean },
): Promise<
  | { readonly ok: true; readonly lastUpdated: string; readonly published: boolean }
  | { readonly ok: false; readonly error: 'not_found' | 'publish_from_preview_only' }
> {
  const existingArticle = await getDocsAdminArticle(articleKey);
  if (existingArticle == null || existingArticle.source === 'placeholder') {
    return { ok: false, error: 'not_found' };
  }

  const isPublished = existingArticle.status === 'published';

  if (isDocsDatabaseContentSource() || existingArticle.source === 'database') {
    const frontmatter = buildSaveDocsArticleFrontmatter({
      ...input,
      published: isPublished,
    });

    const existingRow = await getPlatformDocsArticleRow(input.product, input.category, input.slug);

    await upsertPlatformDocsArticle({
      product: input.product,
      category: input.category,
      slug: input.slug,
      title: frontmatter.title,
      summary: frontmatter.summary ?? '',
      visibility: frontmatter.visibility,
      status: isPublished ? 'published' : 'draft',
      tags: frontmatter.tags,
      estimatedReadTimeMinutes: parseEstimatedReadTimeMinutes(input.estimatedReadTime),
      author: frontmatter.author,
      bodyMarkdown: input.content,
      authorContext: frontmatter.authorContext,
      source: 'database',
      publishedAt: isPublished ? (existingRow?.published_at ?? new Date().toISOString()) : null,
    });

    invalidateDocsArticleCaches();
    return { ok: true, lastUpdated: frontmatter.lastUpdated, published: isPublished };
  }

  if (options?.allowPublishedStatus !== true && isPublished === false) {
    // Draft saves only through this endpoint; publish uses preview flow.
  }

  const frontmatter = buildSaveDocsArticleFrontmatter({
    ...input,
    published: isPublished,
  });
  const markdown = composeDocsMarkdownFile(frontmatter, input.content);
  writeDocsMarkdownFile(input.product, input.category, input.slug, markdown);
  invalidateDocsArticleCaches();

  return { ok: true, lastUpdated: frontmatter.lastUpdated, published: isPublished };
}

export async function publishDocsAdminArticle(
  articleKey: string,
): Promise<PublishDocsAdminArticleResult> {
  const article = await getDocsAdminArticle(articleKey);

  if (article == null || article.source === 'placeholder') {
    return { ok: false, error: 'not_found' };
  }

  if (article.status === 'published') {
    return { ok: false, error: 'already_published' };
  }

  const validation = validateDocsArticleForPublish({
    title: article.title,
    summary: article.summary,
    category: article.category,
    content: article.content,
  });

  if (!validation.ok) {
    return { ok: false, error: validation.code };
  }

  if (isDocsDatabaseContentSource() || article.source === 'database') {
    const now = new Date().toISOString();
    const row = await upsertPlatformDocsArticle({
      product: article.product,
      category: article.category,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      visibility: article.visibility,
      status: 'published',
      tags: article.tags,
      estimatedReadTimeMinutes: parseEstimatedReadTimeMinutes(article.estimatedReadTime),
      author: article.author,
      bodyMarkdown: article.content,
      authorContext: article.authorContext,
      source: 'database',
      publishedAt: now,
    });

    invalidateDocsArticleCaches();
    return { ok: true, lastUpdated: formatDocsLastUpdatedFromTimestamp(row.updated_at) };
  }

  const frontmatter = buildSaveDocsArticleFrontmatter({
    title: article.title,
    slug: article.slug,
    product: article.product,
    category: article.category,
    summary: article.summary,
    visibility: article.visibility,
    tags: article.tags,
    estimatedReadTime: article.estimatedReadTime,
    author: article.author,
    published: true,
    content: article.content,
    authorContext: article.authorContext,
  });

  const markdown = composeDocsMarkdownFile(frontmatter, article.content);
  writeDocsMarkdownFile(article.product, article.category, article.slug, markdown);
  invalidateDocsArticleCaches();

  return { ok: true, lastUpdated: frontmatter.lastUpdated };
}

export async function discardDocsAdminArticle(
  articleKey: string,
): Promise<
  | { readonly ok: true }
  | { readonly ok: false; readonly error: 'not_found' | 'published' | 'delete_failed' }
> {
  const article = await getDocsAdminArticle(articleKey);
  if (article == null || article.source === 'placeholder') {
    return { ok: false, error: 'not_found' };
  }

  if (article.status === 'published') {
    return { ok: false, error: 'published' };
  }

  if (isDocsDatabaseContentSource() || article.source === 'database') {
    const result = await softDeletePlatformDocsDraftArticle(
      article.product,
      article.category,
      article.slug,
    );

    if (result === 'not_found') {
      return { ok: false, error: 'not_found' };
    }

    if (result === 'published') {
      return { ok: false, error: 'published' };
    }

    invalidateDocsArticleCaches();
    return { ok: true };
  }

  return discardDocsDraftMarkdownArticle({
    product: article.product,
    category: article.category,
    slug: article.slug,
    published: false,
  });
}

export type CreateDocsAdminArticleInput = {
  readonly title: string;
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly slug: string;
  readonly authorContext?: string;
  readonly content?: string;
};

export async function createDatabaseDocsAdminArticle(
  input: CreateDocsAdminArticleInput,
): Promise<
  | {
      readonly ok: true;
      readonly articleKey: string;
      readonly editorId: string;
      readonly slug: string;
      readonly product: DocsProductSlug;
      readonly category: DocsCategorySlug;
      readonly contentPath?: string;
      readonly reusedExistingDraft: boolean;
    }
  | { readonly ok: false; readonly error: 'article_exists' }
> {
  const articleKey = `${input.product}--${input.category}--${input.slug}`;
  const exists = await articleExistsInDatabase(input.product, input.category, input.slug);
  if (exists) {
    return { ok: false, error: 'article_exists' };
  }

  const { frontmatter, content } = buildNewDocsMarkdownFile({
      title: input.title,
      slug: input.slug,
      product: input.product,
      category: input.category,
      published: false,
      ...(input.authorContext?.trim() ? { authorContext: input.authorContext.trim() } : {}),
    });

  await upsertPlatformDocsArticle(
    mapFrontmatterToUpsertInput(frontmatter, input.content ?? content, { source: 'database' }),
  );
  invalidateDocsArticleCaches();

  return {
    ok: true,
    articleKey,
    editorId: articleKey,
    slug: input.slug,
    product: input.product,
    category: input.category,
    reusedExistingDraft: false,
  };
}
