import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { getDocsAdminArticle } from '@/platform/docs/docsAdminCatalog.server';
import { DocsAdminArticleEditor } from '@/presentation/components/Admin/Docs/DocsAdminArticleEditor';

export const dynamic = 'force-dynamic';

type AdminDocsArticlePageProps = {
  readonly params: {
    readonly editorId: string;
  };
};

export function generateMetadata({ params }: AdminDocsArticlePageProps): Metadata {
  noStore();
  const article = getDocsAdminArticle(params.editorId);

  if (article == null) {
    return { title: 'Not Found — Zenformed Admin' };
  }

  return {
    title: `${article.title} — Documentation Editor`,
    description: article.summary,
  };
}

export default function AdminDocsArticlePage({ params }: AdminDocsArticlePageProps): ReactElement {
  noStore();
  const article = getDocsAdminArticle(params.editorId);

  if (article == null) {
    notFound();
  }

  return <DocsAdminArticleEditor article={article} />;
}
