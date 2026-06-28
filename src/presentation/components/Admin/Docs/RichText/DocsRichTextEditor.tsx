'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type ReactElement,
} from 'react';
import { platformDocsRichTextEditorContent as content } from '@/platform/content/platformDocsRichTextEditorContent';
import { normalizeDocsAuthoringMarkdown, preprocessDocsAuthoringMarkdown } from '@/platform/docs/tiptap/docsAuthoringMarkdown';
import {
  getDocsEditorMarkdown,
  getDocsEditorTextSelection,
  replaceDocsEditorSelection,
  setDocsEditorMarkdown,
  type DocsEditorTextSelection,
} from '@/platform/docs/tiptap/docsTiptapEditorApi';
import { createDocsRichTextExtensions } from '@/presentation/components/Admin/Docs/RichText/createDocsRichTextExtensions';
import { DocsRichTextToolbar } from '@/presentation/components/Admin/Docs/RichText/DocsRichTextToolbar';
import styles from './docsRichTextEditor.module.css';

export type DocsRichTextEditorHandle = {
  getMarkdown: () => string;
  setMarkdown: (markdown: string) => void;
  getSelection: () => DocsEditorTextSelection | null;
  replaceSelection: (text: string) => void;
  focus: () => void;
};

export type DocsRichTextEditorProps = {
  readonly markdown: string;
  readonly editable: boolean;
  readonly product: string;
  readonly articleSlug: string;
  readonly getAccessToken: () => string | null;
  readonly onChange: (markdown: string) => void;
  readonly onSelectionChange?: (selection: DocsEditorTextSelection | null) => void;
};

export const DocsRichTextEditor = forwardRef<DocsRichTextEditorHandle, DocsRichTextEditorProps>(
  function DocsRichTextEditor(
    { markdown, editable, product, articleSlug, getAccessToken, onChange, onSelectionChange },
    ref,
  ): ReactElement {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isApplyingExternalContentRef = useRef(false);
    const lastMarkdownRef = useRef(markdown);

    const editor = useEditor({
      extensions: createDocsRichTextExtensions(),
      editable,
      immediatelyRender: false,
      content: preprocessDocsAuthoringMarkdown(normalizeDocsAuthoringMarkdown(markdown).trimEnd()),
      editorProps: {
        attributes: {
          class: styles.docsRichTextProse,
        },
      },
      onUpdate: ({ editor: currentEditor }) => {
        if (isApplyingExternalContentRef.current) {
          return;
        }

        const nextMarkdown = getDocsEditorMarkdown(currentEditor);
        lastMarkdownRef.current = nextMarkdown;
        onChange(nextMarkdown);
      },
      onSelectionUpdate: ({ editor: currentEditor }) => {
        onSelectionChange?.(getDocsEditorTextSelection(currentEditor));
      },
    });

    useEffect(() => {
      if (editor == null) {
        return;
      }

      editor.setEditable(editable);
    }, [editor, editable]);

    useEffect(() => {
      if (editor == null || markdown === lastMarkdownRef.current) {
        return;
      }

      isApplyingExternalContentRef.current = true;
      setDocsEditorMarkdown(editor, markdown);
      lastMarkdownRef.current = markdown;
      isApplyingExternalContentRef.current = false;
    }, [editor, markdown]);

    useImperativeHandle(
      ref,
      () => ({
        getMarkdown: () => (editor == null ? markdown : getDocsEditorMarkdown(editor)),
        setMarkdown: (nextMarkdown: string) => {
          if (editor == null) {
            return;
          }
          isApplyingExternalContentRef.current = true;
          setDocsEditorMarkdown(editor, nextMarkdown);
          lastMarkdownRef.current = nextMarkdown;
          isApplyingExternalContentRef.current = false;
          onChange(nextMarkdown);
        },
        getSelection: () => (editor == null ? null : getDocsEditorTextSelection(editor)),
        replaceSelection: (text: string) => {
          if (editor == null) {
            return;
          }
          replaceDocsEditorSelection(editor, text);
          const nextMarkdown = getDocsEditorMarkdown(editor);
          lastMarkdownRef.current = nextMarkdown;
          onChange(nextMarkdown);
        },
        focus: () => {
          editor?.chain().focus().run();
        },
      }),
      [editor, markdown, onChange],
    );

    const uploadAndInsertImage = async (file: File): Promise<void> => {
      if (editor == null) {
        return;
      }

      const token = getAccessToken();
      if (token == null) {
        window.alert(content.image.uploadError);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('product', product);
      formData.append('articleSlug', articleSlug);

      const response = await fetch('/api/admin/docs/images', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        window.alert(content.image.uploadError);
        return;
      }

      const json = (await response.json()) as { url?: string };
      if (json.url == null) {
        window.alert(content.image.uploadError);
        return;
      }

      editor
        .chain()
        .focus()
        .insertDocsImage({
          src: json.url,
          alt: file.name.replace(/\.[^.]+$/, ''),
        })
        .run();
    };

    const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (file == null) {
        return;
      }

      void uploadAndInsertImage(file);
    };

    const handleInsertImageClick = (): void => {
      fileInputRef.current?.click();
    };

    return (
      <section className={styles.docsRichTextEditor} aria-label={content.documentLabel}>
        {editable ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageInputChange}
            />
            <DocsRichTextToolbar editor={editor} disabled={!editable} onInsertImage={handleInsertImageClick} />
          </>
        ) : null}
        <div className={styles.docsRichTextSurface}>
          <EditorContent editor={editor} />
        </div>
      </section>
    );
  },
);
