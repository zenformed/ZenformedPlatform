import fs from 'fs';
import path from 'path';
import { DOCS_CONTENT_ROOT } from '@/platform/docs/docsArticleFrontmatter';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export function getDocsContentRootPath(): string {
  return path.join(process.cwd(), DOCS_CONTENT_ROOT);
}

export function getDocsMarkdownAbsolutePath(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): string {
  return path.join(getDocsContentRootPath(), product, category, `${slug}.md`);
}

export function getDocsArticleImageDirectory(
  product: DocsProductSlug,
  articleSlug: string,
): string {
  return path.join(process.cwd(), 'public', 'docs', 'images', product, articleSlug);
}

export function docsMarkdownFileExists(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): boolean {
  return fs.existsSync(getDocsMarkdownAbsolutePath(product, category, slug));
}

export function deleteDocsMarkdownFile(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): boolean {
  const filePath = getDocsMarkdownAbsolutePath(product, category, slug);
  if (!fs.existsSync(filePath)) {
    return false;
  }

  fs.unlinkSync(filePath);
  return true;
}

export function removeEmptyDocsArticleImageDirectory(
  product: DocsProductSlug,
  articleSlug: string,
): boolean {
  const directory = getDocsArticleImageDirectory(product, articleSlug);
  if (!fs.existsSync(directory)) {
    return false;
  }

  const entries = fs.readdirSync(directory);
  if (entries.length > 0) {
    return false;
  }

  fs.rmdirSync(directory);
  return true;
}
