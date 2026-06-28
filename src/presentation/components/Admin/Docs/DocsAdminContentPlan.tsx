'use client';

import { useMemo, type ReactElement } from 'react';
import { platformDocsAdminContent as content } from '@/platform/content/platformDocsAdminContent';
import {
  resolveBuildCoreDocsContentPlan,
  type DocsContentPlanItem,
  type DocsContentPlanStatus,
} from '@/platform/docs/docsContentPlan';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import adminStyles from '../admin.module.css';
import docsAdminStyles from './docsAdmin.module.css';

export type DocsAdminContentPlanProps = {
  readonly articles: readonly DocsAdminArticle[];
  readonly onCreateArticle: (seed: {
    readonly product: DocsProductSlug;
    readonly category: DocsCategorySlug;
    readonly title: string;
    readonly slug: string;
  }) => void;
  readonly onOpenArticle: (editorId: string) => void;
};

function statusBadgeClassName(status: DocsContentPlanStatus): string {
  if (status === 'published') {
    return `${docsAdminStyles.docsAdminStatusBadge} ${docsAdminStyles.docsAdminStatusPublished}`;
  }

  if (status === 'draft') {
    return `${docsAdminStyles.docsAdminStatusBadge} ${docsAdminStyles.docsAdminStatusDraft}`;
  }

  return `${docsAdminStyles.docsAdminStatusBadge} ${docsAdminStyles.docsAdminStatusNotStarted}`;
}

function statusLabel(status: DocsContentPlanStatus): string {
  return content.contentPlan.statusLabels[status];
}

function actionLabel(item: DocsContentPlanItem): string {
  return item.status === 'not_started'
    ? content.contentPlan.createArticle
    : content.contentPlan.openArticle;
}

function handleAction(
  item: DocsContentPlanItem,
  onCreateArticle: DocsAdminContentPlanProps['onCreateArticle'],
  onOpenArticle: DocsAdminContentPlanProps['onOpenArticle'],
): void {
  if (item.status !== 'not_started' && item.editorId != null) {
    onOpenArticle(item.editorId);
    return;
  }

  onCreateArticle({
    product: 'buildcore',
    category: item.categorySlug,
    title: item.title,
    slug: item.slug,
  });
}

export function DocsAdminContentPlan({
  articles,
  onCreateArticle,
  onOpenArticle,
}: DocsAdminContentPlanProps): ReactElement {
  const groups = useMemo(() => resolveBuildCoreDocsContentPlan(articles), [articles]);

  const totals = useMemo(() => {
    const items = groups.flatMap((group) => group.items);
    return {
      total: items.length,
      notStarted: items.filter((item) => item.status === 'not_started').length,
      draft: items.filter((item) => item.status === 'draft').length,
      published: items.filter((item) => item.status === 'published').length,
    };
  }, [groups]);

  return (
    <div className={docsAdminStyles.docsAdminContentPlan}>
      <div className={docsAdminStyles.docsAdminContentPlanIntro}>
        <p className={docsAdminStyles.docsAdminContentPlanDescription}>{content.contentPlan.description}</p>
        <dl className={docsAdminStyles.docsAdminContentPlanStats}>
          <div>
            <dt>{content.contentPlan.statsTotal}</dt>
            <dd>{totals.total}</dd>
          </div>
          <div>
            <dt>{content.contentPlan.statsNotStarted}</dt>
            <dd>{totals.notStarted}</dd>
          </div>
          <div>
            <dt>{content.contentPlan.statsDraft}</dt>
            <dd>{totals.draft}</dd>
          </div>
          <div>
            <dt>{content.contentPlan.statsPublished}</dt>
            <dd>{totals.published}</dd>
          </div>
        </dl>
      </div>

      {groups.map((group) => (
        <section
          key={group.id}
          className={docsAdminStyles.docsAdminContentPlanGroup}
          aria-labelledby={`docs-content-plan-${group.id}`}
        >
          <h3 id={`docs-content-plan-${group.id}`} className={docsAdminStyles.docsAdminContentPlanGroupTitle}>
            {group.title}
          </h3>

          <div className={adminStyles.adminTableWrap}>
            <table className={adminStyles.adminTable}>
              <thead>
                <tr>
                  <th scope="col">{content.contentPlan.table.title}</th>
                  <th scope="col">{content.contentPlan.table.category}</th>
                  <th scope="col">{content.contentPlan.table.summary}</th>
                  <th scope="col">{content.contentPlan.table.status}</th>
                  <th scope="col">{content.contentPlan.table.action}</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={`${item.categorySlug}--${item.slug}`}>
                    <td className={docsAdminStyles.docsAdminContentPlanTitleCell}>{item.title}</td>
                    <td>{item.categoryLabel}</td>
                    <td className={docsAdminStyles.docsAdminContentPlanSummaryCell}>{item.summary}</td>
                    <td>
                      <span className={statusBadgeClassName(item.status)}>{statusLabel(item.status)}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={docsAdminStyles.docsAdminPrimaryButton}
                        onClick={() => handleAction(item, onCreateArticle, onOpenArticle)}
                      >
                        {actionLabel(item)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
