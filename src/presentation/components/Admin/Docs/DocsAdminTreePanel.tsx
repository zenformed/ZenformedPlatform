'use client';

import type { ReactElement } from 'react';
import { platformDocsAdminContent as content } from '@/platform/content/platformDocsAdminContent';
import {
  getDocsAdminCategoryOptions,
  getDocsAdminProductOptions,
} from '@/platform/docs/docsAdminCatalogData';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import docsAdminStyles from './docsAdmin.module.css';

export type DocsAdminTreePanelProps = {
  readonly productSlug: DocsProductSlug;
  readonly categorySlug: DocsCategorySlug;
  readonly categoryArticles: readonly DocsAdminArticle[];
  readonly selectedEditorId: string | null;
  readonly onProductSelect: (slug: DocsProductSlug) => void;
  readonly onCategorySelect: (slug: DocsCategorySlug) => void;
  readonly onArticleSelect: (article: DocsAdminArticle) => void;
};

export function DocsAdminTreePanel({
  productSlug,
  categorySlug,
  categoryArticles,
  selectedEditorId,
  onProductSelect,
  onCategorySelect,
  onArticleSelect,
}: DocsAdminTreePanelProps): ReactElement {
  const products = getDocsAdminProductOptions();
  const categories = getDocsAdminCategoryOptions(productSlug);

  return (
    <aside className={docsAdminStyles.docsAdminPanel} aria-label="Documentation tree">
      <div className={docsAdminStyles.docsAdminPanelHeader}>Navigation</div>
      <div className={docsAdminStyles.docsAdminPanelBody}>
        <div className={docsAdminStyles.docsAdminTreeSection}>
          <h3 className={docsAdminStyles.docsAdminTreeSectionTitle}>{content.console.tree.products}</h3>
          <ul className={docsAdminStyles.docsAdminTreeList}>
            {products.map((product) => (
              <li key={product.slug} className={docsAdminStyles.docsAdminTreeItem}>
                <button
                  type="button"
                  className={`${docsAdminStyles.docsAdminTreeButton} ${
                    productSlug === product.slug ? docsAdminStyles.docsAdminTreeButtonActive : ''
                  }`}
                  onClick={() => onProductSelect(product.slug)}
                >
                  {product.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={docsAdminStyles.docsAdminTreeSection}>
          <h3 className={docsAdminStyles.docsAdminTreeSectionTitle}>{content.console.tree.categories}</h3>
          <ul className={docsAdminStyles.docsAdminTreeList}>
            {categories.map((category) => (
              <li key={category.slug} className={docsAdminStyles.docsAdminTreeItem}>
                <button
                  type="button"
                  className={`${docsAdminStyles.docsAdminTreeButton} ${docsAdminStyles.docsAdminTreeButtonNested} ${
                    categorySlug === category.slug ? docsAdminStyles.docsAdminTreeButtonActive : ''
                  }`}
                  onClick={() => onCategorySelect(category.slug)}
                >
                  {category.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={docsAdminStyles.docsAdminTreeSection}>
          <h3 className={docsAdminStyles.docsAdminTreeSectionTitle}>{content.console.tree.articles}</h3>
          <ul className={docsAdminStyles.docsAdminTreeList}>
            {categoryArticles.map((article) => (
              <li key={article.editorId} className={docsAdminStyles.docsAdminTreeItem}>
                <button
                  type="button"
                  className={`${docsAdminStyles.docsAdminTreeButton} ${docsAdminStyles.docsAdminTreeButtonDeep} ${
                    selectedEditorId === article.editorId ? docsAdminStyles.docsAdminTreeButtonActive : ''
                  }`}
                  onClick={() => onArticleSelect(article)}
                >
                  {article.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
