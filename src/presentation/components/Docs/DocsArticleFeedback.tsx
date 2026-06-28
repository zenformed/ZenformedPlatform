'use client';

import { useEffect, useState, type ReactElement } from 'react';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import styles from '../../../../app/docs/docs.module.css';

export type DocsArticleFeedbackProps = {
  readonly article: Pick<DocsArticle, 'databaseId' | 'product' | 'category' | 'slug'>;
};

type VoteState = 'idle' | 'submitting' | 'submitted';

function helpfulVoteStorageKey(article: DocsArticleFeedbackProps['article']): string {
  const identity = article.databaseId ?? `${article.product}/${article.category}/${article.slug}`;
  return `zenformed.docs.helpfulVote.${identity}`;
}

export function DocsArticleFeedback({ article }: DocsArticleFeedbackProps): ReactElement | null {
  const [voteState, setVoteState] = useState<VoteState>('idle');
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedVote = window.sessionStorage.getItem(helpfulVoteStorageKey(article));
    if (storedVote === 'yes' || storedVote === 'no') {
      setSelectedVote(storedVote);
      setVoteState('submitted');
    }
  }, [article]);

  if (article.databaseId == null) {
    return null;
  }

  const submitVote = async (vote: 'yes' | 'no'): Promise<void> => {
    if (voteState !== 'idle') {
      return;
    }

    setVoteState('submitting');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/docs/articles/helpful', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId: article.databaseId,
          vote,
        }),
      });

      const json = (await response.json()) as { message?: string };
      if (!response.ok) {
        setVoteState('idle');
        setErrorMessage(json.message ?? 'Could not record your feedback. Please try again.');
        return;
      }

      window.sessionStorage.setItem(helpfulVoteStorageKey(article), vote);
      setSelectedVote(vote);
      setVoteState('submitted');
    } catch {
      setVoteState('idle');
      setErrorMessage('Could not record your feedback. Please try again.');
    }
  };

  return (
    <section className={styles.docsArticleFeedback} aria-labelledby="docs-article-feedback-title">
      <h2 id="docs-article-feedback-title" className={styles.docsArticleFeedbackTitle}>
        Was this article helpful?
      </h2>

      {voteState === 'submitted' ? (
        <p className={styles.docsArticleFeedbackSubmitted} role="status">
          Thanks for your feedback{selectedVote === 'yes' ? '!' : '.'}
        </p>
      ) : (
        <div className={styles.docsArticleFeedbackActions}>
          <button
            type="button"
            className={styles.docsArticleFeedbackButton}
            disabled={voteState === 'submitting'}
            onClick={() => void submitVote('yes')}
          >
            👍 Yes
          </button>
          <button
            type="button"
            className={styles.docsArticleFeedbackButton}
            disabled={voteState === 'submitting'}
            onClick={() => void submitVote('no')}
          >
            👎 No
          </button>
        </div>
      )}

      {errorMessage != null ? (
        <p className={styles.docsArticleFeedbackError} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
