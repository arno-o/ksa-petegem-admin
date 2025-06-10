// editor.tsx
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Underline from "@tiptap/extension-underline"
import Paragraph from "@tiptap/extension-paragraph"

import { EditorContent, useEditor } from "@tiptap/react"

import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Text // Represents Paragraph
} from "lucide-react"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "~/components/ui/toggle-group"

type Props = {
  content: string
  onChange: (html: string) => void
}

export function SimpleEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      Paragraph,
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        // Crucial for removing default outline and applying prose styles
        class: 'prose dark:prose-invert focus:outline-none min-h-[250px] w-full max-w-none'
      },
    },
  })

  if (!editor) return null

  return (
    <div className="space-y-4 rounded-md border border-input bg-background shadow-sm"> {/* Added border and shadow for the whole editor component */}
      <div className="flex flex-wrap gap-2 p-2 border-b border-input rounded-t-md">
        {/* ToggleGroup for Marks (Bold, Italic, Underline) */}
        <ToggleGroup variant="outline" type="multiple">
          <ToggleGroupItem
            value="bold"
            aria-label="Toggle bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-accent text-accent-foreground' : ''}
          >
            <BoldIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="italic"
            aria-label="Toggle italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-accent text-accent-foreground' : ''}
          >
            <ItalicIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="underline"
            aria-label="Toggle underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-accent text-accent-foreground' : ''}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        {/* ToggleGroup for Block Nodes (Paragraph, Headings) */}
        <ToggleGroup variant="outline" type="single">
          <ToggleGroupItem
            value="paragraph"
            aria-label="Set paragraph"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive('paragraph') ? 'bg-accent text-accent-foreground' : ''}
          >
            <Text className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="heading1"
            aria-label="Toggle heading1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-accent text-accent-foreground' : ''}
          >
            <Heading1 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="heading2"
            aria-label="Toggle heading2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-accent text-accent-foreground' : ''}
          >
            <Heading2 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="heading3"
            aria-label="Toggle heading3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-accent text-accent-foreground' : ''}
          >
            <Heading3 className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="p-4"> {/* Removed border and rounded-b-md from here as it's now on the parent div */}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}