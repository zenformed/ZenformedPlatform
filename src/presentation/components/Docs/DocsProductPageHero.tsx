import type { ReactElement } from 'react';
import type { DocsProduct } from '@/platform/docs/docsTypes';
import { DocsPageHero } from '@/presentation/components/Docs/DocsPageHero';
import { DocsProductIcon } from '@/presentation/components/Docs/DocsProductIcon';

export type DocsProductPageHeroProps = {
  readonly product: DocsProduct;
  readonly searchPlaceholder?: string;
};

export function DocsProductPageHero({
  product,
  searchPlaceholder,
}: DocsProductPageHeroProps): ReactElement {
  return (
    <DocsPageHero
      title={product.pageTitle}
      titleAccent={product.pageTitleAccent}
      subtitle={product.subtitle}
      searchPlaceholder={searchPlaceholder ?? `Search ${product.name} documentation…`}
      titleLeading={<DocsProductIcon icon={product.icon} name={product.name} />}
      productSlug={product.slug}
    />
  );
}
