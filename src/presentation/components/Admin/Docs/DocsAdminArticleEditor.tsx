'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { platformDocsAdminContent as content } from '@/platform/content/platformDocsAdminContent';
import {
  getDocsAdminCategoryOptions,
  getDocsAdminCategoryTitle,
  getDocsAdminProductName,
} from '@/platform/docs/docsAdminCatalogData';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import { consumePendingDocsAuthorContext } from '@/platform/docs/docsAuthorContextStorage';
import type { DocsArticleVisibility } from '@/platform/docs/docsArticleTypes';
import { shouldShowDocsDiscardDraftButton } from '@/platform/docs/docsDiscardDraft';
import { createDocsAuthoringAiClient } from '@/platform/docs/docsAuthoringAiClient';
import { DocsAuthoringAiPanel } from '@/presentation/components/Admin/Docs/AuthoringAi/DocsAuthoringAiPanel';
import {
  DocsRichTextEditor,
  type DocsRichTextEditorHandle,
} from '@/presentation/components/Admin/Docs/RichText/DocsRichTextEditor';
import { useDocsAuthoringAi } from '@/presentation/hooks/useDocsAuthoringAi';
import { useDocsAdminNavigation } from '@/presentation/hooks/useDocsAdminNavigation';
import { useAdminAccessToken } from '@/presentation/components/Admin/PlatformAdminGate';
import adminStyles from '../admin.module.css';
import docsAdminStyles from './docsAdmin.module.css';
import authoringAiStyles from './AuthoringAi/docsAuthoringAi.module.css';

export type DocsAdminArticleEditorProps = {
  readonly article: DocsAdminArticle;
};

type EditorDraft = {
  readonly title: string;
  readonly summary: string;
  readonly visibility: DocsArticleVisibility;
  readonly category: DocsAdminArticle['category'];
  readonly tags: readonly string[];
  readonly estimatedReadTime: string;
  readonly author: string;
  readonly authorContext: string;
  readonly content: string;
  readonly published: boolean;
};

function buildDraft(article: DocsAdminArticle, pendingAuthorContext?: string): EditorDraft {
  const authorContext = pendingAuthorContext ?? article.authorContext;

  return {
    title: article.title,
    summary: article.summary,
    visibility: article.visibility,
    category: article.category,
    tags: [...article.tags],
    estimatedReadTime: article.estimatedReadTime,
    author: article.author,
    authorContext,
    content: article.content,
    published: article.status === 'published',
  };
}

function draftsEqual(left: EditorDraft, right: EditorDraft): boolean {
  return (
    left.title === right.title &&
    left.summary === right.summary &&
    left.visibility === right.visibility &&
    left.category === right.category &&
    left.estimatedReadTime === right.estimatedReadTime &&
    left.author === right.author &&
    left.authorContext === right.authorContext &&
    left.content === right.content &&
    left.published === right.published &&
    left.tags.join(',') === right.tags.join(',')
  );
}

function parseTagsInput(value: string): readonly string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '');
}

