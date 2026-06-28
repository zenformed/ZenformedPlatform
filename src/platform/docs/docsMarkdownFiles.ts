import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  DOCS_CONTENT_ROOT,
  type DocsArticleFrontmatter,
  type DocsArticleFrontmatterRef,
  type ParsedDocsArticleFile,
} from '@/platform/docs/docsArticleFrontmatter';
import { getDocsCategory, getDocsProduct } from '@/platform/docs/docsCatalog';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

function getContentRootPath(): string {
  return path.join(process.cwd(), DOCS_CONTENT_ROOT);
}

function collectMarkdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath);
    }
  }

  return files;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return fallback;
}

function parseStringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function parseFrontmatterRef(value: unknown): DocsArticleFrontmatterRef | undefined {
  if (value == null || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.slug !== 'string' || record.slug.trim() === '') {
    return undefined;
  }

  return {
    slug: record.slug.trim(),
    title: typeof record.title === 'string' ? record.title : undefined,
    product: typeof record.product === 'string' ? (record.product as DocsProductSlug) : undefined,
    category:
      typeof record.category === 'string' ? (record.category as DocsCategorySlug) : undefined,
  };
}

function parseFrontmatterRefs(value: unknown): readonly DocsArticleFrontmatterRef[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => parseFrontmatterRef(item))
    .filter((item): item is DocsArticleFrontmatterRef => item != null);
}

function parseFrontmatter(data: Record<string, unknown>): DocsArticleFrontmatter | undefined {
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const slug = typeof data.slug === 'string' ? data.slug.trim() : '';
  const product = typeof data.product === 'string' ? (data.product as DocsProductSlug) : undefined;
  const category =
    typeof data.category === 'string' ? (data.category as DocsCategorySlug) : undefined;

  if (title === '' || slug === '' || product == null || category == null) {
    return undefined;
  }

  const visibility =
    data.visibility === 'public' ||
    data.visibility === 'authenticated' ||
    data.visibility === 'staff' ||
    data.visibility === 'organization'
      ? data.visibility
      : 'public';

  const estimatedReadTime =
    typeof data.estimatedReadTime === 'number' || typeof data.estimatedReadTime === 'string'
      ? data.estimatedReadTime
      : 5;

  const lastUpdated =
    typeof data.lastUpdated === 'string' && data.lastUpdated.trim() !== ''
      ? data.lastUpdated.trim()
      : new Date().toISOString().slice(0, 10);

  const author =
    typeof data.author === 'string' && data.author.trim() !== ''
      ? data.author.trim()
      : 'Zenformed Documentation';

  return {
    title,
    slug,
    product,
    category,
    summary: typeof data.summary === 'string' ? data.summary : undefined,
    visibility,
    tags: parseStringArray(data.tags),
    estimatedReadTime,
    lastUpdated,
    author,
    published: parseBoolean(data.published, true),
    relatedArticles: parseFrontmatterRefs(data.relatedArticles),
    previousArticle: parseFrontmatterRef(data.previousArticle),
    nextArticle: parseFrontmatterRef(data.nextArticle),
    ...(typeof data.authorContext === 'string' && data.authorContext.trim() !== ''
      ? { authorContext: data.authorContext.trim() }
      : {}),
  };
}

function isValidArticleLocation(
  product: DocsProductSlug,
  category: DocsCategorySlug,
): boolean {
  return getDocsProduct(product) != null && getDocsCategory(product, category) != null;
}

export function loadDocsMarkdownFiles(): readonly ParsedDocsArticleFile[] {
  const contentRoot = getContentRootPath();
  const markdownFiles = collectMarkdownFiles(contentRoot);
  const parsedFiles: ParsedDocsArticleFile[] = [];

  for (const filePath of markdownFiles) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    const frontmatter = parseFrontmatter(data as Record<string, unknown>);

    if (frontmatter == null) {
      continue;
    }

    if (!isValidArticleLocation(frontmatter.product, frontmatter.category)) {
      continue;
    }

    parsedFiles.push({
      filePath,
      frontmatter,
      content: content.trim(),
    });
  }

  return parsedFiles;
}
