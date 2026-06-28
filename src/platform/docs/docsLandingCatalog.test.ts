import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsArticleMetricsSnapshot } from '@/platform/docs/docsArticleMetricsTypes';
import {
  buildPopularDocsLandingArticles,
  buildRecentDocsLandingUpdates,
  compareDocsArticlesByPopularity,
  formatDocsLandingUpdateDate,
  sortDocsArticlesByLastUpdatedDesc,
  sortDocsArticlesByPopularity,
} from '@/platform/docs/docsLandingCatalog';

const SAMPLE_ARTICLES: readonly DocsArticle[] = [
  {
    id: 'buildcore-documents-upload',
    databaseId: '11111111-1111-1111-1111-111111111111',
    slug: 'upload-documents',
    title: 'Upload Documents',
    summary: 'How to upload documents.',
    product: 'buildcore',
    category: 'documents',
    visibility: 'public',
    tags: [],
    estimatedReadTime: '5 min read',
    lastUpdated: '2026-06-20',
    author: 'Zenformed',
    relatedArticles: [],
    content: 'Body',
  },
  {
    id: 'buildcore-budget-create',
    databaseId: '22222222-2222-2222-2222-222222222222',
    slug: 'creating-budget-entries',
    title: 'Creating Budget Entries',
    summary: 'Budget basics.',
    product: 'buildcore',
    category: 'budget',
    visibility: 'public',
    tags: [],
    estimatedReadTime: '4 min read',
    lastUpdated: '2026-06-27',
    author: 'Zenformed',
    relatedArticles: [],
    content: 'Body',
  },
  {
    id: 'buildcore-workflow-tasks',
    databaseId: '33333333-3333-3333-3333-333333333333',
    slug: 'creating-workflow-tasks',
    title: 'Creating Workflow Tasks',
    summary: 'Workflow basics.',
    product: 'buildcore',
    category: 'workflow',
    visibility: 'public',
    tags: [],
    estimatedReadTime: '4 min read',
    lastUpdated: '2026-06-28',
    author: 'Zenformed',
    relatedArticles: [],
    content: 'Body',
  },
];

function metricsMap(entries: Record<string, DocsArticleMetricsSnapshot>): Map<string, DocsArticleMetricsSnapshot> {
  return new Map(Object.entries(entries));
}

describe('docsLandingCatalog', () => {
  it('sorts published articles by lastUpdated descending for recent updates', () => {
    const sorted = sortDocsArticlesByLastUpdatedDesc(SAMPLE_ARTICLES);
    assert.equal(sorted[0]?.slug, 'creating-workflow-tasks');
    assert.equal(sorted[1]?.slug, 'creating-budget-entries');
  });

  it('ranks popular articles by helpful_yes first', () => {
    const sorted = sortDocsArticlesByPopularity(
      SAMPLE_ARTICLES,
      metricsMap({
        '11111111-1111-1111-1111-111111111111': { helpfulYes: 0, helpfulNo: 0, views: 100 },
        '22222222-2222-2222-2222-222222222222': { helpfulYes: 2, helpfulNo: 1, views: 0 },
        '33333333-3333-3333-3333-333333333333': { helpfulYes: 1, helpfulNo: 0, views: 50 },
      }),
    );

    assert.equal(sorted[0]?.slug, 'creating-budget-entries');
    assert.equal(sorted[1]?.slug, 'creating-workflow-tasks');
  });

  it('uses views as a tie-breaker when helpful_yes matches', () => {
    const left = SAMPLE_ARTICLES[0]!;
    const right = SAMPLE_ARTICLES[1]!;
    const metrics = metricsMap({
      '11111111-1111-1111-1111-111111111111': { helpfulYes: 1, helpfulNo: 0, views: 10 },
      '22222222-2222-2222-2222-222222222222': { helpfulYes: 1, helpfulNo: 0, views: 25 },
    });

    assert.ok(compareDocsArticlesByPopularity(left, right, metrics) > 0);
  });

  it('falls back to updated_at when metrics are zero or missing', () => {
    const sorted = sortDocsArticlesByPopularity(
      SAMPLE_ARTICLES,
      metricsMap({
        '11111111-1111-1111-1111-111111111111': { helpfulYes: 0, helpfulNo: 0, views: 0 },
        '22222222-2222-2222-2222-222222222222': { helpfulYes: 0, helpfulNo: 0, views: 0 },
      }),
    );

    assert.equal(sorted[0]?.slug, 'creating-workflow-tasks');
    assert.equal(sorted[2]?.slug, 'upload-documents');
  });

  it('includes articles without metrics rows using zero defaults', () => {
    const popular = buildPopularDocsLandingArticles(SAMPLE_ARTICLES, {
      limit: 3,
      metricsByArticleId: metricsMap({
        '22222222-2222-2222-2222-222222222222': { helpfulYes: 1, helpfulNo: 2, views: 0 },
      }),
    });

    assert.equal(popular.length, 3);
    assert.equal(popular[0]?.title, 'Creating Budget Entries');
    assert.equal(popular[0]?.helpfulYes, 1);
    assert.equal(popular[0]?.helpfulNo, 2);
    assert.ok(popular.some((article) => article.title === 'Upload Documents'));
  });

  it('returns all ranked articles when no limit is provided', () => {
    const popular = buildPopularDocsLandingArticles(SAMPLE_ARTICLES, {
      metricsByArticleId: metricsMap({
        '22222222-2222-2222-2222-222222222222': { helpfulYes: 1, helpfulNo: 2, views: 0 },
      }),
    });

    assert.equal(popular.length, SAMPLE_ARTICLES.length);
  });

  it('builds recent updates with product labels and dates', () => {
    const recent = buildRecentDocsLandingUpdates(SAMPLE_ARTICLES, {
      limit: 2,
      resolveProductName: () => 'BuildCore',
    });

    assert.equal(recent[0]?.productLabel, 'BuildCore');
    assert.equal(recent[0]?.title, 'Creating Workflow Tasks');
    assert.equal(recent[0]?.updatedAt, '2026-06-28');
  });

  it('formats landing update dates for display', () => {
    assert.equal(formatDocsLandingUpdateDate('2026-06-27'), 'Jun 27, 2026');
  });
});
