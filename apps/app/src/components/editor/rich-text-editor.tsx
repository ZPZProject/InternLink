"use client";

import type { Editor } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@v1/ui/button";
import { cn } from "@v1/ui/cn";
import { Icons } from "@v1/ui/icons";
import { useEffect } from "react";

import { toEditorHtml } from "@/lib/html-text";

function RichTextToolbar({
  editor,
  disabled,
}: {
  editor: Editor;
  disabled?: boolean;
}) {
  const iconBtn = "h-8 w-8 shrink-0 p-0 [&_svg:not([class*='size-'])]:size-4";

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap gap-0.5 border-b border-input bg-muted/40 p-1"
    >
      <Button
        type="button"
        variant={editor.isActive("bold") ? "secondary" : "ghost"}
        size="sm"
        className={iconBtn}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-pressed={editor.isActive("bold")}
        aria-label="Bold"
      >
        <Icons.Bold />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("italic") ? "secondary" : "ghost"}
        size="sm"
        className={iconBtn}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-pressed={editor.isActive("italic")}
        aria-label="Italic"
      >
        <Icons.Italic />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("strike") ? "secondary" : "ghost"}
        size="sm"
        className={iconBtn}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        aria-pressed={editor.isActive("strike")}
        aria-label="Strikethrough"
      >
        <Icons.Strikethrough />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
        size="sm"
        className={iconBtn}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-pressed={editor.isActive("bulletList")}
        aria-label="Bullet list"
      >
        <Icons.List />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
        size="sm"
        className={iconBtn}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-pressed={editor.isActive("orderedList")}
        aria-label="Numbered list"
      >
        <Icons.ListOrdered />
      </Button>
      <Button
        type="button"
        variant={
          editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"
        }
        size="sm"
        className={iconBtn}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-pressed={editor.isActive("heading", { level: 2 })}
        aria-label="Heading 2"
      >
        <Icons.Heading2 />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={iconBtn}
        disabled={disabled || !editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
        aria-label="Undo"
      >
        <Icons.Undo />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={iconBtn}
        disabled={disabled || !editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
        aria-label="Redo"
      >
        <Icons.Redo />
      </Button>
    </div>
  );
}

export type RichTextEditorProps = {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  className?: string;
  minHeight?: string;
};

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Write something…",
  disabled,
  "aria-invalid": ariaInvalid,
  className,
  minHeight = "min-h-[140px]",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: toEditorHtml(value),
    editable: !disabled,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        "aria-invalid": ariaInvalid ? "true" : "false",
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none px-3 py-2 outline-none",
          "focus-visible:ring-0",
          minHeight,
          "[&_.ProseMirror-focused]:outline-none",
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const next = toEditorHtml(value);
    if (editor.isDestroyed) {
      return;
    }
    const current = editor.getHTML();
    if (current === next) {
      return;
    }
    editor.commands.setContent(next, { emitUpdate: false });
  }, [value, editor]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-input bg-background shadow-xs",
        ariaInvalid && "border-destructive ring-destructive/20 ring-2",
        className,
      )}
      data-slot="rich-text-editor"
    >
      {editor ? <RichTextToolbar editor={editor} disabled={disabled} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
