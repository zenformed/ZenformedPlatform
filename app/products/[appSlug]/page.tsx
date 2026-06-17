import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  getProductPricingPageConfig,
  PRODUCT_PRICING_APP_SLUGS,
} from '@/platform/products/productPricingCatalog';
import { ProductPricingPageView } from '@/presentation/components/Products/ProductPricingPageView';
import { ProductsPublicShell } from '@/presentation/components/Products/ProductsPublicShell';

type ProductPricingRouteProps = {
  readonly params: { appSlug: string };
};

export function generateStaticParams(): { appSlug: string }[] {
  return PRODUCT_PRICING_APP_SLUGS.map((appSlug) => ({ appSlug }));
}

export function generateMetadata({ params }: ProductPricingRouteProps): Metadata {
  const config = getProductPricingPageConfig(params.appSlug);
  if (config == null) {
    return { title: 'Product not found — Zenformed' };
  }
  return {
    title: `${config.productName} Plans — Zenformed`,
    description: config.intro,
  };
}

export default function ProductPricingPage({ params }: ProductPricingRouteProps): ReactElement {
  const config = getProductPricingPageConfig(params.appSlug);
  if (config == null) {
    notFound();
  }

  return (
    <ProductsPublicShell backHref="/products" backLabel="All products">
      <ProductPricingPageView config={config} />
    </ProductsPublicShell>
  );
}
