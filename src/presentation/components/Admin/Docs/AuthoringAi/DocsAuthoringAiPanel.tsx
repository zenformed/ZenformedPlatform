'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactElement } from 'react';
import { platformDocsAuthoringAiContent as content } from '@/platform/content/platformDocsAuthoringAiContent';
import type { UseDocsAuthoringAiResult } from '@/presentation/hooks/useDocsAuthoringAi';
import styles from './docsAuthoringAi.module.css';

export type DocsAuthoringAiPanelProps = {
  readonly ai: UseDocsAuthoringAiResult;
  readonly authorContext: string;
  readonly onAuthorContextChange: (value: string) => void;
  readonly disabled?: boolean;
};

export function DocsAuthoringAiPanel({
  ai,
  authorContext,
  onAuthorContextChange,
  disabled = false,
}: DocsAuthoringAiPanelProps): ReactElement {
  const [chatInput, setChatInput] = useState('');
  const historyEndRef = useRef<HTMLDivElement>(null);
  const isBusy = disabled || ai.isRunning;
  const hasSelection = ai.selection != null;

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [ai.conversation, ai.isRunning]);

  const handleSend = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const message = chatInput.trim();
    if (message === '' || isBusy) {
      return;
    }

    setChatInput('');
    void ai.sendMessage(message);
  };

  return (
    <aside className={styles.docsAuthoringAiPanel} aria-label={content.panelTitle}>
      <div className={styles.docsAuthoringAiPanelHeader}>
        <h2 className={styles.docsAuthoringAiPanelTitle}>{content.panelTitle}</h2>
        <p className={styles.docsAuthoringAiPanelSubtitle}>{content.panelSubtitle}</p>
      </div>

      <div className={styles.docsAuthoringAiPanelBody}>
        <div className={styles.docsAuthoringAiPanelTop}>
          <section className={styles.docsAuthoringAiSection} aria-label={content.writingSection}>
            <h3 className={styles.docsAuthoringAiSectionTitle}>{content.writingSection}</h3>
            <div className={styles.docsAuthoringAiActionGrid}>
              <button
                type="button"
                className={`${styles.docsAuthoringAiActionButton} ${
                  ai.isGeneratingDraft ? styles.docsAuthoringAiActionButtonActive : ''
                }`}
                disabled={isBusy}
                onClick={() => void ai.runGenerateDraft()}
              >
                {content.generateDraft}
              </button>
            </div>

            <div className={styles.docsAuthoringAiAuthorContext}>
              <label className={styles.docsAuthoringAiContextLabel} htmlFor="docs-authoring-ai-author-context">
                {content.authorContext.label}
              </label>
              <p className={styles.docsAuthoringAiHint}>{content.authorContext.helper}</p>
              <textarea
                id="docs-authoring-ai-author-context"
                className={styles.docsAuthoringAiAuthorContextTextarea}
                value={authorContext}
                rows={5}
                placeholder={content.authorContext.placeholder}
                disabled={disabled}
                onChange={(event) => onAuthorContextChange(event.target.value)}
              />
            </div>
          </section>

          <div className={styles.docsAuthoringAiDivider} role="separator" />

          <section className={styles.docsAuthoringAiConversationSection} aria-label={content.conversationSection}>
            <h3 className={styles.docsAuthoringAiSectionTitle}>{content.conversationSection}</h3>
            <div className={styles.docsAuthoringAiConversationHistory}>
              {ai.conversation.length === 0 ? (
                <p className={styles.docsAuthoringAiHint}>{content.conversationEmpty}</p>
              ) : (
                ai.conversation.map((message, index) => (
                  <article
                    key={`${message.role}-${index}`}
                    className={`${styles.docsAuthoringAiConversationMessage} ${
                      message.role === 'user'
                        ? styles.docsAuthoringAiConversationMessageUser
                        : styles.docsAuthoringAiConversationMessageAssistant
                    }`}
                  >
                    <h4 className={styles.docsAuthoringAiConversationRole}>
                      {message.role === 'user' ? content.roles.user : content.roles.assistant}
                    </h4>
                    <p className={styles.docsAuthoringAiConversationText}>{message.content}</p>
                  </article>
                ))
              )}
              <div ref={historyEndRef} />
            </div>
          </section>
        </div>

        <div className={styles.docsAuthoringAiPanelFooter}>
          {ai.statusMessage != null ? (
            <p
              className={`${styles.docsAuthoringAiStatus} ${
                ai.statusKind === 'error'
                  ? styles.docsAuthoringAiStatusError
                  : ai.statusKind === 'success'
                    ? styles.docsAuthoringAiStatusSuccess
                    : ''
              }`}
              role="status"
              aria-live="polite"
            >
              {ai.statusMessage}
            </p>
          ) : null}

          <form className={styles.docsAuthoringAiChatCompose} onSubmit={handleSend}>
            <label className={styles.docsAuthoringAiContextLabel} htmlFor="docs-authoring-ai-chat-input">
              {content.chatInputLabel}
            </label>
            {hasSelection ? (
              <>
                <p className={styles.docsAuthoringAiHint}>{content.conversationSelectionHint}</p>
                <p className={styles.docsAuthoringAiSelectionPreview}>{ai.selection?.selectedText}</p>
              </>
            ) : null}
            <textarea
              id="docs-authoring-ai-chat-input"
              className={styles.docsAuthoringAiChatInput}
              value={chatInput}
              rows={3}
              placeholder={content.chatInputPlaceholder}
              disabled={isBusy || disabled}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button
              type="submit"
              className={styles.docsAuthoringAiChatSendButton}
              disabled={isBusy || disabled || chatInput.trim() === ''}
            >
              {ai.isRunning && !ai.isGeneratingDraft ? content.chatThinking : content.chatSend}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
