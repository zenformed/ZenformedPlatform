import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildDocsArticleBodyTemplate } from '@/platform/docs/docsArticleBodyTemplate';
import { validateDocsArticleForPublish } from '@/platform/docs/docsArticlePublishValidation';

describe('validateDocsArticleForPublish', () => {
  it('rejects articles missing required fields', () => {
    assert.deepEqual(
      validateDocsArticleForPublish({
        title: '',
        summary: 'Summary',
        category: 'projects',
        content: 'Body',
      }),
      { ok: false, code: 'title_required' },
    );

    assert.deepEqual(
      validateDocsArticleForPublish({
        title: 'Title',
        summary: '',
        category: 'projects',
        content: 'Body',
      }),
      { ok: false, code: 'summary_required' },
    );

    assert.deepEqual(
      validateDocsArticleForPublish({
        title: 'Title',
        summary: 'Summary',
        category: '',
        content: 'Body',
      }),
      { ok: false, code: 'category_required' },
    );

    assert.deepEqual(
      validateDocsArticleForPublish({
        title: 'Title',
        summary: 'Summary',
        category: 'projects',
        content: '   ',
      }),
      { ok: false, code: 'content_required' },
    );
  });

  it('rejects starter template content', () => {
    const title = 'Create a Project';
    const result = validateDocsArticleForPublish({
      title,
      summary: 'Summary',
      category: 'projects',
      content: buildDocsArticleBodyTemplate(title),
    });

    assert.deepEqual(result, { ok: false, code: 'starter_template_content' });
  });

  it('accepts edited article content', () => {
    const title = 'Create a Project';
    const result = validateDocsArticleForPublish({
      title,
      summary: 'Summary',
      category: 'projects',
      content: `${buildDocsArticleBodyTemplate(title)}\n\nAdditional guidance.`,
    });

    assert.deepEqual(result, { ok: true });
  });
});
