import type { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '../../../../app/docs/docs.module.css';

export type DocsMarkdownContentProps = {
  readonly content: string;
};

export function DocsMarkdownContent({ content }: DocsMarkdownContentProps): ReactElement {
  return (
    <div className={styles.docsMarkdown}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
