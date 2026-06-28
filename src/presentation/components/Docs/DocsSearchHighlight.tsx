import type { ReactElement } from 'react';
import { splitDocsSearchHighlight } from '@/platform/docs/docsPublicArticleSearch';
import styles from '../../../../app/docs/docs.module.css';

export type DocsSearchHighlightProps = {
  readonly text: string;
  readonly query: string;
};

export function DocsSearchHighlight({ text, query }: DocsSearchHighlightProps): ReactElement {
  const parts = splitDocsSearchHighlight(text, query);

  return (
    <>
      {parts.map((part, index) =>
        part.highlighted ? (
          <mark key={index} className={styles.docsSearchHighlight}>
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}
