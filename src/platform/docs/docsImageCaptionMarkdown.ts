const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/;
const CAPTION_LINE = /^\*([^*]+)\*\s*$/;

export type DocsImageMarkdownBlock = {
  readonly alt: string;
  readonly src: string;
  readonly caption: string;
};

function extractCaption(line: string): string | undefined {
  const match = line.trim().match(CAPTION_LINE);
  return match?.[1]?.trim();
}

function parseImageLine(line: string): { readonly alt: string; readonly src: string } | undefined {
  const match = line.trim().match(IMAGE_LINE);
  if (match == null) {
    return undefined;
  }

  return {
    alt: match[1],
    src: match[2],
  };
}

export function formatDocsImageMarkdownBlock(block: DocsImageMarkdownBlock): string {
  const imageLine = `![${block.alt}](${block.src})`;
  const caption = block.caption.trim();

  if (caption === '') {
    return `${imageLine}\n\n`;
  }

  return `*${caption}*\n${imageLine}\n\n`;
}

export function parseDocsImageMarkdownBlock(
  lines: readonly string[],
  startIndex: number,
): { readonly block: DocsImageMarkdownBlock; readonly nextIndex: number } | undefined {
  const currentLine = lines[startIndex]?.trim() ?? '';
  const imageFromCurrent = parseImageLine(currentLine);

  if (imageFromCurrent != null) {
    const captionAfter = extractCaption(lines[startIndex + 1]?.trim() ?? '');

    return {
      block: {
        alt: imageFromCurrent.alt,
        src: imageFromCurrent.src,
        caption: captionAfter ?? '',
      },
      nextIndex: captionAfter != null ? startIndex + 2 : startIndex + 1,
    };
  }

  const captionFromCurrent = extractCaption(currentLine);
  const imageFromNext = parseImageLine(lines[startIndex + 1]?.trim() ?? '');

  if (captionFromCurrent != null && imageFromNext != null) {
    return {
      block: {
        alt: imageFromNext.alt,
        src: imageFromNext.src,
        caption: captionFromCurrent,
      },
      nextIndex: startIndex + 2,
    };
  }

  return undefined;
}

export function normalizeDocsImageCaptionsInMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const output: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const parsed = parseDocsImageMarkdownBlock(lines, index);

    if (parsed != null) {
      const formatted = formatDocsImageMarkdownBlock(parsed.block).trimEnd();
      if (formatted !== '') {
        if (output.length > 0 && output[output.length - 1]?.trim() !== '') {
          output.push('');
        }
        output.push(...formatted.split('\n'));
      }
      index = parsed.nextIndex;
      continue;
    }

    output.push(lines[index] ?? '');
    index += 1;
  }

  return output.join('\n');
}
