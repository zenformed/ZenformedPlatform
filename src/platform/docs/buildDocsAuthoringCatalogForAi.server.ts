import 'server-only';

import { getDocsAdminArticles } from '@/platform/docs/docsAdminCatalog.server';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import type { DocsAuthoringAiCatalogArticle } from '@/platform/docs/docsAuthoringAiTypes';

export type DocsAuthoringCatalogContext = {
  readonly product: string;
  readonly category: string;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(value: string): readonly string[] {
  const normalized = normalizeText(value);
  if (normalized === '') {
    return [];
  }
  return normalized.split(/\s+/).filter((token) => token.length > 1);
}

function isCurrentArticle(article: DocsAdminArticle, context: DocsAuthoringCatalogContext): boolean {
  return (
    article.product === context.product &&
    article.category === context.category &&
    normalizeText(article.title) === normalizeText(context.title)
  );
}

function scoreCatalogArticle(article: DocsAdminArticle, context: DocsAuthoringCatalogContext): number {
  let score = 0;

  if (article.product === context.product) {
    score += 4;
  }

  if (article.category === context.category) {
    score += 8;
  }

  const haystack = normalizeText([context.title, context.summary, ...context.tags].join(' '));
  const titleNormalized = normalizeText(article.title);
  if (haystack.includes(titleNormalized)) {
    score += 6;
  }

  for (const tag of article.tags) {
    if (context.tags.some((contextTag) => normalizeText(contextTag) === normalizeText(tag))) {
      score += 3;
    }
  }

  for (const token of tokenize(context.title)) {
    if (titleNormalized.includes(token)) {
      score += 2;
    }
    if (normalizeText(article.summary).includes(token)) {
      score += 1;
    }
  }

  return score;
}

function toCatalogArticle(article: DocsAdminArticle): DocsAuthoringAiCatalogArticle {
  return {
    title: article.title,
    slug: article.slug,
    product: article.product,
    category: article.category,
  };
}

export function buildDocsAuthoringCatalogForAi(context: DocsAuthoringCatalogContext): readonly DocsAuthoringAiCatalogArticle[] {
  return getDocsAdminArticles()
    .filter((article) => article.product === context.product)
    .filter((article) => !isCurrentArticle(article, context))
    .map((article) => ({ article, score: scoreCatalogArticle(article, context) }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.article.title.localeCompare(right.article.title);
    })
    .map(({ article }) => toCatalogArticle(article));
}
