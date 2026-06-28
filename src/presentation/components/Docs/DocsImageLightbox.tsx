'use client';

import { useEffect, type ReactElement } from 'react';
import styles from '../../../../app/docs/docs.module.css';

export type DocsImageLightboxProps = {
  readonly src: string;
  readonly alt: string;
  readonly onClose: () => void;
};

export function DocsImageLightbox({ src, alt, onClose }: DocsImageLightboxProps): ReactElement {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className={styles.docsImageLightboxOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        className={styles.docsImageLightboxClose}
        onClick={onClose}
        aria-label="Close preview"
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={styles.docsImageLightboxImage}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}
