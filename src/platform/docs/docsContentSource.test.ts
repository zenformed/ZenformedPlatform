import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isDocsDatabaseContentSource, resolveDocsContentSource } from '@/platform/docs/docsContentSource';

describe('docsContentSource', () => {
  it('defaults to markdown when unset', () => {
    assert.equal(resolveDocsContentSource({}), 'markdown');
  });

  it('respects DOCS_CONTENT_SOURCE=database', () => {
    assert.equal(resolveDocsContentSource({ DOCS_CONTENT_SOURCE: 'database' }), 'database');
    assert.equal(isDocsDatabaseContentSource({ DOCS_CONTENT_SOURCE: 'database' }), true);
  });

  it('respects DOCS_CONTENT_SOURCE=markdown', () => {
    assert.equal(resolveDocsContentSource({ DOCS_CONTENT_SOURCE: 'markdown' }), 'markdown');
  });
});
