'use client';

import type { Editor } from '@tiptap/react';
import type { ReactElement } from 'react';
import { platformDocsRichTextEditorContent as content } from '@/platform/content/platformDocsRichTextEditorContent';
import styles from './docsRichTextEditor.module.css';

export type DocsRichTextToolbarProps = {
  readonly editor: Editor | null;
  readonly onInsertImage: () => void;
  readonly disabled?: boolean;
};

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  readonly label: string;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      className={`${styles.docsRichTextToolbarButton} ${active ? styles.docsRichTextToolbarButtonActive : ''}`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function DocsRichTextToolbar({
  editor,
  onInsertImage,
  disabled = false,
}: DocsRichTextToolbarProps): ReactElement {
  if (editor == null) {
    return <div className={styles.docsRichTextToolbar} />;
  }

  const setLink = (): void => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(content.linkPrompt, previousUrl ?? 'https://');
    if (url == null) {
      return;
    }
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const insertCallout = (): void => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'docsCallout',
        attrs: { variant: 'note' },
        content: [{ type: 'text', text: 'Add callout text…' }],
      })
      .run();
  };

  return (
    <div className={styles.docsRichTextToolbar} role="toolbar" aria-label="Formatting">
      <ToolbarButton
        label={content.toolbar.heading1}
        active={editor.isActive('heading', { level: 1 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolbarButton
        label={content.toolbar.heading2}
        active={editor.isActive('heading', { level: 2 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        label={content.toolbar.heading3}
        active={editor.isActive('heading', { level: 3 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <span className={styles.docsRichTextToolbarDivider} aria-hidden />
      <ToolbarButton
        label={content.toolbar.bold}
        active={editor.isActive('bold')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label={content.toolbar.italic}
        active={editor.isActive('italic')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label={content.toolbar.underline}
        active={editor.isActive('underline')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarButton
        label={content.toolbar.inlineCode}
        active={editor.isActive('code')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />
      <span className={styles.docsRichTextToolbarDivider} aria-hidden />
      <ToolbarButton
        label={content.toolbar.bulletList}
        active={editor.isActive('bulletList')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label={content.toolbar.orderedList}
        active={editor.isActive('orderedList')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        label={content.toolbar.quote}
        active={editor.isActive('blockquote')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolbarButton
        label={content.toolbar.codeBlock}
        active={editor.isActive('codeBlock')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <ToolbarButton
        label={content.toolbar.divider}
        disabled={disabled}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />
      <ToolbarButton
        label={content.toolbar.callout}
        active={editor.isActive('docsCallout')}
        disabled={disabled}
        onClick={insertCallout}
      />
      <span className={styles.docsRichTextToolbarDivider} aria-hidden />
      <ToolbarButton
        label={content.toolbar.link}
        active={editor.isActive('link')}
        disabled={disabled}
        onClick={setLink}
      />
      <ToolbarButton label={content.toolbar.image} disabled={disabled} onClick={onInsertImage} />
      <span className={styles.docsRichTextToolbarDivider} aria-hidden />
      <ToolbarButton
        label={content.toolbar.undo}
        disabled={disabled || !editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        label={content.toolbar.redo}
        disabled={disabled || !editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}
