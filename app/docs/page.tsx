import type { ReactElement } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import {
  getPopularDocsLandingArticles,
  getRecentDocsLandingUpdates,
} from '@/platform/docs/docsLandingCatalog.server';
import { DocsBottomSections } from '@/presentation/components/Docs/DocsBottomSections';
import { DocsHero } from '@/presentation/components/Docs/DocsHero';
import { DocsIndexGrid } from '@/presentation/components/Docs/DocsIndexGrid';
import { DocsShell } from '@/presentation/components/Docs/DocsShell';
import styles from './docs.module.css';

export const dynamic = 'force-dynamic';

export default async function DocsPage(): Promise<ReactElement> {
  noStore();
  const [popularArticles, recentUpdates] = await Promise.all([
    getPopularDocsLandingArticles(),
    getRecentDocsLandingUpdates(),
  ]);

  return (
    <DocsShell>
      <DocsHero />
      <div className={styles.docsSectionHeader}>
        <h2 className={styles.docsSectionTitle}>Browse documentation</h2>
        <p className={styles.docsSectionIntro}>Select a product to explore its documentation.</p>
      </div>
      <DocsIndexGrid />
      <DocsBottomSections popularArticles={popularArticles} recentUpdates={recentUpdates} />
    </DocsShell>
  );
}
