import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isPublishedPublicPlatformDocsArticleRow,
  mapPlatformDocsArticleRowToDocsArticle,
} from '@/platform/docs/docsDatabaseArticleMapper';
import { mapFrontmatterToUpsertInput } from '@/platform/docs/docsDatabaseImportMapper';
import type { PlatformDocsArticleRow } from '@/platform/docs/docsDatabaseTypes';

const publishedRow: PlatformDocsArticleRow = {
  id: '11111111-1111-1111-1111-111111111111',
  product_slug: 'buildcore',
  category_slug: 'documents',
  slug: 'upload-documents',
  title: 'Upload Documents',
  summary: 'Upload files to a project.',
  visibility: 'public',
  status: 'published',
  tags: ['documents'],
  estimated_read_time_minutes: 4,
  author: 'Zenformed Documentation',
  body_markdown: 'Upload workflow task documents from the project page.',
  author_context: null,
  source: 'database',
  created_at: '2026-06-27T12:00:00.000Z',
  updated_at: '2026-06-28T12:00:00.000Z',
  published_at: '2026-06-28T12:00:00.000Z',
  archived_at: null,
  deleted_at: null,
};

describe('docsDatabaseArticleMapper', () => {
  it('maps published database rows to public docs articles', () => {
    const article = mapPlatformDocsArticleRowToDocsArticle(publishedRow);

    assert.equal(article.slug, 'upload-documents');
    assert.equal(article.estimatedReadTime, '4 min read');
    assert.equal(article.lastUpdated, '2026-06-28');
    assert.match(article.content, /workflow task documents/i);
  });

  it('identifies published public rows for public lookup', () => {
    assert.equal(isPublishedPublicPlatformDocsArticleRow(publishedRow), true);
    assert.equal(
      isPublishedPublicPlatformDocsArticleRow({ ...publishedRow, status: 'draft' }),
      false,
    );
    assert.equal(
      isPublishedPublicPlatformDocsArticleRow({ ...publishedRow, deleted_at: '2026-06-29T00:00:00.000Z' }),
      false,
    );
  });
});

describe('docsDatabaseImportMapper', () => {
  it('maps markdown frontmatter to database upsert input', () => {
    const upsert = mapFrontmatterToUpsertInput(
      {
        title: 'Upload Documents',
        slug: 'upload-documents',
        product: 'buildcore',
        category: 'documents',
        summary: 'Upload files to a project.',
        visibility: 'public',
        tags: ['documents'],
        estimatedReadTime: 4,
        lastUpdated: '2026-06-28',
        author: 'Zenformed Documentation',
        published: true,
      },
      'Body markdown',
      { source: 'markdown', publishedAt: '2026-06-28T12:00:00.000Z' },
    );

    assert.equal(upsert.status, 'published');
    assert.equal(upsert.source, 'markdown');
    assert.equal(upsert.estimatedReadTimeMinutes, 4);
    assert.equal(upsert.bodyMarkdown, 'Body markdown');
  });

  it('maps unpublished markdown frontmatter to draft status', () => {
    const upsert = mapFrontmatterToUpsertInput(
      {
        title: 'Draft Article',
        slug: 'draft-article',
        product: 'buildcore',
        category: 'documents',
        visibility: 'public',
        tags: [],
        estimatedReadTime: 5,
        lastUpdated: '2026-06-28',
        author: 'Zenformed Documentation',
        published: false,
      },
      'Draft body',
    );

    assert.equal(upsert.status, 'draft');
    assert.equal(upsert.publishedAt, null);
  });
});
