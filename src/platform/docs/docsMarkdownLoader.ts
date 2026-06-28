import 'server-only';

import type { DocsArticle, DocsArticleRef } from '@/platform/docs/docsArticleTypes';
import {
  docsArticleId,
  formatEstimatedReadTime,
  resolveFrontmatterRef,
  type DocsArticleFrontmatterRef,
  type ParsedDocsArticleFile,
} from '@/platform/docs/docsArticleFrontmatter';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { loadDocsMarkdownFiles } from '@/platform/docs/docsMarkdownFiles';

export { loadDocsMarkdownFiles } from '@/platform/docs/docsMarkdownFiles';

function buildTitleLookup(
  parsedFiles: readonly ParsedDocsArticleFile[],
): (product: DocsProductSlug, category: DocsCategorySlug, slug: string) => string | undefined {
  const titleByKey = new Map<string, string>();

  for (const file of parsedFiles) {
    const { product, category, slug, title } = file.frontmatter;
    titleByKey.set(`${product}/${category}/${slug}`, title);
  }

  return (product, category, slug) => titleByKey.get(`${product}/${category}/${slug}`);
}

function mapParsedFileToArticle(
  file: ParsedDocsArticleFile,
  titleLookup: (product: DocsProductSlug, category: DocsCategorySlug, slug: string) => string | undefined,
): DocsArticle {
  const { frontmatter, content } = file;
  const { product, category, slug } = frontmatter;

  const resolveRef = (ref: DocsArticleFrontmatterRef): DocsArticleRef =>
    resolveFrontmatterRef(ref, product, category, titleLookup);

  return {
    id: docsArticleId(product, category, slug),
    slug,
    title: frontmatter.title,
    summary: frontmatter.summary,
    product,
    category,
    visibility: frontmatter.visibility,
    tags: frontmatter.tags,
    estimatedReadTime: formatEstimatedReadTime(frontmatter.estimatedReadTime),
    lastUpdated: frontmatter.lastUpdated,
    author: frontmatter.author,
    relatedArticles: (frontmatter.relatedArticles ?? []).map(resolveRef),
    previousArticle:
      frontmatter.previousArticle != null ? resolveRef(frontmatter.previousArticle) : undefined,
    nextArticle: frontmatter.nextArticle != null ? resolveRef(frontmatter.nextArticle) : undefined,
    content,
  };
}

export function loadDocsArticlesFromMarkdown(options?: {
  readonly includeUnpublished?: boolean;
}): readonly DocsArticle[] {
  const parsedFiles = loadDocsMarkdownFiles();
  const titleLookup = buildTitleLookup(parsedFiles);
  const includeUnpublished = options?.includeUnpublished ?? false;

  return parsedFiles
    .filter((file) => includeUnpublished || file.frontmatter.published)
    .map((file) => mapParsedFileToArticle(file, titleLookup));
}

export function loadDocsArticleFromMarkdown(
  productSlug: DocsProductSlug,
  categorySlug: DocsCategorySlug,
  articleSlug: string,
  options?: { readonly includeUnpublished?: boolean },
): DocsArticle | undefined {
  return loadDocsArticlesFromMarkdown(options).find(
    (article) =>
      article.product === productSlug &&
      article.category === categorySlug &&
      article.slug === articleSlug,
  );
}
