import type { ReactElement } from 'react';
import { DocsBottomSections } from '@/presentation/components/Docs/DocsBottomSections';
import { DocsHero } from '@/presentation/components/Docs/DocsHero';
import { DocsIndexGrid } from '@/presentation/components/Docs/DocsIndexGrid';
import { DocsShell } from '@/presentation/components/Docs/DocsShell';
import styles from './docs.module.css';

export default function DocsPage(): ReactElement {
  return (
    <DocsShell>
      <DocsHero />
      <div className={styles.docsSectionHeader}>
        <h2 className={styles.docsSectionTitle}>Browse documentation</h2>
        <p className={styles.docsSectionIntro}>Select a product to explore its documentation.</p>
      </div>
      <DocsIndexGrid />
      <DocsBottomSections />
    </DocsShell>
  );
}
