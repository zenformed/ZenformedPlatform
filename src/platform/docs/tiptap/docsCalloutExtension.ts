import { Node, mergeAttributes } from '@tiptap/core';
import type { MarkdownNodeSpec } from 'tiptap-markdown';

export type DocsCalloutVariant = 'note' | 'tip' | 'warning';

function calloutLabel(variant: DocsCalloutVariant): string {
  if (variant === 'tip') {
    return 'Tip';
  }
  if (variant === 'warning') {
    return 'Warning';
  }
  return 'Note';
}

export const DocsCalloutExtension = Node.create({
  name: 'docsCallout',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'note' as DocsCalloutVariant,
        parseHTML: (element) => element.getAttribute('data-docs-callout') ?? 'note',
        renderHTML: (attributes) => ({
          'data-docs-callout': attributes.variant as string,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-docs-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'docs-callout' }), 0];
  },

  addStorage() {
    return {
      markdown: {
        serialize: ((state, node) => {
          const variant = (node.attrs.variant ?? 'note') as DocsCalloutVariant;
          state.write(`> **${calloutLabel(variant)}:** `);
          state.renderInline(node);
          state.ensureNewLine();
          state.write('\n');
        }) satisfies MarkdownNodeSpec['serialize'],
      },
    };
  },
});
