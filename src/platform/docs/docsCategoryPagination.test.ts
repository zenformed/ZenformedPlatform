import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DOCS_CATEGORY_ARTICLES_PER_PAGE,
  docsCategoryPagePath,
  paginateDocsCategoryArticles,
  parseDocsCategoryPageParam,
} from '@/platform/docs/docsCategoryPagination';

describe('docsCategoryPagination', () => {
  it('parses page query params with a minimum of 1', () => {
    assert.equal(parseDocsCategoryPageParam(undefined), 1);
    assert.equal(parseDocsCategoryPageParam(''), 1);
    assert.equal(parseDocsCategoryPageParam('0'), 1);
    assert.equal(parseDocsCategoryPageParam('2'), 2);
  });

  it('paginates category articles five per page', () => {
    const items = Array.from({ length: 12 }, (_, index) => `article-${index + 1}`);

    const pageOne = paginateDocsCategoryArticles(items, 1);
    assert.equal(pageOne.page, 1);
    assert.equal(pageOne.pageSize, DOCS_CATEGORY_ARTICLES_PER_PAGE);
    assert.equal(pageOne.totalPages, 3);
    assert.deepEqual(pageOne.items, ['article-1', 'article-2', 'article-3', 'article-4', 'article-5']);

    const pageThree = paginateDocsCategoryArticles(items, 3);
    assert.deepEqual(pageThree.items, ['article-11', 'article-12']);
  });

  it('clamps out-of-range pages', () => {
    const items = ['a', 'b', 'c'];
    const result = paginateDocsCategoryArticles(items, 99);

    assert.equal(result.page, 1);
    assert.deepEqual(result.items, ['a', 'b', 'c']);
  });

  it('builds category page paths with optional page query', () => {
    assert.equal(docsCategoryPagePath('buildcore', 'projects'), '/docs/buildcore/projects');
    assert.equal(
      docsCategoryPagePath('buildcore', 'projects', 2),
      '/docs/buildcore/projects?page=2',
    );
  });
});
