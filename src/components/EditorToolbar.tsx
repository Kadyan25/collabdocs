"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function ToolbarButton({
  onClick,
  active,
  label,
  icon: Icon,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Icon className="size-4" />
    </Button>
  );
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b px-2 py-2">
      <ToolbarButton
        label="Bold"
        icon={Bold}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="Italic"
        icon={Italic}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="Underline"
        icon={Underline}
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolbarButton
        label="Heading 1"
        icon={Heading1}
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolbarButton
        label="Heading 2"
        icon={Heading2}
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolbarButton
        label="Bulleted list"
        icon={List}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="Numbered list"
        icon={ListOrdered}
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
    </div>
  );
}
