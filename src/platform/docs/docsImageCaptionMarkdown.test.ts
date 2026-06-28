import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatDocsImageMarkdownBlock,
  normalizeDocsImageCaptionsInMarkdown,
  parseDocsImageMarkdownBlock,
} from '@/platform/docs/docsImageCaptionMarkdown';

describe('docsImageCaptionMarkdown', () => {
  it('formats captions above images', () => {
    const markdown = formatDocsImageMarkdownBlock({
      alt: 'Workflow screenshot',
      src: '/docs/images/buildcore/example.png',
      caption: 'Upload Documents For a Workflow Task',
    });

    assert.match(markdown, /^\*Upload Documents For a Workflow Task\*/);
    assert.match(markdown, /!\[Workflow screenshot\]/);
  });

  it('normalizes legacy caption-after-image markdown', () => {
    const markdown = normalizeDocsImageCaptionsInMarkdown(
      'Intro paragraph.\n\n![Screenshot](/docs/images/buildcore/example.png)\n*Upload Documents For a Workflow Task*\n\nNext section.',
    );

    assert.match(markdown, /\*Upload Documents For a Workflow Task\*\n!\[Screenshot\]/);
    assert.doesNotMatch(markdown, /!\[Screenshot\][\s\S]*\*Upload Documents For a Workflow Task\*/);
  });

  it('parses caption-before-image blocks', () => {
    const lines = ['*Upload Documents*', '![Screenshot](/docs/images/buildcore/example.png)'];
    const parsed = parseDocsImageMarkdownBlock(lines, 0);

    assert.ok(parsed != null);
    assert.equal(parsed.block.caption, 'Upload Documents');
    assert.equal(parsed.block.alt, 'Screenshot');
    assert.equal(parsed.nextIndex, 2);
  });

  it('parses legacy caption-after-image blocks', () => {
    const lines = ['![Screenshot](/docs/images/buildcore/example.png)', '*Upload Documents*'];
    const parsed = parseDocsImageMarkdownBlock(lines, 0);

    assert.ok(parsed != null);
    assert.equal(parsed.block.caption, 'Upload Documents');
    assert.equal(parsed.nextIndex, 2);
  });
});
