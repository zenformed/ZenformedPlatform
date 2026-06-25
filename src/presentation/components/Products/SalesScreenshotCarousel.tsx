'use client';

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { SalesScreenshotLightbox } from '@/presentation/components/Products/SalesScreenshotLightbox';
import styles from '../../../../app/products/products.module.css';

export type SalesScreenshotSlide = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
};

export type SalesScreenshotCarouselProps = {
  readonly slides: readonly SalesScreenshotSlide[];
  readonly ariaLabel: string;
};

function hasImage(slide: SalesScreenshotSlide): boolean {
  return slide.imageSrc != null && slide.imageSrc.trim() !== '';
}

function normalizeIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return ((index % length) + length) % length;
}

export function SalesScreenshotCarousel({
  slides,
  ariaLabel,
}: SalesScreenshotCarouselProps): ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);

  const goTo = useCallback(
    (index: number) => {
      const nextIndex = normalizeIndex(index, slides.length);
      setActiveIndex(nextIndex);
      slideRefs.current[nextIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    },
    [slides.length],
  );

  const openPreview = useCallback((index: number) => {
    if (!hasImage(slides[index] ?? { id: '', title: '', description: '' })) return;
    setPreviewIndex(index);
  }, [slides]);

  const closePreview = useCallback(() => {
    setPreviewIndex(null);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport == null || slides.length === 0) return;

    const handleScroll = (): void => {
      const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      slideRefs.current.forEach((slide, index) => {
        if (slide == null) return;
        const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
        const distance = Math.abs(slideCenter - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [slides.length]);

  if (slides.length === 0) {
    return <></>;
  }

  const previewSlide = previewIndex != null ? slides[previewIndex] : null;

  return (
    <div className={styles.salesCarousel} aria-label={ariaLabel}>
      <div className={styles.salesCarouselFrame}>
        <button
          type="button"
          className={`${styles.salesCarouselNav} ${styles.salesCarouselNavPrev}`}
          aria-label="Previous screenshot"
          onClick={() => goTo(activeIndex - 1)}
        >
          ‹
        </button>

        <div ref={viewportRef} className={styles.salesCarouselViewport} role="region">
          <div className={styles.salesCarouselTrack}>
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <article
                  key={slide.id}
                  ref={(node) => {
                    slideRefs.current[index] = node;
                  }}
                  className={`${styles.salesCarouselSlide} ${isActive ? styles.salesCarouselSlideActive : ''}`}
                >
                  {hasImage(slide) ? (
                    <button
                      type="button"
                      className={styles.salesCarouselImageButton}
                      aria-label={`Preview ${slide.title} screenshot`}
                      onClick={() => openPreview(index)}
                    >
                      <span className={styles.salesCarouselImageWrap}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.imageSrc}
                          alt={slide.imageAlt ?? slide.title}
                          className={styles.salesCarouselImage}
                          loading="lazy"
                        />
                      </span>
                    </button>
                  ) : null}
                  <h3 className={styles.salesCarouselSlideTitle}>{slide.title}</h3>
                  <p className={styles.salesCarouselSlideDescription}>{slide.description}</p>
                </article>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.salesCarouselNav} ${styles.salesCarouselNavNext}`}
          aria-label="Next screenshot"
          onClick={() => goTo(activeIndex + 1)}
        >
          ›
        </button>
      </div>

      {previewSlide != null && hasImage(previewSlide) ? (
        <SalesScreenshotLightbox
          slide={{
            title: previewSlide.title,
            imageSrc: previewSlide.imageSrc!,
            imageAlt: previewSlide.imageAlt,
          }}
          onClose={closePreview}
        />
      ) : null}
    </div>
  );
}
