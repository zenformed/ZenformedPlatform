'use client';

import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from 'react';
import { platformDocsAdminContent as content } from '@/platform/content/platformDocsAdminContent';
import { getDocsAdminCategoryOptions, getDocsAdminProductOptions } from '@/platform/docs/docsAdminCatalogData';
import { docsMarkdownRelativePath } from '@/platform/docs/docsAdminArticleKey';
import { generateDocsSlug } from '@/platform/docs/docsSlug';
import { storePendingDocsAuthorContext } from '@/platform/docs/docsAuthorContextStorage';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { useAdminAccessToken } from '@/presentation/components/Admin/PlatformAdminGate';
import adminStyles from '../admin.module.css';
import docsAdminStyles from './docsAdmin.module.css';

export type DocsAdminNewArticleWizardProps = {
  readonly isOpen: boolean;
  readonly defaultProduct: DocsProductSlug;
  readonly defaultCategory: DocsCategorySlug;
  readonly initialTitle?: string;
  readonly initialSlug?: string;
  readonly onClose: () => void;
  readonly onCreated: (editorId: string) => void;
};

export function DocsAdminNewArticleWizard({
  isOpen,
  defaultProduct,
  defaultCategory,
  initialTitle,
  initialSlug,
  onClose,
  onCreated,
}: DocsAdminNewArticleWizardProps): ReactElement | null {
  const getAccessToken = useAdminAccessToken();
  const [product, setProduct] = useState<DocsProductSlug>(defaultProduct);
  const [category, setCategory] = useState<DocsCategorySlug>(defaultCategory);
  const [title, setTitle] = useState('');
  const [authorContext, setAuthorContext] = useState('');
  const [plannedSlug, setPlannedSlug] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setProduct(defaultProduct);
    setCategory(defaultCategory);
    setTitle(initialTitle ?? '');
    setAuthorContext('');
    setPlannedSlug(initialSlug);
    setErrorMessage(null);
    setIsSubmitting(false);
  }, [defaultCategory, defaultProduct, initialSlug, initialTitle, isOpen]);

  const productOptions = getDocsAdminProductOptions();
  const categoryOptions = getDocsAdminCategoryOptions(product);
  const slug = useMemo(() => {
    if (plannedSlug != null && plannedSlug.trim() !== '' && title.trim() === (initialTitle ?? '').trim()) {
      return plannedSlug;
    }

    return generateDocsSlug(title);
  }, [initialTitle, plannedSlug, title]);
  const contentPath =
    slug === ''
      ? '—'
      : docsMarkdownRelativePath(product, category, slug);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (trimmedTitle === '') {
      return;
    }

    const token = getAccessToken();
    if (token == null) {
      setErrorMessage(content.console.wizard.error);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/admin/docs/articles', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: trimmedTitle,
          product,
          category,
          ...(slug !== '' ? { slug } : {}),
          ...(authorContext.trim() !== '' ? { authorContext: authorContext.trim() } : {}),
        }),
      });

      if (!response.ok) {
        setErrorMessage(content.console.wizard.error);
        return;
      }

      const json = (await response.json()) as { editorId?: string };
      if (json.editorId == null || json.editorId.trim() === '') {
        setErrorMessage(content.console.wizard.error);
        return;
      }

      onCreated(json.editorId);
      storePendingDocsAuthorContext(json.editorId, authorContext);
      onClose();
    } catch {
      setErrorMessage(content.console.wizard.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={docsAdminStyles.docsAdminModalOverlay} role="presentation" onClick={onClose}>
      <div
        className={docsAdminStyles.docsAdminModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="docs-admin-new-article-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="docs-admin-new-article-title" className={docsAdminStyles.docsAdminModalTitle}>
          {content.console.wizard.title}
        </h3>

        <form className={docsAdminStyles.docsAdminModalForm} onSubmit={handleSubmit}>
          <div className={docsAdminStyles.docsAdminField}>
            <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-wizard-product">
              {content.console.wizard.productLabel}
            </label>
            <select
              id="docs-admin-wizard-product"
              className={docsAdminStyles.docsAdminSelect}
              value={product}
              onChange={(event) => {
                const nextProduct = event.target.value as DocsProductSlug;
                setProduct(nextProduct);
                const firstCategory = getDocsAdminCategoryOptions(nextProduct)[0]?.slug;
                if (firstCategory != null) {
                  setCategory(firstCategory);
                }
              }}
            >
              {productOptions.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div className={docsAdminStyles.docsAdminField}>
            <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-wizard-category">
              {content.console.wizard.categoryLabel}
            </label>
            <select
              id="docs-admin-wizard-category"
              className={docsAdminStyles.docsAdminSelect}
              value={category}
              onChange={(event) => setCategory(event.target.value as DocsCategorySlug)}
            >
              {categoryOptions.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>

          <div className={docsAdminStyles.docsAdminField}>
            <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-wizard-title">
              {content.console.wizard.titleLabel}
            </label>
            <input
              id="docs-admin-wizard-title"
              className={docsAdminStyles.docsAdminInput}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
              required
            />
          </div>

          <div className={docsAdminStyles.docsAdminField}>
            <label className={docsAdminStyles.docsAdminFieldLabel} htmlFor="docs-admin-wizard-author-context">
              {content.console.wizard.authorContextLabel}
            </label>
            <p className={docsAdminStyles.docsAdminFieldHint}>{content.console.wizard.authorContextHelper}</p>
            <textarea
              id="docs-admin-wizard-author-context"
              className={docsAdminStyles.docsAdminTextarea}
              value={authorContext}
              placeholder={content.console.wizard.authorContextPlaceholder}
              rows={5}
              onChange={(event) => setAuthorContext(event.target.value)}
            />
          </div>

          <div className={docsAdminStyles.docsAdminWizardPreview}>
            <div>
              <span className={docsAdminStyles.docsAdminFieldLabel}>{content.console.wizard.slugLabel}</span>
              <p className={docsAdminStyles.docsAdminWizardPreviewValue}>{slug === '' ? '—' : slug}</p>
            </div>
            <div>
              <span className={docsAdminStyles.docsAdminFieldLabel}>{content.console.wizard.pathLabel}</span>
              <p className={docsAdminStyles.docsAdminWizardPreviewValue}>{contentPath}</p>
            </div>
          </div>

          {errorMessage != null ? (
            <p className={docsAdminStyles.docsAdminErrorText} role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className={docsAdminStyles.docsAdminModalActions}>
            <button type="button" className={adminStyles.adminButton} onClick={onClose} disabled={isSubmitting}>
              {content.console.wizard.cancel}
            </button>
            <button type="submit" className={docsAdminStyles.docsAdminPrimaryButton} disabled={isSubmitting}>
              {isSubmitting ? content.console.wizard.creating : content.console.wizard.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
