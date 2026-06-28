import 'server-only';

import matter from 'gray-matter';
import { composeDocsMarkdownFile } from '@/platform/docs/docsFrontmatterGenerator';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { loadDocsMarkdownFiles } from '@/platform/docs/docsMarkdownLoader';
import { readDocsMarkdownFile, writeDocsMarkdownFile } from '@/platform/docs/docsMarkdownWriter.server';

export function writeDocsMarkdownAuthorContext(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
  authorContext: string,
): boolean {
  const trimmed = authorContext.trim();
  const files = loadDocsMarkdownFiles();
  const file = files.find(
    (entry) =>
      entry.frontmatter.product === product &&
      entry.frontmatter.category === category &&
      entry.frontmatter.slug === slug,
  );

  if (file == null) {
    const raw = readDocsMarkdownFile(product, category, slug);
    if (raw == null) {
      return false;
    }

    const { data, content } = matter(raw);
    const nextData = { ...data } as Record<string, unknown>;
    if (trimmed === '') {
      delete nextData.authorContext;
    } else {
      nextData.authorContext = trimmed;
    }

    writeDocsMarkdownFile(product, category, slug, matter.stringify(content.trim(), nextData));
    return true;
  }

  const { authorContext: _existing, ...frontmatterWithoutAuthorContext } = file.frontmatter;
  const frontmatter =
    trimmed === ''
      ? frontmatterWithoutAuthorContext
      : { ...frontmatterWithoutAuthorContext, authorContext: trimmed };

  writeDocsMarkdownFile(product, category, slug, composeDocsMarkdownFile(frontmatter, file.content));
  return true;
}
