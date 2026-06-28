import type { ReactElement } from 'react';
import { DocsPageHero } from '@/presentation/components/Docs/DocsPageHero';
import styles from '../../../../app/docs/docs.module.css';

export function DocsHero(): ReactElement {
  return (
    <DocsPageHero
      title="Zenformed"
      titleAccent="Docs"
      subtitle="Find guides, references, and answers across all Zenformed products."
    />
  );
}
