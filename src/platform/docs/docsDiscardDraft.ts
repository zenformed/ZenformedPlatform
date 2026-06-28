import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import { isDocsAdminArticleEditable } from '@/platform/docs/docsAdminTypes';

export function shouldShowDocsDiscardDraftButton(
  article: Pick<DocsAdminArticle, 'status' | 'source'>,
): boolean {
  return isDocsAdminArticleEditable(article) && article.status === 'draft';
}
