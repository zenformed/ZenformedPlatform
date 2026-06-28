import { buildDocsArticleBodyTemplate } from '@/platform/docs/docsArticleBodyTemplate';

function normalizeMarkdownForCompare(markdown: string): string {
  return markdown.replace(/\r\n/g, '\n').trim().replace(/\n{3,}/g, '\n\n');
}

export function extractDocsArticleBodyFromMarkdown(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return normalized.trim();
  }

  const closingIndex = normalized.indexOf('\n---\n', 4);
  if (closingIndex === -1) {
    return normalized.trim();
  }

  return normalized.slice(closingIndex + '\n---\n'.length).trim();
}

export function isDocsArticleStarterTemplateContent(content: string, title: string): boolean {
  const normalizedContent = normalizeMarkdownForCompare(content);
  const expected = normalizeMarkdownForCompare(buildDocsArticleBodyTemplate(title));
  return normalizedContent === expected;
}

export function isDocsArticleStarterTemplateMarkdown(markdown: string, title: string): boolean {
  return isDocsArticleStarterTemplateContent(extractDocsArticleBodyFromMarkdown(markdown), title);
}

export function resolveReusableDocsArticleSlug(input: {
  readonly baseSlug: string;
  readonly title: string;
  readonly existingSlugs: readonly string[];
  readonly readMarkdownForSlug: (slug: string) => string | undefined;
}): { readonly slug: string; readonly reusedExistingDraft: boolean } {
  if (input.existingSlugs.includes(input.baseSlug)) {
    const existingMarkdown = input.readMarkdownForSlug(input.baseSlug);
    if (existingMarkdown != null && isDocsArticleStarterTemplateMarkdown(existingMarkdown, input.title)) {
      return { slug: input.baseSlug, reusedExistingDraft: true };
    }
  }

  return { slug: ensureUniqueDocsSlugLocal(input.baseSlug, input.existingSlugs), reusedExistingDraft: false };
}

function ensureUniqueDocsSlugLocal(baseSlug: string, existingSlugs: readonly string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;

  while (existingSlugs.includes(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
}
