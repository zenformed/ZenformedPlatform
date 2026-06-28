import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildDocsSearchEventRecord,
  isDocsSearchQueryLoggable,
  normalizeDocsSearchQuery,
  resolveDocsSearchEventProduct,
} from '@/platform/docs/docsSearchAnalytics';
import {
  logDocsSearchEventClient,
  recordDocsSearchClickClient,
} from '@/presentation/components/Docs/DocsSearchAnalytics';

describe('docsSearchAnalytics', () => {
  it('normalizes queries by trimming, lowercasing, and collapsing whitespace', () => {
    assert.equal(normalizeDocsSearchQuery('  Upload   Documents  '), 'upload documents');
    assert.equal(normalizeDocsSearchQuery('Budget\n\tEntries'), 'budget entries');
  });

  it('ignores empty queries', () => {
    assert.equal(isDocsSearchQueryLoggable(''), false);
    assert.equal(isDocsSearchQueryLoggable('   '), false);
    assert.equal(buildDocsSearchEventRecord({ query: '   ', resultsCount: 0 }), null);
  });

  it('saves results_count on search event records', () => {
    const record = buildDocsSearchEventRecord({
      query: 'Upload Documents',
      product: 'buildcore',
      resultsCount: 4,
      sessionId: 'session-123',
    });

    assert.notEqual(record, null);
    assert.equal(record?.query, 'Upload Documents');
    assert.equal(record?.normalizedQuery, 'upload documents');
    assert.equal(record?.product, 'buildcore');
    assert.equal(record?.resultsCount, 4);
    assert.equal(record?.sessionId, 'session-123');
  });

  it('saves no-results searches with results_count 0', () => {
    const record = buildDocsSearchEventRecord({
      query: 'missing topic',
      resultsCount: 0,
    });

    assert.notEqual(record, null);
    assert.equal(record?.resultsCount, 0);
    assert.equal(record?.normalizedQuery, 'missing topic');
  });

  it('resolves supported product scopes', () => {
    assert.equal(resolveDocsSearchEventProduct('buildcore'), 'buildcore');
    assert.equal(resolveDocsSearchEventProduct(' unknown '), null);
    assert.equal(resolveDocsSearchEventProduct(undefined), null);
  });
});

describe('docsSearchAnalytics client logging', () => {
  it('does not throw when search logging API fails', async () => {
    const originalFetch = globalThis.fetch;
    const originalWindow = globalThis.window;
    const storage = new Map<string, string>();

    globalThis.fetch = (async () => {
      throw new Error('network failure');
    }) as typeof fetch;

    globalThis.window = {
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
      },
    } as Window & typeof globalThis;

    await assert.doesNotReject(async () => {
      const eventId = await logDocsSearchEventClient({
        query: 'budget',
        resultsCount: 2,
      });
      assert.equal(eventId, null);
    });

    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
  });

  it('does not throw when search click logging API fails', () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = (async () => {
      throw new Error('network failure');
    }) as typeof fetch;

    assert.doesNotThrow(() => {
      recordDocsSearchClickClient('event-id', 'article-id');
    });

    globalThis.fetch = originalFetch;
  });
});
