import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';

export function shouldShowDocsDiscardDraftButton(
  article: Pick<DocsAdminArticle, 'status' | 'source'>,
): boolean {
  return (
    (article.source === 'markdown' || article.source === 'database') && article.status === 'draft'
  );
}
