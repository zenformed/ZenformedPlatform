'use client';

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useCallback, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactElement } from 'react';
import { platformDocsRichTextEditorContent as content } from '@/platform/content/platformDocsRichTextEditorContent';
import styles from './docsRichTextEditor.module.css';

const MIN_IMAGE_WIDTH = 120;
const MAX_IMAGE_WIDTH = 900;

export function DocsRichTextImageView({ node, updateAttributes, selected }: NodeViewProps): ReactElement {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const src = String(node.attrs.src ?? '');
  const alt = String(node.attrs.alt ?? '');
  const caption = String(node.attrs.caption ?? '');
  const width = typeof node.attrs.width === 'number' ? node.attrs.width : null;

  const handleResizeStart = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const imageElement = imageRef.current;
      if (imageElement == null) {
        return;
      }

      const startX = event.clientX;
      const startWidth = imageElement.getBoundingClientRect().width;
      setIsResizing(true);

      const handleMove = (moveEvent: MouseEvent): void => {
        const nextWidth = Math.min(
          MAX_IMAGE_WIDTH,
          Math.max(MIN_IMAGE_WIDTH, Math.round(startWidth + (moveEvent.clientX - startX))),
        );
        updateAttributes({ width: nextWidth });
      };

      const handleUp = (): void => {
        setIsResizing(false);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [updateAttributes],
  );

  return (
    <NodeViewWrapper
      className={`${styles.docsRichTextImageWrap} ${
        selected ? styles.docsRichTextImageSelected : ''
      } ${isResizing ? styles.docsRichTextImageResizing : ''}`}
      data-drag-handle
    >
      {caption.trim() !== '' ? (
        <p className={styles.docsRichTextImageCaption}>{caption}</p>
      ) : null}
      <div className={styles.docsRichTextImageFrame}>
        {src !== '' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className={styles.docsRichTextImage}
            style={width != null ? { width: `${width}px` } : undefined}
            draggable={false}
          />
        ) : null}
        <button
          type="button"
          className={styles.docsRichTextImageResizeHandle}
          aria-label={content.image.resizeHint}
          onMouseDown={handleResizeStart}
        />
      </div>

      <div className={styles.docsRichTextImageControls}>
        <label className={styles.docsRichTextImageField}>
          <span>{content.image.captionLabel}</span>
          <input
            value={caption}
            onChange={(event) => updateAttributes({ caption: event.target.value })}
          />
        </label>
        <label className={styles.docsRichTextImageField}>
          <span>{content.image.altLabel}</span>
          <input
            value={alt}
            onChange={(event) => updateAttributes({ alt: event.target.value })}
          />
        </label>
      </div>
    </NodeViewWrapper>
  );
}
