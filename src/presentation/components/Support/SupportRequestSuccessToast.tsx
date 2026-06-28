'use client';

import { useEffect, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import styles from './SupportRequestModal.module.css';

export type SupportRequestSuccessToastProps = {
  readonly message: string | null;
  readonly onDismiss: () => void;
};

export function SupportRequestSuccessToast({
  message,
  onDismiss,
}: SupportRequestSuccessToastProps): ReactElement {
  useEffect(() => {
    if (message == null) {
      return;
    }

    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [message, onDismiss]);

  if (message == null) {
    return <></>;
  }

  const content = (
    <div className={styles.supportRequestSuccessToast} role="alert" aria-live="assertive">
      <div className={styles.supportRequestSuccessToastInner}>
        <p>{message}</p>
        <button type="button" className={styles.supportRequestSuccessDismiss} onClick={onDismiss}>
          OK
        </button>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return <></>;
  }

  return createPortal(content, document.body);
}
