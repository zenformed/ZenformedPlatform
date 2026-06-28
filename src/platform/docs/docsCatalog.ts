import type { DocsProduct, DocsProductSlug, DocsCategorySlug, DocsCategory } from '@/platform/docs/docsTypes';

export const BUILDCORE_DOCS_PRODUCT: DocsProduct = {
  slug: 'buildcore',
  name: 'BuildCore',
  icon: { type: 'app', appId: 'buildcore' },
  pageTitle: 'BuildCore',
  pageTitleAccent: 'Documentation',
  subtitle: 'Everything you need to learn, configure, and master BuildCore.',
  categories: [
    {
      slug: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics and set up your BuildCore workspace.',
    },
    {
      slug: 'projects',
      title: 'Projects',
      description: 'Manage construction projects from start to finish.',
    },
    {
      slug: 'customers',
      title: 'Customers',
      description: 'Track leads, contacts, and customer relationships.',
    },
    {
      slug: 'workflow',
      title: 'Workflow',
      description: 'Configure stages, tasks, and team workflows.',
    },
    {
      slug: 'budget',
      title: 'Budget',
      description: 'Plan and track project budgets and estimates.',
    },
    {
      slug: 'payments',
      title: 'Payments',
      description: 'Handle invoices, draws, and payment schedules.',
    },
    {
      slug: 'documents',
      title: 'Documents',
      description: 'Store, organize, and share project documents.',
    },
    {
      slug: 'reports',
      title: 'Reports',
      description: 'Generate insights and export project reports.',
    },
    {
      slug: 'settings',
      title: 'Settings',
      description: 'Configure BuildCore preferences and integrations.',
    },
    {
      slug: 'permissions',
      title: 'Permissions',
      description: 'Manage roles, access, and team permissions.',
    },
    {
      slug: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Resolve common issues and find solutions.',
    },
    {
      slug: 'release-notes',
      title: 'Release Notes',
      description: "See what's new in each BuildCore release.",
    },
  ],
};

const DOCS_PRODUCTS: Record<DocsProductSlug, DocsProduct> = {
  buildcore: BUILDCORE_DOCS_PRODUCT,
};

export function getDocsProduct(slug: DocsProductSlug): DocsProduct {
  return DOCS_PRODUCTS[slug];
}

export function getDocsCategory(
  productSlug: DocsProductSlug,
  categorySlug: string,
): DocsCategory | undefined {
  const product = DOCS_PRODUCTS[productSlug];
  if (product == null) {
    return undefined;
  }

  return product.categories.find((category) => category.slug === categorySlug);
}

export function isDocsCategorySlug(
  productSlug: DocsProductSlug,
  categorySlug: string,
): categorySlug is DocsCategorySlug {
  return getDocsCategory(productSlug, categorySlug) != null;
}

export function getDocsProductCategorySlugs(productSlug: DocsProductSlug): readonly DocsCategorySlug[] {
  return getDocsProduct(productSlug).categories.map((category) => category.slug);
}
