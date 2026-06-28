import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

const ARTICLE_KEY_SEPARATOR = '--';

export type DocsAdminArticleKeyParts = {
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly slug: string;
};

const LEGACY_EDITOR_ID_MAP: Readonly<Record<string, DocsAdminArticleKeyParts>> = {
  'welcome-to-buildcore': {
    product: 'buildcore',
    category: 'getting-started',
    slug: 'welcome',
  },
};

export function encodeDocsAdminArticleKey(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): string {
  return `${product}${ARTICLE_KEY_SEPARATOR}${category}${ARTICLE_KEY_SEPARATOR}${slug}`;
}

export function decodeDocsAdminArticleKey(editorId: string): DocsAdminArticleKeyParts | undefined {
  const legacy = LEGACY_EDITOR_ID_MAP[editorId];
  if (legacy != null) {
    return legacy;
  }

  const parts = editorId.split(ARTICLE_KEY_SEPARATOR);
  if (parts.length !== 3) {
    return undefined;
  }

  const [product, category, slug] = parts;
  if (product.trim() === '' || category.trim() === '' || slug.trim() === '') {
    return undefined;
  }

  return {
    product: product as DocsProductSlug,
    category: category as DocsCategorySlug,
    slug,
  };
}

export function docsMarkdownRelativePath(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): string {
  return `docs/content/${product}/${category}/${slug}.md`;
}
