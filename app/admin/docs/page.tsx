import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import type { ReactElement } from 'react';
import { getDocsAdminArticles } from '@/platform/docs/docsAdminCatalog.server';
import { DocsAdminConsole } from '@/presentation/components/Admin/Docs/DocsAdminConsole';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Documentation — Zenformed Admin',
  description: 'Manage Zenformed product documentation.',
};

export default async function AdminDocsPage(): Promise<ReactElement> {
  noStore();
  const articles = await getDocsAdminArticles();

  return <DocsAdminConsole articles={articles} />;
}
