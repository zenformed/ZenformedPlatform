import type { ReactElement } from 'react';
import { formatAdminDate } from '@/platform/content/platformAdminContent';
import { platformDocsAdminContent as content } from '@/platform/content/platformDocsAdminContent';
import {
  getDocsAdminCategoryTitle,
  getDocsAdminProductName,
} from '@/platform/docs/docsAdminCatalogData';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import docsAdminStyles from './docsAdmin.module.css';

export type DocsAdminArticlePreviewProps = {
  readonly article: DocsAdminArticle | null;
};

export function DocsAdminArticlePreview({ article }: DocsAdminArticlePreviewProps): ReactElement {
  return (
    <aside className={docsAdminStyles.docsAdminPanel} aria-label="Article metadata preview">
      <div className={docsAdminStyles.docsAdminPanelHeader}>{content.console.preview.title}</div>
      <div className={docsAdminStyles.docsAdminPanelBody}>
        {article == null ? (
          <p className={docsAdminStyles.docsAdminPreviewEmpty}>{content.console.preview.empty}</p>
        ) : (
          <dl className={docsAdminStyles.docsAdminPreviewMeta}>
            <div>
              <dt>{content.editor.titleLabel}</dt>
              <dd>{article.title}</dd>
            </div>
            <div>
              <dt>{content.editor.summaryLabel}</dt>
              <dd>{article.summary}</dd>
            </div>
            <div>
              <dt>{content.console.table.product}</dt>
              <dd>{getDocsAdminProductName(article.product)}</dd>
            </div>
            <div>
              <dt>{content.console.table.category}</dt>
              <dd>{getDocsAdminCategoryTitle(article.product, article.category)}</dd>
            </div>
            <div>
              <dt>{content.console.table.visibility}</dt>
              <dd>{content.visibilityLabels[article.visibility]}</dd>
            </div>
            <div>
              <dt>{content.console.table.status}</dt>
              <dd>{content.statusLabels[article.status]}</dd>
            </div>
            <div>
              <dt>{content.console.table.lastUpdated}</dt>
              <dd>{formatAdminDate(`${article.lastUpdated}T12:00:00.000Z`)}</dd>
            </div>
            <div>
              <dt>{content.editor.readTimeLabel}</dt>
              <dd>{article.estimatedReadTime}</dd>
            </div>
            <div>
              <dt>{content.editor.authorLabel}</dt>
              <dd>{article.author}</dd>
            </div>
            <div>
              <dt>{content.editor.tagsLabel}</dt>
              <dd>
                <div className={docsAdminStyles.docsAdminTagList}>
                  {article.tags.map((tag) => (
                    <span key={tag} className={docsAdminStyles.docsAdminTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
          </dl>
        )}
      </div>
    </aside>
  );
}
