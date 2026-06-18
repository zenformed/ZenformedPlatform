'use client';

import { useEffect, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import styles from '../../../../app/products/products.module.css';

export type ProductNoticeToastProps = {
  readonly message: string | null;
  readonly onDismiss: () => void;
};

export function ProductNoticeToast({ message, onDismiss }: ProductNoticeToastProps): ReactElement {
  useEffect(() => {
    if (message == null) return;
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [message, onDismiss]);

  if (message == null) return <></>;

  const content = (
    <div className={styles.productNoticeToast} role="alert" aria-live="assertive">
      <div className={styles.productNoticeToastInner}>
        <p className={styles.productNoticeToastMessage}>{message}</p>
        <button type="button" className={styles.productNoticeToastDismiss} onClick={onDismiss}>
          OK
        </button>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return <></>;
  return createPortal(content, document.body);
}
