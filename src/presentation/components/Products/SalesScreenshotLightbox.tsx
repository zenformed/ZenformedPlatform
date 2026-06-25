'use client';

import { useEffect, useRef, type ReactElement } from 'react';
import styles from '../../../../app/products/products.module.css';

export type SalesScreenshotLightboxSlide = {
  readonly title: string;
  readonly imageSrc: string;
  readonly imageAlt?: string;
};

export type SalesScreenshotLightboxProps = {
  readonly slide: SalesScreenshotLightboxSlide;
  readonly onClose: () => void;
};

export function SalesScreenshotLightbox({
  slide,
  onClose,
}: SalesScreenshotLightboxProps): ReactElement {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className={styles.salesCarouselLightbox}
      role="dialog"
      aria-modal="true"
      aria-label={`${slide.title} screenshot preview`}
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className={styles.salesCarouselLightboxClose}
        aria-label="Close preview"
        onClick={onClose}
      >
        ×
      </button>
      <div className={styles.salesCarouselLightboxContent} onClick={(event) => event.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.imageSrc}
          alt={slide.imageAlt ?? slide.title}
          className={styles.salesCarouselLightboxImage}
        />
        <p className={styles.salesCarouselLightboxCaption}>{slide.title}</p>
      </div>
    </div>
  );
}
