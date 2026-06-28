import 'server-only';

import fs from 'fs';
import path from 'path';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { loadDocsMarkdownFiles } from '@/platform/docs/docsMarkdownLoader';
import {
  deleteDocsMarkdownFile,
  docsMarkdownFileExists,
  getDocsMarkdownAbsolutePath,
  removeEmptyDocsArticleImageDirectory,
} from '@/platform/docs/docsMarkdownFileOps';

export {
  deleteDocsMarkdownFile,
  docsMarkdownFileExists,
  getDocsArticleImageDirectory,
  getDocsMarkdownAbsolutePath,
  removeEmptyDocsArticleImageDirectory,
} from '@/platform/docs/docsMarkdownFileOps';

export function listDocsMarkdownSlugs(
  product: DocsProductSlug,
  category: DocsCategorySlug,
): readonly string[] {
  return loadDocsMarkdownFiles()
    .filter((file) => file.frontmatter.product === product && file.frontmatter.category === category)
    .map((file) => file.frontmatter.slug);
}

export function writeDocsMarkdownFile(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
  markdown: string,
): string {
  const filePath = getDocsMarkdownAbsolutePath(product, category, slug);
  const directory = path.dirname(filePath);

  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(filePath, markdown, 'utf8');

  return filePath;
}

export function readDocsMarkdownFile(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): string | undefined {
  const filePath = getDocsMarkdownAbsolutePath(product, category, slug);
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  return fs.readFileSync(filePath, 'utf8');
}
