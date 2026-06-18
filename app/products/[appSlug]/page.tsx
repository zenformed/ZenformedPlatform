import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  fetchProductCatalogSlugs,
  fetchProductPricingPageConfig,
} from '@/platform/products/productPricingCatalog';
import { ProductPricingPageView } from '@/presentation/components/Products/ProductPricingPageView';
import { ProductsPublicShell } from '@/presentation/components/Products/ProductsPublicShell';

export const dynamic = 'force-dynamic';

type ProductPricingRouteProps = {
  readonly params: { appSlug: string };
};

export async function generateStaticParams(): Promise<{ appSlug: string }[]> {
  const slugs = await fetchProductCatalogSlugs();
  return slugs.map((appSlug) => ({ appSlug }));
}

export async function generateMetadata({ params }: ProductPricingRouteProps): Promise<Metadata> {
  const config = await fetchProductPricingPageConfig(params.appSlug);
  if (config == null) {
    return { title: 'Product not found — Zenformed' };
  }
  return {
    title: `${config.productName} Plans — Zenformed`,
    description: config.intro,
  };
}

export default async function ProductPricingPage({
  params,
}: ProductPricingRouteProps): Promise<ReactElement> {
  const config = await fetchProductPricingPageConfig(params.appSlug);
  if (config == null) {
    notFound();
  }

  return (
    <ProductsPublicShell backHref="/products" backLabel="All products">
      <ProductPricingPageView config={config} />
    </ProductsPublicShell>
  );
}
