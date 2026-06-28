import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { platformDocsRichTextEditorContent as content } from '@/platform/content/platformDocsRichTextEditorContent';
import { DocsCalloutExtension } from '@/platform/docs/tiptap/docsCalloutExtension';
import { DocsImageExtension } from '@/presentation/components/Admin/Docs/RichText/docsImageExtension';

export function createDocsRichTextExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      codeBlock: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
    }),
    CodeBlock.configure({
      HTMLAttributes: {
        class: 'docs-code-block',
      },
    }),
    DocsCalloutExtension,
    DocsImageExtension,
    Placeholder.configure({
      placeholder: content.placeholder,
    }),
    Markdown.configure({
      html: true,
      tightLists: true,
      transformPastedText: true,
      transformCopiedText: true,
    }),
  ];
}
