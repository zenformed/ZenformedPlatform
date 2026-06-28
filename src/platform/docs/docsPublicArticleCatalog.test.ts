import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import {
  buildPublicDocsCategoryArticleCounts,
  filterPublicDocsCategoryArticles,
  isPublicDocsCategoryListingArticle,
} from '@/platform/docs/docsPublicArticleCatalog';

const sampleArticles: readonly DocsArticle[] = [
  {
    id: 'buildcore-documents-project-documents',
    slug: 'project-documents',
    title: 'Project Documents',
    summary: 'Upload and manage files on a project.',
    product: 'buildcore',
    category: 'documents',
    visibility: 'public',
    tags: ['documents'],
    estimatedReadTime: '4 min read',
    lastUpdated: '2026-06-27',
    author: 'Zenformed Documentation',
    relatedArticles: [],
    content: 'Body',
  },
  {
    id: 'buildcore-documents-organize-project-documents',
    slug: 'organize-project-documents',
    title: 'Organize Project Documents',
    summary: 'Keep project files organized.',
    product: 'buildcore',
    category: 'documents',
    visibility: 'staff',
    tags: ['documents'],
    estimatedReadTime: '3 min read',
    lastUpdated: '2026-06-26',
    author: 'Zenformed Documentation',
    relatedArticles: [],
    content: 'Body',
  },
  {
    id: 'buildcore-projects-create-project',
    slug: 'create-project',
    title: 'Create a Project',
    summary: 'Create a new BuildCore project.',
    product: 'buildcore',
    category: 'projects',
    visibility: 'public',
    tags: ['projects'],
    estimatedReadTime: '5 min read',
    lastUpdated: '2026-06-25',
    author: 'Zenformed Documentation',
    relatedArticles: [],
    content: 'Body',
  },
];

describe('docsPublicArticleCatalog', () => {
  it('lists only public articles for a product/category', () => {
    const articles = filterPublicDocsCategoryArticles(sampleArticles, 'buildcore', 'documents');

    assert.equal(articles.length, 1);
    assert.equal(articles[0]?.slug, 'project-documents');
  });

  it('excludes non-public articles from category listings', () => {
    assert.equal(isPublicDocsCategoryListingArticle(sampleArticles[1]), false);
  });

  it('builds published public article counts by category', () => {
    const counts = buildPublicDocsCategoryArticleCounts(sampleArticles, 'buildcore');

    assert.equal(counts.documents, 1);
    assert.equal(counts.projects, 1);
    assert.equal(counts.workflow, undefined);
  });
});
