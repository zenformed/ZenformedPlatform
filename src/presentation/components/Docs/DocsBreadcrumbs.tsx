import Link from 'next/link';
import type { ReactElement } from 'react';
import { docsHubPath } from '@/platform/docs/docsTypes';
import styles from '../../../../app/docs/docs.module.css';

export type DocsBreadcrumbItem = {
  readonly label: string;
  readonly href?: string;
};

export type DocsBreadcrumbsProps = {
  readonly items: readonly DocsBreadcrumbItem[];
};

export function DocsBreadcrumbs({ items }: DocsBreadcrumbsProps): ReactElement {
  return (
    <nav className={styles.docsBreadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.docsBreadcrumbList}>
        <li className={styles.docsBreadcrumbItem}>
          <Link href={docsHubPath()} className={styles.docsBreadcrumbLink}>
            Docs
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className={styles.docsBreadcrumbItem}>
              <span className={styles.docsBreadcrumbSeparator} aria-hidden>
                /
              </span>
              {isLast || item.href == null ? (
                <span className={styles.docsBreadcrumbCurrent} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={styles.docsBreadcrumbLink}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
