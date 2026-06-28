import type { ReactElement, ReactNode } from 'react';
import { ProductsPublicShell } from '@/presentation/components/Products/ProductsPublicShell';
import shellStyles from '../../../../app/products/products.module.css';

export type DocsShellProps = {
  readonly children: ReactNode;
};

export function DocsShell({ children }: DocsShellProps): ReactElement {
  return (
    <ProductsPublicShell
      mainClassName={shellStyles.mainWide}
      headerInnerClassName={shellStyles.headerInnerWide}
    >
      {children}
    </ProductsPublicShell>
  );
}
