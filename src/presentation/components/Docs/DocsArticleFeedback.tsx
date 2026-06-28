import type { ReactElement } from 'react';
import styles from '../../../../app/docs/docs.module.css';

export function DocsArticleFeedback(): ReactElement {
  return (
    <section className={styles.docsArticleFeedback} aria-labelledby="docs-article-feedback-title">
      <h2 id="docs-article-feedback-title" className={styles.docsArticleFeedbackTitle}>
        Was this article helpful?
      </h2>
      <div className={styles.docsArticleFeedbackActions}>
        <button type="button" className={styles.docsArticleFeedbackButton} disabled>
          👍 Yes
        </button>
        <button type="button" className={styles.docsArticleFeedbackButton} disabled>
          👎 No
        </button>
      </div>
    </section>
  );
}
