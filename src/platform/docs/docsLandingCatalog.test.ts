import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import {
  buildPopularDocsLandingArticles,
  buildRecentDocsLandingUpdates,
  formatDocsLandingUpdateDate,
  sortDocsArticlesByLastUpdatedDesc,
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
];

describe('docsLandingCatalog', () => {
  it('sorts published articles by lastUpdated descending', () => {
    const sorted = sortDocsArticlesByLastUpdatedDesc(SAMPLE_ARTICLES);
    assert.equal(sorted[0]?.slug, 'creating-budget-entries');
    assert.equal(sorted[1]?.slug, 'upload-documents');
  });

  it('builds popular article links from published articles', () => {
    const popular = buildPopularDocsLandingArticles(SAMPLE_ARTICLES, { limit: 2 });
    assert.equal(popular.length, 2);
    assert.equal(popular[0]?.title, 'Creating Budget Entries');
    assert.equal(popular[0]?.href, '/docs/buildcore/budget/creating-budget-entries');
  });

  it('builds recent updates with product labels and dates', () => {
    const recent = buildRecentDocsLandingUpdates(SAMPLE_ARTICLES, {
      limit: 2,
      resolveProductName: () => 'BuildCore',
    });

    assert.equal(recent[0]?.productLabel, 'BuildCore');
    assert.equal(recent[0]?.title, 'Creating Budget Entries');
    assert.equal(recent[0]?.updatedAt, '2026-06-27');
    assert.equal(recent[0]?.href, '/docs/buildcore/budget/creating-budget-entries');
  });

  it('formats landing update dates for display', () => {
    assert.equal(formatDocsLandingUpdateDate('2026-06-27'), 'Jun 27, 2026');
  });
});
