import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { MarkdownNodeSpec } from 'tiptap-markdown';
import { DocsRichTextImageView } from '@/presentation/components/Admin/Docs/RichText/DocsRichTextImageView';

export type DocsImageAlignment = 'left' | 'center' | 'right';

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
      align: { default: 'center' as DocsImageAlignment },
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
            align: (element.getAttribute('data-align') ?? 'center') as DocsImageAlignment,
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

          state.write(`![${alt}](${src})`);
          const caption = String(node.attrs.caption ?? '').trim();
          if (caption !== '') {
            state.write(`\n*${caption}*`);
          }
          state.write('\n\n');
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
              align: 'center',
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
