import { parseDocsImageMarkdownBlock } from '@/platform/docs/docsImageCaptionMarkdown';

const CALLOUT_LINE = /^>\s*\*\*(Note|Tip|Warning):\*\*\s*(.*)$/i;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

export function preprocessDocsAuthoringMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const output: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const calloutMatch = line.match(CALLOUT_LINE);
    if (calloutMatch != null) {
      const variant = calloutMatch[1].toLowerCase();
      const text = calloutMatch[2].trim();
      output.push(`<div data-docs-callout="${variant}">${escapeHtml(text)}</div>`);
      index += 1;
      continue;
    }

    const imageBlock = parseDocsImageMarkdownBlock(lines, index);
    if (imageBlock != null) {
      const { alt, src, caption } = imageBlock.block;
      output.push(
        `<figure data-docs-image="true" data-src="${escapeAttribute(src)}" data-alt="${escapeAttribute(alt)}" data-caption="${escapeAttribute(caption)}"></figure>`,
      );
      index = imageBlock.nextIndex;
      continue;
    }

    output.push(line);
    index += 1;
  }

  return output.join('\n');
}

export function normalizeDocsAuthoringMarkdown(markdown: string): string {
  return `${markdown.replace(/\r\n/g, '\n').trim()}\n`;
}
