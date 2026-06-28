'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, type ReactElement } from 'react';
import { platformDocsAdminContent as content } from '@/platform/content/platformDocsAdminContent';
import {
  getDocsAdminCategoryTitle,
  getDocsAdminProductName,
} from '@/platform/docs/docsAdminCatalogData';
import type { ResolvedDocsAdminArticlePreview } from '@/platform/docs/docsArticlePreview';
import type { DocsArticlePublishValidationErrorCode } from '@/platform/docs/docsArticlePublishValidation';
import { DocsArticleView } from '@/presentation/components/Docs/DocsArticleView';
import { useDocsAdminNavigation } from '@/presentation/hooks/useDocsAdminNavigation';
import { useAdminAccessToken } from '@/presentation/components/Admin/PlatformAdminGate';
import adminStyles from '../admin.module.css';
import docsAdminStyles from './docsAdmin.module.css';

export type DocsAdminArticlePreviewPageProps = {
  readonly preview: ResolvedDocsAdminArticlePreview;
};

function resolvePublishErrorMessage(errorCode: string): string {
  const validationErrors = content.articlePreview.validationErrors;
  if (errorCode in validationErrors) {
    return validationErrors[errorCode as DocsArticlePublishValidationErrorCode];
  }

  return content.articlePreview.publishError;
}

export function DocsAdminArticlePreviewPage({
  preview,
}: DocsAdminArticlePreviewPageProps): ReactElement {
  const router = useRouter();
  const docsAdminNav = useDocsAdminNavigation();
  const getAccessToken = useAdminAccessToken();
  const { adminArticle, article, product, category } = preview;
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [isPublished, setIsPublished] = useState(adminArticle.status === 'published');

  const handlePublish = useCallback(async (): Promise<void> => {
    if (isPublishing || isPublished) {
      return;
    }

    const token = getAccessToken();
    if (token == null) {
      setPublishError(content.articlePreview.publishError);
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(false);

    try {
      const response = await fetch(`/api/admin/docs/articles/${adminArticle.articleKey}/publish`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorCode = 'publish_failed';
        try {
          const payload = (await response.json()) as { error?: string };
          if (typeof payload.error === 'string') {
            errorCode = payload.error;
          }
        } catch {
          // ignore parse errors
        }
        setPublishError(resolvePublishErrorMessage(errorCode));
        return;
      }

      setIsPublished(true);
      setPublishSuccess(true);
      router.refresh();
    } catch {
      setPublishError(content.articlePreview.publishError);
    } finally {
      setIsPublishing(false);
    }
  }, [adminArticle.articleKey, getAccessToken, isPublished, isPublishing, router]);

  return (
    <div className={docsAdminStyles.docsAdminPreviewPage}>
      <div className={docsAdminStyles.docsAdminEditorHeader}>
        <div className={docsAdminStyles.docsAdminEditorHeaderStart}>
          <button
            type="button"
            className={`${adminStyles.adminBackLink} ${docsAdminStyles.docsAdminEditorBackButton}`}
            onClick={() => docsAdminNav.openArticle(adminArticle.editorId)}
          >
            {content.articlePreview.backToEditor}
          </button>
        </div>
        <div className={docsAdminStyles.docsAdminEditorActions}>
          {publishSuccess ? (
            <span className={docsAdminStyles.docsAdminSavedBadge}>{content.articlePreview.publishSuccess}</span>
          ) : null}
          {isPublished ? (
            <span className={docsAdminStyles.docsAdminPublishedBadge}>{content.articlePreview.publishedStatus}</span>
          ) : (
            <button
              type="button"
              className={docsAdminStyles.docsAdminPrimaryButton}
              disabled={isPublishing}
              onClick={() => void handlePublish()}
            >
              {isPublishing ? content.articlePreview.publishing : content.articlePreview.publish}
            </button>
          )}
        </div>
      </div>

      {publishError != null ? (
        <p className={docsAdminStyles.docsAdminErrorText} role="alert">
          {publishError}
        </p>
      ) : null}

      <section className={docsAdminStyles.docsAdminPanel} aria-label={content.articlePreview.metadataTitle}>
        <div className={docsAdminStyles.docsAdminPanelHeader}>{content.articlePreview.metadataTitle}</div>
        <div className={docsAdminStyles.docsAdminPanelBody}>
          <dl className={`${docsAdminStyles.docsAdminPreviewMeta} ${docsAdminStyles.docsAdminArticlePreviewMeta}`}>
            <div>
              <dt>{content.articlePreview.titleLabel}</dt>
              <dd>{adminArticle.title}</dd>
            </div>
            <div>
              <dt>{content.articlePreview.productLabel}</dt>
              <dd>{getDocsAdminProductName(adminArticle.product)}</dd>
            </div>
            <div>
              <dt>{content.articlePreview.categoryLabel}</dt>
              <dd>{getDocsAdminCategoryTitle(adminArticle.product, adminArticle.category)}</dd>
            </div>
            <div>
              <dt>{content.articlePreview.visibilityLabel}</dt>
              <dd>{content.visibilityLabels[adminArticle.visibility]}</dd>
            </div>
            <div>
              <dt>{content.articlePreview.statusLabel}</dt>
              <dd>
                {isPublished ? content.statusLabels.published : content.statusLabels.draft}
              </dd>
            </div>
            <div>
              <dt>{content.articlePreview.lastUpdatedLabel}</dt>
              <dd>{adminArticle.lastUpdated}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={docsAdminStyles.docsAdminPublicPreview} aria-label={content.articlePreview.title}>
        <DocsArticleView
          article={article}
          product={product}
          category={category}
          articleClassName={docsAdminStyles.docsAdminPreviewArticleView}
        />
      </section>
    </div>
  );
}
