import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyDocsAuthoringAiResult, applyDocsAuthoringAiAssistantOperations, restoreDocsAuthoringAiEditorSnapshot } from '@/platform/docs/docsAuthoringAiApply';
import type { DocsAuthoringAiResult } from '@/platform/docs/docsAuthoringAiTypes';

describe('applyDocsAuthoringAiResult', () => {
  it('does not write markdown when generate draft validation fails', () => {
    let markdown = '# Starter\n\nTemplate body.';
    let setMarkdownCalled = false;

    const applied = applyDocsAuthoringAiResult(
      {
        status: 'error',
        action: 'generate_draft',
        message: 'Draft blocked:\n- Invented label: "Save Budget Entry"',
        validationFailures: [
          {
            type: 'Invented label',
            code: 'unsupported_implementation_label',
            rejectedValue: 'Save Budget Entry',
            reason: 'UI label "Save Budget Entry" is not present in implementation context.',
            source: 'docsAuthoringAiHallucinationValidation.ts',
            phase: 'after_retry',
          },
        ],
      } satisfies DocsAuthoringAiResult,
      null,
      {
        getContentMarkdown: () => markdown,
        onMarkdownChange: (next) => {
          markdown = next;
        },
        onTitleChange: () => {},
        onSummaryChange: () => {},
        onTagsChange: () => {},
        editorCommands: {
          setMarkdown: () => {
            setMarkdownCalled = true;
          },
          replaceSelection: () => {},
        },
      },
    );

    assert.equal(applied, false);
    assert.equal(markdown, '# Starter\n\nTemplate body.');
    assert.equal(setMarkdownCalled, false);
  });

  it('writes markdown only for successful generate draft results', () => {
    let markdown = '# Starter\n\nTemplate body.';

    const applied = applyDocsAuthoringAiResult(
      {
        status: 'success',
        action: 'generate_draft',
        message: 'Draft generated and inserted into the editor.',
        payload: {
          kind: 'markdown',
          markdown: '## Overview\n\nGenerated body.',
          mode: 'replace',
        },
      } satisfies DocsAuthoringAiResult,
      null,
      {
        getContentMarkdown: () => markdown,
        onMarkdownChange: (next) => {
          markdown = next;
        },
        onTitleChange: () => {},
        onSummaryChange: () => {},
        onTagsChange: () => {},
      },
    );

    assert.equal(applied, true);
    assert.equal(markdown, '## Overview\n\nGenerated body.');
  });

  it('restores the editor snapshot after a failed generate draft', () => {
    let markdown = '# Starter\n\nTemplate body.';
    let title = 'Creating Budget Entries';
    let summary = 'Learn about Creating Budget Entries.';
    let tags: readonly string[] = ['budget'];
    let authorContext = 'Use the budget tab from project settings.';
    let setMarkdownValue = markdown;

    restoreDocsAuthoringAiEditorSnapshot(
      {
        contentMarkdown: '# Starter\n\nTemplate body.',
        title: 'Creating Budget Entries',
        summary: 'Learn about Creating Budget Entries.',
        tags: ['budget'],
        authorContext: 'Use the budget tab from project settings.',
      },
      {
        getContentMarkdown: () => markdown,
        onMarkdownChange: (next) => {
          markdown = next;
        },
        onTitleChange: (next) => {
          title = next;
        },
        onSummaryChange: (next) => {
          summary = next;
        },
        onTagsChange: (next) => {
          tags = next;
        },
        onAuthorContextChange: (next) => {
          authorContext = next;
        },
        editorCommands: {
          setMarkdown: (next) => {
            setMarkdownValue = next;
          },
          replaceSelection: () => {},
        },
      },
    );

    assert.equal(markdown, '# Starter\n\nTemplate body.');
    assert.equal(title, 'Creating Budget Entries');
    assert.equal(summary, 'Learn about Creating Budget Entries.');
    assert.deepEqual(tags, ['budget']);
    assert.equal(authorContext, 'Use the budget tab from project settings.');
    assert.equal(setMarkdownValue, '# Starter\n\nTemplate body.');
  });

  it('applies assistant document and metadata operations', () => {
    let markdown = '# Starter\n\nTemplate body.';
    let summary = 'Old summary';
    let tags: readonly string[] = ['budget'];

    const applied = applyDocsAuthoringAiAssistantOperations(
      [
        { type: 'replace_document', markdown: '## Overview\n\nUpdated body.' },
        { type: 'update_summary', value: 'New summary' },
        { type: 'update_tags', tags: ['budget', 'projects'] },
      ],
      null,
      {
        getContentMarkdown: () => markdown,
        onMarkdownChange: (next) => {
          markdown = next;
        },
        onTitleChange: () => {},
        onSummaryChange: (next) => {
          summary = next;
        },
        onTagsChange: (next) => {
          tags = next;
        },
      },
    );

    assert.equal(applied, true);
    assert.equal(markdown, '## Overview\n\nUpdated body.');
    assert.equal(summary, 'New summary');
    assert.deepEqual(tags, ['budget', 'projects']);
  });
});
