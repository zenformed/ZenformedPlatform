import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canUseDocsDatabaseSource, isDocsDatabaseContentSource, resolveDocsContentSource } from '@/platform/docs/docsContentSource';

describe('docsContentSource', () => {
  it('defaults to markdown when unset', () => {
    assert.equal(resolveDocsContentSource({}), 'markdown');
  });

  it('respects DOCS_CONTENT_SOURCE=database', () => {
    assert.equal(resolveDocsContentSource({ DOCS_CONTENT_SOURCE: 'database' }), 'database');
    assert.equal(isDocsDatabaseContentSource({ DOCS_CONTENT_SOURCE: 'database' }), true);
  });

  it('requires service role credentials to use database source', () => {
    assert.equal(
      canUseDocsDatabaseSource({
        DOCS_CONTENT_SOURCE: 'database',
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      }),
      false,
    );
    assert.equal(
      canUseDocsDatabaseSource({
        DOCS_CONTENT_SOURCE: 'database',
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      }),
      true,
    );
  });
});
