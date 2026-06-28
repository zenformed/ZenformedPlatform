import type { PlatformAppId } from '@/platform/appDefinitions/platformApps';

export type DocsProductIconRef =
  | { readonly type: 'platform' }
  | { readonly type: 'app'; readonly appId: PlatformAppId };

export type DocsProductSlug = 'buildcore';

export type BuildCoreCategorySlug =
  | 'getting-started'
  | 'projects'
  | 'customers'
  | 'workflow'
  | 'budget'
  | 'payments'
  | 'documents'
  | 'reports'
  | 'settings'
  | 'permissions'
  | 'troubleshooting'
  | 'release-notes';

export type DocsCategorySlug = BuildCoreCategorySlug;

export type DocsCategory = {
  readonly slug: DocsCategorySlug;
  readonly title: string;
  readonly description: string;
};

export type DocsProduct = {
  readonly slug: DocsProductSlug;
  readonly name: string;
  readonly icon: DocsProductIconRef;
  readonly pageTitle: string;
  readonly pageTitleAccent: string;
  readonly subtitle: string;
  readonly categories: readonly DocsCategory[];
};

export function docsHubPath(): string {
  return '/docs';
}

export function docsProductPath(productSlug: DocsProductSlug): string {
  return `/docs/${productSlug}`;
}

export function docsCategoryPath(
  productSlug: DocsProductSlug,
  categorySlug: DocsCategorySlug,
): string {
  return `/docs/${productSlug}/${categorySlug}`;
}

export function docsArticlePath(
  productSlug: DocsProductSlug,
  categorySlug: DocsCategorySlug,
  articleSlug: string,
): string {
  return `/docs/${productSlug}/${categorySlug}/${articleSlug}`;
}
