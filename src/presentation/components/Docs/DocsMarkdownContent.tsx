'use client';

import { useCallback, useMemo, useState, type ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { normalizeDocsImageCaptionsInMarkdown } from '@/platform/docs/docsImageCaptionMarkdown';
import { DocsImageLightbox } from '@/presentation/components/Docs/DocsImageLightbox';
import styles from '../../../../app/docs/docs.module.css';

export type DocsMarkdownContentProps = {
  readonly content: string;
};

type PreviewImage = {
  readonly src: string;
  readonly alt: string;
};

export function DocsMarkdownContent({ content }: DocsMarkdownContentProps): ReactElement {
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const normalizedContent = normalizeDocsImageCaptionsInMarkdown(content);

  const closePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  const components = useMemo<Components>(
    () => ({
      img: ({ src, alt, title, width, height }) => {
        if (typeof src !== 'string' || src.trim() === '') {
          return null;
        }

        const label = alt != null && alt.trim() !== '' ? alt : 'Documentation image';

        return (
          <button
            type="button"
            className={styles.docsMarkdownImageTrigger}
            onClick={() => setPreviewImage({ src, alt: label })}
            aria-label={`View full size: ${label}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt ?? ''} title={title} width={width} height={height} />
          </button>
        );
      },
    }),
    [],
  );

  return (
    <>
      <div className={styles.docsMarkdown}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {normalizedContent}
        </ReactMarkdown>
      </div>
      {previewImage != null ? (
        <DocsImageLightbox src={previewImage.src} alt={previewImage.alt} onClose={closePreview} />
      ) : null}
    </>
  );
}
