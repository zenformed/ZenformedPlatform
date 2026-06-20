'use client';

import type { ReactElement } from 'react';
import type { ProductPricingPageConfig } from '@/platform/products/productPricingCatalog';
import { ProductPricingSection } from '@/presentation/components/Products/ProductPricingSection';

export type ProductPricingPageViewProps = {
  readonly config: ProductPricingPageConfig;
};

export function ProductPricingPageView({ config }: ProductPricingPageViewProps): ReactElement {
  return <ProductPricingSection config={config} variant="standalone" />;
}
