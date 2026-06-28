'use client';

import type { ReactElement } from 'react';
import { platformDocsAdminContent as content } from '@/platform/content/platformDocsAdminContent';
import adminStyles from '../admin.module.css';
import docsAdminStyles from './docsAdmin.module.css';

export type DocsAdminToolbarProps = {
  readonly searchQuery: string;
  readonly onSearchQueryChange: (value: string) => void;
  readonly onNewArticle: () => void;
};

export function DocsAdminToolbar({
  searchQuery,
  onSearchQueryChange,
  onNewArticle,
}: DocsAdminToolbarProps): ReactElement {
  return (
    <div className={docsAdminStyles.docsAdminToolbar}>
      <button type="button" className={adminStyles.adminButton} onClick={onNewArticle}>
        {content.console.toolbar.newArticle}
      </button>
      <button type="button" className={adminStyles.adminButton} disabled>
        {content.console.toolbar.newCategory}
      </button>
      <button type="button" className={adminStyles.adminButton} disabled>
        {content.console.toolbar.delete}
      </button>
      <button type="button" className={adminStyles.adminButton} disabled>
        {content.console.toolbar.preview}
      </button>
      <input
        type="search"
        className={`${adminStyles.adminFilterControl} ${adminStyles.adminSearchControl} ${docsAdminStyles.docsAdminToolbarSearch}`}
        placeholder={content.console.toolbar.searchPlaceholder}
        value={searchQuery}
        onChange={(event) => onSearchQueryChange(event.target.value)}
      />
    </div>
  );
}
