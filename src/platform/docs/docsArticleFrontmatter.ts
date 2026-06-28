import type { DocsArticleRef, DocsArticleVisibility } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export const DOCS_CONTENT_ROOT = 'docs/content';

export type DocsArticleFrontmatterRef = {
  readonly slug: string;
  readonly title?: string;
  readonly product?: DocsProductSlug;
  readonly category?: DocsCategorySlug;
};

export type DocsArticleFrontmatter = {
  readonly title: string;
  readonly slug: string;
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly summary?: string;
  readonly visibility: DocsArticleVisibility;
  readonly tags: readonly string[];
  readonly estimatedReadTime: number | string;
  readonly lastUpdated: string;
  readonly author: string;
  readonly published: boolean;
  readonly relatedArticles?: readonly DocsArticleFrontmatterRef[];
  readonly previousArticle?: DocsArticleFrontmatterRef;
  readonly nextArticle?: DocsArticleFrontmatterRef;
  /** Staff-only notes for Documentation AI; not shown on public docs pages. */
  readonly authorContext?: string;
};

export type ParsedDocsArticleFile = {
  readonly filePath: string;
  readonly frontmatter: DocsArticleFrontmatter;
  readonly content: string;
};

export type DocsArticleRoute = {
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly slug: string;
};

export function docsArticleId(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): string {
  return `${product}-${category}-${slug}`;
}

export function formatEstimatedReadTime(value: number | string): string {
  if (typeof value === 'number') {
    return `${value} min read`;
  }

  const trimmed = value.trim();
  if (/min/i.test(trimmed)) {
    return trimmed;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isNaN(parsed)) {
    return `${parsed} min read`;
  }

  return trimmed;
}

export function resolveFrontmatterRef(
  ref: DocsArticleFrontmatterRef,
  fallbackProduct: DocsProductSlug,
  fallbackCategory: DocsCategorySlug,
  titleLookup: (product: DocsProductSlug, category: DocsCategorySlug, slug: string) => string | undefined,
): DocsArticleRef {
  const product = ref.product ?? fallbackProduct;
  const category = ref.category ?? fallbackCategory;
  const title = ref.title ?? titleLookup(product, category, ref.slug) ?? ref.slug;

  return {
    slug: ref.slug,
    title,
    product,
    category,
  };
}
