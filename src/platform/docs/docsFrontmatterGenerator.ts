import type { DocsArticleFrontmatter } from '@/platform/docs/docsArticleFrontmatter';
import type { DocsArticleVisibility } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { buildDocsArticleBodyTemplate } from '@/platform/docs/docsArticleBodyTemplate';

export const DOCS_DEFAULT_AUTHOR = 'Zenformed Documentation';

export type CreateDocsArticleInput = {
  readonly title: string;
  readonly slug: string;
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly summary?: string;
  readonly visibility?: DocsArticleVisibility;
  readonly tags?: readonly string[];
  readonly estimatedReadTime?: number;
  readonly lastUpdated?: string;
  readonly author?: string;
  readonly published?: boolean;
  readonly authorContext?: string;
};

export function buildDefaultDocsSummary(title: string): string {
  return `Learn about ${title.replace(/\.$/, '')}.`;
}

export function buildDefaultDocsTags(category: DocsCategorySlug): readonly string[] {
  return [category];
}

export function buildDocsArticleFrontmatter(input: CreateDocsArticleInput): DocsArticleFrontmatter {
  const today = new Date().toISOString().slice(0, 10);

  return {
    title: input.title.trim(),
    slug: input.slug,
    product: input.product,
    category: input.category,
    summary: input.summary?.trim() ?? buildDefaultDocsSummary(input.title),
    visibility: input.visibility ?? 'public',
    tags: input.tags ?? buildDefaultDocsTags(input.category),
    estimatedReadTime: input.estimatedReadTime ?? 5,
    lastUpdated: input.lastUpdated ?? today,
    author: input.author ?? DOCS_DEFAULT_AUTHOR,
    published: input.published ?? false,
    ...(input.authorContext != null && input.authorContext.trim() !== ''
      ? { authorContext: input.authorContext.trim() }
      : {}),
  };
}

export function parseEstimatedReadTimeMinutes(value: string): number {
  const match = value.match(/(\d+)/);
  if (match == null) {
    return 5;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isNaN(parsed) ? 5 : parsed;
}

export type SaveDocsArticleInput = {
  readonly title: string;
  readonly slug: string;
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly summary: string;
  readonly visibility: DocsArticleVisibility;
  readonly tags: readonly string[];
  readonly estimatedReadTime: string;
  readonly author: string;
  readonly published: boolean;
  readonly content: string;
  readonly authorContext?: string;
};

export function buildSaveDocsArticleFrontmatter(input: SaveDocsArticleInput): DocsArticleFrontmatter {
  const today = new Date().toISOString().slice(0, 10);

  return {
    title: input.title.trim(),
    slug: input.slug,
    product: input.product,
    category: input.category,
    summary: input.summary.trim(),
    visibility: input.visibility,
    tags: input.tags.map((tag) => tag.trim()).filter((tag) => tag !== ''),
    estimatedReadTime: parseEstimatedReadTimeMinutes(input.estimatedReadTime),
    lastUpdated: today,
    author: input.author.trim() || DOCS_DEFAULT_AUTHOR,
    published: input.published,
    ...(input.authorContext != null && input.authorContext.trim() !== ''
      ? { authorContext: input.authorContext.trim() }
      : {}),
  };
}

export function composeDocsMarkdownFile(
  frontmatter: DocsArticleFrontmatter,
  content: string,
): string {
  const lines = ['---'];

  lines.push(`title: ${formatYamlString(frontmatter.title)}`);
  lines.push(`slug: ${frontmatter.slug}`);
  lines.push(`product: ${frontmatter.product}`);
  lines.push(`category: ${frontmatter.category}`);
  lines.push(`summary: ${formatYamlString(frontmatter.summary ?? '')}`);
  lines.push(`visibility: ${frontmatter.visibility}`);
  lines.push('tags:');

  for (const tag of frontmatter.tags) {
    lines.push(`  - ${tag}`);
  }

  lines.push(`estimatedReadTime: ${frontmatter.estimatedReadTime}`);
  lines.push(`lastUpdated: ${frontmatter.lastUpdated}`);
  lines.push(`author: ${formatYamlString(frontmatter.author)}`);
  lines.push(`published: ${frontmatter.published ? 'true' : 'false'}`);

  if (frontmatter.authorContext != null && frontmatter.authorContext.trim() !== '') {
    lines.push(`authorContext: ${formatYamlString(frontmatter.authorContext)}`);
  }

  lines.push('---', '', content.trim(), '');

  return lines.join('\n');
}

export function buildNewDocsMarkdownFile(input: CreateDocsArticleInput): {
  readonly frontmatter: DocsArticleFrontmatter;
  readonly content: string;
  readonly markdown: string;
} {
  const frontmatter = buildDocsArticleFrontmatter(input);
  const content = buildDocsArticleBodyTemplate(frontmatter.title);

  return {
    frontmatter,
    content,
    markdown: composeDocsMarkdownFile(frontmatter, content),
  };
}

function formatYamlString(value: string): string {
  if (/[:#\n\r]/.test(value) || value.startsWith(' ') || value.endsWith(' ')) {
    return JSON.stringify(value);
  }

  return value;
}
