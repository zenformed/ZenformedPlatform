import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { getDocsAdminArticle } from '@/platform/docs/docsAdminCatalog.server';
import { resolveDocsAdminArticlePreview } from '@/platform/docs/docsArticlePreview';
import { DocsAdminArticlePreviewPage } from '@/presentation/components/Admin/Docs/DocsAdminArticlePreviewPage';

export const dynamic = 'force-dynamic';

type AdminDocsArticlePreviewPageProps = {
  readonly params: {
    readonly editorId: string;
  };
};

export function generateMetadata({ params }: AdminDocsArticlePreviewPageProps): Metadata {
  noStore();
  const article = getDocsAdminArticle(params.editorId);

  if (article == null) {
    return { title: 'Not Found — Zenformed Admin' };
  }

  return {
    title: `${article.title} — Preview`,
    description: article.summary,
  };
}

export default function AdminDocsArticlePreviewRoute({
  params,
}: AdminDocsArticlePreviewPageProps): ReactElement {
  noStore();
  const article = getDocsAdminArticle(params.editorId);

  if (article == null || article.source !== 'markdown') {
    notFound();
  }

  const preview = resolveDocsAdminArticlePreview(article);

  if (preview == null) {
    notFound();
  }

  return <DocsAdminArticlePreviewPage preview={preview} />;
}