export function DocsAdminArticleEditor({ article }: DocsAdminArticleEditorProps): ReactElement {
  const docsAdminNav = useDocsAdminNavigation();
  const getAccessToken = useAdminAccessToken();
  const editorRef = useRef<DocsRichTextEditorHandle>(null);
  const isEditable = article.source === 'markdown';
  const showDiscardDraftButton = shouldShowDocsDiscardDraftButton(article);
  const [savedDraft, setSavedDraft] = useState<EditorDraft>(() => buildDraft(article));
  const [draft, setDraft] = useState<EditorDraft>(() => buildDraft(article));
  const [tagsInput, setTagsInput] = useState(article.tags.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [discardError, setDiscardError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const pendingAuthorContext = consumePendingDocsAuthorContext(article.articleKey);
    const nextDraft = buildDraft(article, pendingAuthorContext);
    setSavedDraft(nextDraft);
    setDraft(nextDraft);
    setTagsInput(article.tags.join(', '));
    setSaveMessage(null);
    setSaveError(null);
  }, [article.articleKey, article.lastUpdated]);

  const isDirty = useMemo(() => {
    const draftWithTags = { ...draft, tags: parseTagsInput(tagsInput) };
    const savedWithTags = { ...savedDraft, tags: savedDraft.tags };
    return !draftsEqual(draftWithTags, savedWithTags);
  }, [draft, savedDraft, tagsInput]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const categoryOptions = getDocsAdminCategoryOptions(article.product);
  const parsedTags = useMemo(() => parseTagsInput(tagsInput), [tagsInput]);

  const handleContentChange = useCallback((nextContent: string) => {
    setDraft((current) => ({ ...current, content: nextContent }));
  }, []);

  const editorCommands = useMemo(
    () => ({
      setMarkdown: (markdown: string) => {
        editorRef.current?.setMarkdown(markdown);
      },
      replaceSelection: (text: string) => {
        editorRef.current?.replaceSelection(text);
      },
    }),
    [],
  );

  const authoringAiClient = useMemo(
    () => createDocsAuthoringAiClient(getAccessToken),
    [getAccessToken],
  );

  const authoringAi = useDocsAuthoringAi({
    title: draft.title,
    summary: draft.summary,
    product: article.product,
    productName: getDocsAdminProductName(article.product),
    category: article.category,
    categoryTitle: getDocsAdminCategoryTitle(article.product, article.category),
    tags: parsedTags,
    authorContext: draft.authorContext,
    contentMarkdown: draft.content,
    enabled: isEditable,
    onMarkdownChange: handleContentChange,
    onTitleChange: (title) => setDraft((current) => ({ ...current, title })),
    onSummaryChange: (summary) => setDraft((current) => ({ ...current, summary })),
    onTagsChange: (tags) => setTagsInput(tags.join(', ')),
    onAuthorContextChange: (value) => setDraft((current) => ({ ...current, authorContext: value })),
    editorCommands,
    client: authoringAiClient,
  });

  const persistDraft = useCallback(
    async (nextDraft: EditorDraft): Promise<boolean> => {
      const token = getAccessToken();
      if (token == null) {
        setSaveError(content.editor.saveError);
        return false;
      }

      setIsSaving(true);
      setSaveError(null);
      setSaveMessage(null);

      try {
        const response = await fetch(`/api/admin/docs/articles/${article.articleKey}`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: nextDraft.title,
            slug: article.slug,
            product: article.product,
            category: article.category,
            summary: nextDraft.summary,
            visibility: nextDraft.visibility,
            tags: nextDraft.tags,
            estimatedReadTime: nextDraft.estimatedReadTime,
            author: nextDraft.author,
            authorContext: nextDraft.authorContext,
            published: nextDraft.published,
            content: nextDraft.content,
          }),
        });

        if (!response.ok) {
          setSaveError(content.editor.saveError);
          return false;
        }

        setSavedDraft(nextDraft);
        setSaveMessage(content.editor.saved);
        return true;
      } catch {
        setSaveError(content.editor.saveError);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [article.articleKey, article.category, article.product, article.slug, getAccessToken],
  );

  const handleSave = async (): Promise<void> => {
    if (!isEditable || isSaving) {
      return;
    }

    const nextDraft = { ...draft, tags: parseTagsInput(tagsInput) };
    setDraft(nextDraft);
    await persistDraft(nextDraft);
  };

  const handlePublish = async (): Promise<void> => {
    if (!isEditable || isSaving) {
      return;
    }

    const nextDraft = { ...draft, tags: parseTagsInput(tagsInput), published: true };
    setDraft(nextDraft);
    await persistDraft(nextDraft);
  };

  const handleDiscardDraft = async (): Promise<void> => {
    if (!showDiscardDraftButton || isDiscarding || isSaving) {
      return;
    }

    setIsDiscarding(true);
    setDiscardError(null);

    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/admin/docs/articles/${article.articleKey}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setDiscardError(content.editor.discardDraftError);
        return;
      }

      setShowDiscardDialog(false);
      docsAdminNav.openConsole();
    } catch {
      setDiscardError(content.editor.discardDraftError);
    } finally {
      setIsDiscarding(false);
    }
  };

  const handleBack = (): void => {
    if (isDirty && !window.confirm(content.editor.leaveConfirm)) {
      return;
    }

    docsAdminNav.openConsole();
  };

  return (
    <div className={docsAdminStyles.docsAdminEditorPage}>
      <div className={docsAdminStyles.docsAdminEditorHeader}>
        <div className={docsAdminStyles.docsAdminEditorHeaderStart}>
          <button
            type="button"
            className={`${adminStyles.adminBackLink} ${docsAdminStyles.docsAdminEditorBackButton}`}
            onClick={handleBack}
          >
            {content.editor.backToConsole}
          </button>
        </div>
        <div className={docsAdminStyles.docsAdminEditorActions}>
          {isDirty ? (
            <span className={docsAdminStyles.docsAdminUnsavedBadge}>
              <svg
                className={docsAdminStyles.docsAdminUnsavedBadgeIcon}
                viewBox="0 0 16 16"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M8.485 1.414a1 1 0 0 0-1.414 0L.879 7.606A1 1 0 0 0 1.586 9H14.41a1 1 0 0 0 .707-1.707L8.485 1.414zM7.25 5.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 6.25a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
                />
              </svg>
              {content.editor.unsavedChanges}
            </span>
          ) : saveMessage != null ? (
            <span className={docsAdminStyles.docsAdminSavedBadge}>{saveMessage}</span>
          ) : null}
          {showDiscardDraftButton ? (
            <button
              type="button"
              className={adminStyles.adminButton}
              disabled={isSaving || isDiscarding}
              onClick={() => {
                setDiscardError(null);
                setShowDiscardDialog(true);
              }}
            >
              {isDiscarding ? content.editor.discarding : content.editor.discardDraft}
            </button>
          ) : null}
          <button
            type="button"
            className={adminStyles.adminButton}
            disabled={!isEditable || isSaving || !isDirty}
            onClick={() => void handleSave()}
          >
            {isSaving ? content.editor.saving : content.editor.save}
          </button>
          <button
            type="button"
            className={docsAdminStyles.docsAdminPrimaryButton}
            disabled={!isEditable || isSaving}
            onClick={() => void handlePublish()}
          >
            {isSaving ? content.editor.publishing : content.editor.publish}
          </button>
        </div>
      </div>

      {showDiscardDialog ? (
        <div
          className={docsAdminStyles.docsAdminModalOverlay}
          role="presentation"
          onClick={() => {
            if (!isDiscarding) {
              setShowDiscardDialog(false);
            }
          }}
        >
          <div
            className={docsAdminStyles.docsAdminModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="docs-admin-discard-draft-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="docs-admin-discard-draft-title" className={docsAdminStyles.docsAdminModalTitle}>
              {content.editor.discardDraftTitle}
            </h3>
            <p className={docsAdminStyles.docsAdminModalBody}>{content.editor.discardDraftBody}</p>
            {discardError != null ? (
              <p className={docsAdminStyles.docsAdminErrorText} role="alert">
                {discardError}
              </p>
            ) : null}
            <div className={docsAdminStyles.docsAdminModalActions}>
              <button
                type="button"
                className={adminStyles.adminButton}
                disabled={isDiscarding}
                onClick={() => setShowDiscardDialog(false)}
              >
                {content.editor.discardDraftCancel}
              </button>
              <button
                type="button"
                className={docsAdminStyles.docsAdminPrimaryButton}
                disabled={isDiscarding}
                onClick={() => void handleDiscardDraft()}
              >
                {isDiscarding ? content.editor.discarding : content.editor.discardDraftConfirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={authoringAiStyles.docsAuthoringAiWorkspace}>
        <div className={authoringAiStyles.docsAuthoringAiMainScroll}>
          <div className={authoringAiStyles.docsAuthoringAiMainContent}>
          {!isEditable ? (
            <p className={docsAdminStyles.docsAdminNotice}>{content.editor.placeholderNotice}</p>
          ) : null}

          {saveError != null ? (
            <p className={docsAdminStyles.docsAdminErrorText} role="alert">
              {saveError}
            </p>
          ) : null}

          <div className={docsAdminStyles.docsAdminFieldGrid}>
            <div className={docsAdminStyles.docsAdminField}>
              <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-title">
                {content.editor.titleLabel}
              </label>
              <input
                id="docs-admin-title"
                className={docsAdminStyles.docsAdminInput}
                value={draft.title}
                readOnly={!isEditable}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </div>
            <div className={docsAdminStyles.docsAdminField}>
              <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-summary">
                {content.editor.summaryLabel}
              </label>
              <textarea
                id="docs-admin-summary"
                className={docsAdminStyles.docsAdminTextarea}
                value={draft.summary}
                readOnly={!isEditable}
                onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
              />
            </div>
          </div>

          <section className={docsAdminStyles.docsAdminPanel} aria-label="Article metadata">
            <div className={docsAdminStyles.docsAdminPanelHeader}>{content.editor.metadataTitle}</div>
            <div className={docsAdminStyles.docsAdminPanelBody}>
              <div className={docsAdminStyles.docsAdminMetadataGrid}>
                <div className={docsAdminStyles.docsAdminField}>
                  <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-visibility">
                    {content.editor.visibilityLabel}
                  </label>
                  <select
                    id="docs-admin-visibility"
                    className={docsAdminStyles.docsAdminSelect}
                    value={draft.visibility}
                    disabled={!isEditable}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        visibility: event.target.value as DocsArticleVisibility,
                      }))
                    }
                  >
                    {Object.entries(content.visibilityLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={docsAdminStyles.docsAdminField}>
                  <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-category">
                    {content.editor.categoryLabel}
                  </label>
                  <select
                    id="docs-admin-category"
                    className={docsAdminStyles.docsAdminSelect}
                    value={draft.category}
                    disabled
                  >
                    {categoryOptions.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={docsAdminStyles.docsAdminField}>
                  <span className={docsAdminStyles.docsAdminFieldLabel}>{content.editor.publishedLabel}</span>
                  <label className={docsAdminStyles.docsAdminCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={draft.published}
                      disabled={!isEditable}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, published: event.target.checked }))
                      }
                    />
                    {draft.published ? content.statusLabels.published : content.statusLabels.draft}
                  </label>
                </div>
                <div className={docsAdminStyles.docsAdminField}>
                  <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-slug">
                    {content.editor.slugLabel}
                  </label>
                  <input
                    id="docs-admin-slug"
                    className={docsAdminStyles.docsAdminInput}
                    value={article.slug}
                    readOnly
                  />
                </div>
                <div className={docsAdminStyles.docsAdminField}>
                  <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-read-time">
                    {content.editor.readTimeLabel}
                  </label>
                  <input
                    id="docs-admin-read-time"
                    className={docsAdminStyles.docsAdminInput}
                    value={draft.estimatedReadTime}
                    readOnly={!isEditable}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, estimatedReadTime: event.target.value }))
                    }
                  />
                </div>
                <div className={docsAdminStyles.docsAdminField}>
                  <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-author">
                    {content.editor.authorLabel}
                  </label>
                  <input
                    id="docs-admin-author"
                    className={docsAdminStyles.docsAdminInput}
                    value={draft.author}
                    readOnly={!isEditable}
                    onChange={(event) => setDraft((current) => ({ ...current, author: event.target.value }))}
                  />
                </div>
                <div className={docsAdminStyles.docsAdminField}>
                  <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-last-updated">
                    {content.editor.lastUpdatedLabel}
                  </label>
                  <input
                    id="docs-admin-last-updated"
                    className={docsAdminStyles.docsAdminInput}
                    value={article.lastUpdated}
                    readOnly
                  />
                </div>
                {article.contentPath != null ? (
                  <div className={docsAdminStyles.docsAdminField}>
                    <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-content-path">
                      {content.editor.contentPathLabel}
                    </label>
                    <input
                      id="docs-admin-content-path"
                      className={docsAdminStyles.docsAdminInput}
                      value={article.contentPath}
                      readOnly
                    />
                  </div>
                ) : null}
                <div className={docsAdminStyles.docsAdminField}>
                  <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-tags">
                    {content.editor.tagsLabel}
                  </label>
                  <input
                    id="docs-admin-tags"
                    className={docsAdminStyles.docsAdminInput}
                    value={tagsInput}
                    placeholder={content.editor.tagsPlaceholder}
                    readOnly={!isEditable}
                    onChange={(event) => setTagsInput(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <DocsRichTextEditor
            ref={editorRef}
            markdown={draft.content}
            editable={isEditable}
            product={article.product}
            articleSlug={article.slug}
            getAccessToken={getAccessToken}
            onChange={handleContentChange}
            onSelectionChange={authoringAi.setSelection}
          />
          </div>
        </div>

        {isEditable ? (
          <DocsAuthoringAiPanel
            ai={authoringAi}
            authorContext={draft.authorContext}
            onAuthorContextChange={(value) => setDraft((current) => ({ ...current, authorContext: value }))}
          />
        ) : null}
      </div>
    </div>
  );
}
