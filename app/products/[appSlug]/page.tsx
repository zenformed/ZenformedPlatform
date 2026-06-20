import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  fetchProductCatalogSlugs,
  fetchProductPricingPageConfig,
} from '@/platform/products/productPricingCatalog';
import { BuildCoreSalesPageView } from '@/presentation/components/Products/BuildCoreSalesPageView';
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
    title:
      params.appSlug === 'buildcore'
        ? 'BuildCore — Construction CRM — Zenformed'
        : `${config.productName} Plans — Zenformed`,
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

  const isBuildCore = params.appSlug === 'buildcore';

  return (
    <ProductsPublicShell backHref="/products" backLabel="All products">
      {isBuildCore ? (
        <BuildCoreSalesPageView config={config} />
      ) : (
        <ProductPricingPageView config={config} />
      )}
    </ProductsPublicShell>
  );
}
