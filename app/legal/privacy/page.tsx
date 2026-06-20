'use client';

import type { ReactElement } from 'react';
import { LegalPrivacyDocument } from '@zenformed/core/legal';
import { ProductsPublicShell } from '@/presentation/components/Products/ProductsPublicShell';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';

export default function LegalPrivacyPage(): ReactElement {
  return (
    <ProductsPublicShell backHref={nav.routes.products} backLabel="All products">
      <LegalPrivacyDocument />
    </ProductsPublicShell>
  );
}
