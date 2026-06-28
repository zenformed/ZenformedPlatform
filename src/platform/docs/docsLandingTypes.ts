import type { DocsProductSlug } from '@/platform/docs/docsTypes';

export type DocsPopularLandingArticle = {
  readonly id: string;
  readonly title: string;
  readonly href: string;
};

export type DocsRecentLandingUpdate = {
  readonly id: string;
  readonly productSlug: DocsProductSlug;
  readonly productLabel: string;
  readonly title: string;
  readonly href: string;
  readonly updatedAt: string;
  readonly accentColor: string;
};
