import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { isPublicDocsCategoryListingArticle } from '@/platform/docs/docsPublicArticleCatalog';

export type DocsPublicSearchResult = {
  readonly article: DocsArticle;
  readonly excerpt: string;
  readonly productName: string;
  readonly categoryTitle: string;
  readonly score: number;
};

export type DocsPublicSearchOptions = {
  readonly query: string;
  readonly product?: DocsProductSlug;
  readonly category?: DocsCategorySlug;
  readonly resolveCategoryTitle: (
    product: DocsProductSlug,
    category: DocsCategorySlug,
  ) => string | undefined;
  readonly resolveProductName: (product: DocsProductSlug) => string | undefined;
};

export type DocsSearchHighlightPart = {
  readonly text: string;
  readonly highlighted: boolean;
};

const TITLE_MATCH_SCORE = 100;
const SUMMARY_MATCH_SCORE = 50;
const TAG_MATCH_SCORE = 40;
const CATEGORY_MATCH_SCORE = 30;
const BODY_MATCH_SCORE = 10;

export function normalizeDocsSearchTerms(query: string): readonly string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);
}

export function stripDocsMarkdownForSearch(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitDocsSearchHighlight(
  text: string,
  query: string,
): readonly DocsSearchHighlightPart[] {
  const terms = normalizeDocsSearchTerms(query);
  if (terms.length === 0 || text.length === 0) {
    return [{ text, highlighted: false }];
  }

  const ranges: Array<{ start: number; end: number }> = [];
  const lowerText = text.toLowerCase();

  for (const term of terms) {
    let startIndex = 0;

    while (startIndex < lowerText.length) {
      const matchIndex = lowerText.indexOf(term, startIndex);
      if (matchIndex === -1) {
        break;
      }

      ranges.push({ start: matchIndex, end: matchIndex + term.length });
      startIndex = matchIndex + term.length;
    }
  }

  if (ranges.length === 0) {
    return [{ text, highlighted: false }];
  }

  ranges.sort((left, right) => left.start - right.start);

  const mergedRanges: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    const previous = mergedRanges[mergedRanges.length - 1];
    if (previous == null || range.start > previous.end) {
      mergedRanges.push({ ...range });
      continue;
    }

    previous.end = Math.max(previous.end, range.end);
  }

  const parts: DocsSearchHighlightPart[] = [];
  let cursor = 0;

  for (const range of mergedRanges) {
    if (cursor < range.start) {
      parts.push({ text: text.slice(cursor, range.start), highlighted: false });
    }

    parts.push({ text: text.slice(range.start, range.end), highlighted: true });
    cursor = range.end;
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), highlighted: false });
  }

  return parts;
}

function includesAllTerms(haystack: string, terms: readonly string[]): boolean {
  return terms.every((term) => haystack.includes(term));
}

function scoreArticleMatch(
  article: DocsArticle,
  terms: readonly string[],
  categoryTitle: string,
): number {
  const title = article.title.toLowerCase();
  const summary = (article.summary ?? '').toLowerCase();
  const categoryHaystack = `${categoryTitle} ${article.category}`.toLowerCase();
  const tags = article.tags.join(' ').toLowerCase();
  const body = stripDocsMarkdownForSearch(article.content).toLowerCase();

  let score = 0;

  for (const term of terms) {
    if (title.includes(term)) {
      score += TITLE_MATCH_SCORE;
    }

    if (summary.includes(term)) {
      score += SUMMARY_MATCH_SCORE;
    }

    if (tags.includes(term)) {
      score += TAG_MATCH_SCORE;
    }

    if (categoryHaystack.includes(term)) {
      score += CATEGORY_MATCH_SCORE;
    }

    if (body.includes(term)) {
      score += BODY_MATCH_SCORE;
    }
  }

  return score;
}

function truncateAroundMatch(text: string, terms: readonly string[], maxLength: number): string {
  const lowerText = text.toLowerCase();
  let matchIndex = -1;
  let matchLength = 0;

  for (const term of terms) {
    const index = lowerText.indexOf(term);
    if (index !== -1 && (matchIndex === -1 || index < matchIndex)) {
      matchIndex = index;
      matchLength = term.length;
    }
  }

  if (matchIndex === -1) {
    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength - 1).trimEnd()}…`;
  }

  const padding = Math.floor((maxLength - matchLength) / 2);
  let start = Math.max(0, matchIndex - padding);
  let end = Math.min(text.length, start + maxLength);

  if (end - start < maxLength) {
    start = Math.max(0, end - maxLength);
  }

  let excerpt = text.slice(start, end).trim();
  if (start > 0) {
    excerpt = `…${excerpt}`;
  }

  if (end < text.length) {
    excerpt = `${excerpt}…`;
  }

  return excerpt;
}

function buildSearchExcerpt(
  article: DocsArticle,
  terms: readonly string[],
  categoryTitle: string,
): string {
  const summary = article.summary?.trim();
  if (summary != null && summary !== '' && includesAllTerms(summary.toLowerCase(), terms)) {
    return truncateAroundMatch(summary, terms, 180);
  }

  const body = stripDocsMarkdownForSearch(article.content);
  if (body !== '' && includesAllTerms(body.toLowerCase(), terms)) {
    return truncateAroundMatch(body, terms, 180);
  }

  if (summary != null && summary !== '') {
    return summary.length <= 180 ? summary : `${summary.slice(0, 179).trimEnd()}…`;
  }

  return body.length <= 180 ? body : `${body.slice(0, 179).trimEnd()}…`;
}

function buildArticleHaystack(
  article: DocsArticle,
  categoryTitle: string,
  productName: string,
): string {
  const body = stripDocsMarkdownForSearch(article.content);

  return [
    article.title,
    article.summary ?? '',
    productName,
    categoryTitle,
    article.category,
    article.tags.join(' '),
    body,
  ]
    .join(' ')
    .toLowerCase();
}

export function searchPublicDocsArticles(
  articles: readonly DocsArticle[],
  options: DocsPublicSearchOptions,
): readonly DocsPublicSearchResult[] {
  const terms = normalizeDocsSearchTerms(options.query);
  if (terms.length === 0) {
    return [];
  }

  const results: DocsPublicSearchResult[] = [];

  for (const article of articles) {
    if (!isPublicDocsCategoryListingArticle(article)) {
      continue;
    }

    if (options.product != null && article.product !== options.product) {
      continue;
    }

    if (options.category != null && article.category !== options.category) {
      continue;
    }

    const categoryTitle =
      options.resolveCategoryTitle(article.product, article.category) ?? article.category;
    const productName = options.resolveProductName(article.product) ?? article.product;
    const haystack = buildArticleHaystack(article, categoryTitle, productName);

    if (!includesAllTerms(haystack, terms)) {
      continue;
    }

    results.push({
      article,
      excerpt: buildSearchExcerpt(article, terms, categoryTitle),
      productName,
      categoryTitle,
      score: scoreArticleMatch(article, terms, categoryTitle),
    });
  }

  return results.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.article.title.localeCompare(right.article.title);
  });
}
