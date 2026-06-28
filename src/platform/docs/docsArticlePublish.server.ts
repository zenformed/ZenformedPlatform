import 'server-only';

import { invalidateDocsArticleCaches, getDocsAdminArticle } from '@/platform/docs/docsAdminCatalog.server';
import { validateDocsArticleForPublish } from '@/platform/docs/docsArticlePublishValidation';
import {
  buildSaveDocsArticleFrontmatter,
  composeDocsMarkdownFile,
} from '@/platform/docs/docsFrontmatterGenerator';
import { writeDocsMarkdownFile } from '@/platform/docs/docsMarkdownWriter.server';
import type { DocsArticlePublishValidationErrorCode } from '@/platform/docs/docsArticlePublishValidation';

export type PublishDocsAdminArticleResult =
  | { readonly ok: true; readonly lastUpdated: string }
  | {
      readonly ok: false;
      readonly error: 'not_found' | 'already_published' | DocsArticlePublishValidationErrorCode;
    };

export function publishDocsAdminArticle(articleKey: string): PublishDocsAdminArticleResult {
  const article = getDocsAdminArticle(articleKey);

  if (article == null || article.source !== 'markdown') {
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
