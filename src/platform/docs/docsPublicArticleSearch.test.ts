import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import {
  searchPublicDocsArticles,
  splitDocsSearchHighlight,
} from '@/platform/docs/docsPublicArticleSearch';

const searchArticles: readonly DocsArticle[] = [
  {
    id: 'buildcore-documents-upload',
    slug: 'upload-documents',
    title: 'Upload Documents',
    summary: 'Upload files to a project.',
    product: 'buildcore',
    category: 'documents',
    visibility: 'public',
    tags: ['documents', 'upload'],
    estimatedReadTime: '4 min read',
    lastUpdated: '2026-06-27',
    author: 'Zenformed Documentation',
    relatedArticles: [],
    content: 'Use the workflow task paperclip to upload documents for a task.',
  },
  {
    id: 'buildcore-documents-draft',
    slug: 'draft-upload-guide',
    title: 'Draft Upload Guide',
    summary: 'Draft article about upload.',
    product: 'buildcore',
    category: 'documents',
    visibility: 'staff',
    tags: ['upload'],
    estimatedReadTime: '3 min read',
    lastUpdated: '2026-06-26',
    author: 'Zenformed Documentation',
    relatedArticles: [],
    content: 'This staff-only draft mentions upload workflow tasks.',
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
    content: 'Start from the projects list and choose New project.',
  },
];

const searchResolvers = {
  resolveCategoryTitle: (product: string, category: string) => {
    if (product === 'buildcore' && category === 'documents') {
      return 'Documents';
    }

    if (product === 'buildcore' && category === 'projects') {
      return 'Projects';
    }

    return category;
  },
  resolveProductName: (product: string) => (product === 'buildcore' ? 'BuildCore' : product),
};

describe('docsPublicArticleSearch', () => {
  it('returns published public articles that match the query', () => {
    const results = searchPublicDocsArticles(searchArticles, {
      query: 'upload',
      ...searchResolvers,
    });

    assert.equal(results.length, 1);
    assert.equal(results[0]?.article.slug, 'upload-documents');
  });

  it('excludes staff and internal articles from search results', () => {
    const results = searchPublicDocsArticles(searchArticles, {
      query: 'draft upload',
      ...searchResolvers,
    });

    assert.equal(results.length, 0);
  });

  it('matches terms in markdown body text', () => {
    const results = searchPublicDocsArticles(searchArticles, {
      query: 'paperclip',
      ...searchResolvers,
    });

    assert.equal(results.length, 1);
    assert.equal(results[0]?.article.slug, 'upload-documents');
    assert.match(results[0]?.excerpt ?? '', /paperclip/i);
  });

  it('filters search results by product', () => {
    const results = searchPublicDocsArticles(searchArticles, {
      query: 'project',
      product: 'buildcore',
      ...searchResolvers,
    });

    assert.ok(results.some((result) => result.article.slug === 'create-project'));
    assert.equal(
      results.some((result) => result.article.product !== 'buildcore'),
      false,
    );
  });

  it('filters search results by category', () => {
    const results = searchPublicDocsArticles(searchArticles, {
      query: 'project',
      product: 'buildcore',
      category: 'projects',
      ...searchResolvers,
    });

    assert.equal(results.length, 1);
    assert.equal(results[0]?.article.slug, 'create-project');
  });

  it('highlights matching terms in excerpts', () => {
    const parts = splitDocsSearchHighlight('Upload documents for workflow tasks', 'upload workflow');

    assert.ok(parts.some((part) => part.highlighted && part.text.toLowerCase() === 'upload'));
    assert.ok(parts.some((part) => part.highlighted && part.text.toLowerCase() === 'workflow'));
  });
});
