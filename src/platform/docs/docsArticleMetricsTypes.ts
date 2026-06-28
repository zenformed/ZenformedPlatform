export type DocsArticleMetricsSnapshot = {
  readonly helpfulYes: number;
  readonly helpfulNo: number;
  readonly views: number;
};

export const EMPTY_DOCS_ARTICLE_METRICS: DocsArticleMetricsSnapshot = {
  helpfulYes: 0,
  helpfulNo: 0,
  views: 0,
};

export function docsArticleViewSessionStorageKey(articleId: string): string {
  return `zenformed.docs.view.${articleId}`;
}
