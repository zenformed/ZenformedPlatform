'use client';

import { useEffect, type ReactElement, type ReactNode } from 'react';

export type DocsSearchKeyboardShortcutsProps = {
  readonly children: ReactNode;
};

export function DocsSearchKeyboardShortcuts({
  children,
}: DocsSearchKeyboardShortcutsProps): ReactElement {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const isEditableTarget =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      const isModK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const isSlash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey;

      if (!isModK && !isSlash) {
        return;
      }

      if (isSlash && isEditableTarget) {
        return;
      }

      const searchInput = document.querySelector<HTMLInputElement>('[data-docs-search-input]');
      if (searchInput == null) {
        return;
      }

      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return <>{children}</>;
}
