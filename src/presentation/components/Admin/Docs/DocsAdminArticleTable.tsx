'use client';

import type { ReactElement } from 'react';
import { formatAdminDate } from '@/platform/content/platformAdminContent';
import { platformDocsAdminContent as content } from '@/platform/content/platformDocsAdminContent';
import {
  getDocsAdminCategoryTitle,
  getDocsAdminProductName,
} from '@/platform/docs/docsAdminCatalogData';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import { docsAdminNavigation } from '@/platform/docs/docsAdminNavigation';
import adminStyles from '../admin.module.css';
import docsAdminStyles from './docsAdmin.module.css';

export type DocsAdminArticleTableProps = {
  readonly articles: readonly DocsAdminArticle[];
  readonly selectedEditorId: string | null;
  readonly onSelect: (article: DocsAdminArticle) => void;
  readonly onOpen: (article: DocsAdminArticle) => void;
};

export function DocsAdminArticleTable({
  articles,
  selectedEditorId,
  onSelect,
  onOpen,
}: DocsAdminArticleTableProps): ReactElement {
  if (articles.length === 0) {
    return <p className={adminStyles.adminEmpty}>{content.console.table.empty}</p>;
  }

  return (
    <div className={adminStyles.adminTableWrap}>
      <table className={adminStyles.adminTable}>
        <thead>
          <tr>
            <th scope="col">{content.console.table.title}</th>
            <th scope="col">{content.console.table.product}</th>
            <th scope="col">{content.console.table.category}</th>
            <th scope="col">{content.console.table.visibility}</th>
            <th scope="col">{content.console.table.lastUpdated}</th>
            <th scope="col">{content.console.table.status}</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => {
            const isSelected = article.editorId === selectedEditorId;
            return (
              <tr
                key={article.id}
                className={isSelected ? docsAdminStyles.docsAdminTableRowSelected : undefined}
                onClick={() => onSelect(article)}
              >
                <td>
                  <a
                    href={docsAdminNavigation.routes.articleEditor(article.editorId)}
                    className={docsAdminStyles.docsAdminTableLink}
                    onClick={(event) => {
                      event.preventDefault();
                      onOpen(article);
                    }}
                  >
                    {article.title}
                  </a>
                </td>
                <td>{getDocsAdminProductName(article.product)}</td>
                <td>{getDocsAdminCategoryTitle(article.product, article.category)}</td>
                <td>{content.visibilityLabels[article.visibility]}</td>
                <td>{formatAdminDate(`${article.lastUpdated}T12:00:00.000Z`)}</td>
                <td>
                  <span
                    className={`${docsAdminStyles.docsAdminStatusBadge} ${
                      article.status === 'published'
                        ? docsAdminStyles.docsAdminStatusPublished
                        : docsAdminStyles.docsAdminStatusDraft
                    }`}
                  >
                    {content.statusLabels[article.status]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
