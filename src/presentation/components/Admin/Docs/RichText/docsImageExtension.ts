import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { MarkdownNodeSpec } from 'tiptap-markdown';
import { formatDocsImageMarkdownBlock } from '@/platform/docs/docsImageCaptionMarkdown';
import { DocsRichTextImageView } from '@/presentation/components/Admin/Docs/RichText/DocsRichTextImageView';

export const DocsImageExtension = Node.create({
  name: 'docsImage',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
      caption: { default: '' },
      width: { default: null as number | null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-docs-image]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          return {
            src: element.getAttribute('data-src') ?? '',
            alt: element.getAttribute('data-alt') ?? '',
            caption: element.getAttribute('data-caption') ?? '',
            width: null,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes, { 'data-docs-image': 'true' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DocsRichTextImageView);
  },

  addStorage() {
    return {
      markdown: {
        serialize: ((state, node) => {
          const alt = String(node.attrs.alt ?? '');
          const src = String(node.attrs.src ?? '');
          if (src.trim() === '') {
            return;
          }

          state.write(
            formatDocsImageMarkdownBlock({
              alt,
              src,
              caption: String(node.attrs.caption ?? ''),
            }),
          );
        }) satisfies MarkdownNodeSpec['serialize'],
      },
    };
  },

  addCommands() {
    return {
      insertDocsImage:
        (attrs: { src: string; alt?: string; caption?: string }) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              src: attrs.src,
              alt: attrs.alt ?? '',
              caption: attrs.caption ?? '',
              width: null,
            },
          }),
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    docsImage: {
      insertDocsImage: (attrs: { src: string; alt?: string; caption?: string }) => ReturnType;
    };
  }
}
