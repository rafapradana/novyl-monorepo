"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { tiptapExtensions } from "@/lib/tiptap";
import { EditorToolbar } from "./editor-toolbar";

interface NovelEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function NovelEditor({ content, onChange }: NovelEditorProps) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none min-h-[60vh] px-0 py-12",
        style:
          "font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; font-size: 17px;",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content from outside (e.g., chapter switch)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col">
      <EditorToolbar editor={editor} />
      <div className="mx-auto w-full max-w-[720px] px-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
