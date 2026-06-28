import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import type { ReactElement } from 'react';
import { platformDocsAdminContent as content } from '@/platform/content/platformDocsAdminContent';
import { getDocsAdminArticles } from '@/platform/docs/docsAdminCatalog.server';
import { DocsAdminConsole } from '@/presentation/components/Admin/Docs/DocsAdminConsole';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Documentation — Zenformed Admin',
  description: content.console.subtitle,
};

export default function AdminDocsPage(): ReactElement {
  noStore();
  const articles = getDocsAdminArticles();

  return <DocsAdminConsole articles={articles} />;
}
