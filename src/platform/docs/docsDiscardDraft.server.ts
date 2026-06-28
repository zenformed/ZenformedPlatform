import 'server-only';

import { invalidateDocsArticleCaches } from '@/platform/docs/docsAdminCatalog.server';
import {
  deleteDocsMarkdownFile,
  docsMarkdownFileExists,
  removeEmptyDocsArticleImageDirectory,
} from '@/platform/docs/docsMarkdownFileOps';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export type DiscardDocsDraftArticleInput = {
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly slug: string;
  readonly published: boolean;
};

export type DiscardDocsDraftArticleResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: 'not_found' | 'published' | 'delete_failed' };

export function discardDocsDraftArticle(input: DiscardDocsDraftArticleInput): DiscardDocsDraftArticleResult {
  if (input.published) {
    return { ok: false, error: 'published' };
  }

  if (!docsMarkdownFileExists(input.product, input.category, input.slug)) {
    return { ok: false, error: 'not_found' };
  }

  const deleted = deleteDocsMarkdownFile(input.product, input.category, input.slug);
  if (!deleted) {
    return { ok: false, error: 'delete_failed' };
  }

  removeEmptyDocsArticleImageDirectory(input.product, input.slug);
  invalidateDocsArticleCaches();

  return { ok: true };
}
