import Link from "@tiptap/extension-link"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"

import { EditorContent, useEditor } from "@tiptap/react"
import { useState, useCallback, useRef, useEffect } from "react"

import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Text,
  Link2,
  Link2Off,
  List as ListIcon
} from "lucide-react"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "~/components/ui/toggle-group"
import { Toggle } from "../ui/toggle"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { toast } from "sonner"

// Import Tooltip components from shadcn/ui
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip" // Adjust path if necessary

type Props = {
  content: string
  onChange: (html: string) => void
}

export function SimpleEditor({ content, onChange }: Props) {
  const [showLinkPopover, setShowLinkPopover] = useState(false)
  const [url, setUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [toolbarKey, setToolbarKey] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: undefined,
        heading: { levels: [1, 2, 3] },
        paragraph: {
          HTMLAttributes: {
            class: 'min-h-[1rem]'
          }
        },
      }),
      Underline,
      Link.configure({
        linkOnPaste: true,
        openOnClick: false,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-blue-500 dark:text-blue-600',
        },
        shouldAutoLink: (url) => url.startsWith('https://'),
      }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
      setToolbarKey(prev => prev + 1);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert focus:outline-none min-h-[250px] w-full max-w-none'
      },
    },
  })

  useEffect(() => {
    if (showLinkPopover && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showLinkPopover])

  const setLink = useCallback(() => {
    if (!editor) return
    const existingLink = editor.getAttributes('link').href
    setUrl(existingLink || '')
    setShowLinkPopover(!showLinkPopover)
  }, [editor, showLinkPopover])

  const confirmLink = useCallback(() => {
    if (!editor) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      toast.success("Link verwijderd.", {
        description: "De link is succesvol verwijderd van de geselecteerde tekst."
      });
      setShowLinkPopover(false)
      return
    }
    try {
      new URL(url);
    } catch (_) {
      toast.error("Ongeldige URL", {
        description: "Voer een geldige URL in (bijv. https://voorbeeld.com)."
      });
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    toast.success("Link toegevoegd!", {
      description: "De link is succesvol toegevoegd."
    });
    setShowLinkPopover(false)
  }, [editor, url])

  const removeLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
    toast.success("Link verwijderd.", {
      description: "De link is succesvol verwijderd van de geselecteerde tekst."
    });
    setUrl('')
    setShowLinkPopover(false)
  }, [editor])


  if (!editor) return null

  return (
    <div className="rounded-md border border-input bg-background">
      <div key={toolbarKey} className="flex flex-wrap gap-2 p-2 border-b border-input rounded-t-md">
        {/* Wrap the entire toolbar with TooltipProvider */}
        <TooltipProvider>
          <ToggleGroup variant="outline" type="multiple">
            {/* Bold Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="bold"
                  aria-label="Schakel vetgedrukt in"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor.isActive('bold') ? 'bg-accent text-accent-foreground' : ''}
                >
                  <BoldIcon className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Vet</p>
              </TooltipContent>
            </Tooltip>

            {/* Italic Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="italic"
                  aria-label="Schakel cursief in"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor.isActive('italic') ? 'bg-accent text-accent-foreground' : ''}
                >
                  <ItalicIcon className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cursief</p>
              </TooltipContent>
            </Tooltip>

            {/* Underline Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="underline"
                  aria-label="Schakel onderstrepen in"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={editor.isActive('underline') ? 'bg-accent text-accent-foreground' : ''}
                >
                  <UnderlineIcon className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Onderstrepen</p>
              </TooltipContent>
            </Tooltip>
          </ToggleGroup>

          <ToggleGroup variant="outline" type="single">
            {/* Paragraph Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="paragraph"
                  aria-label="Stel paragraaf in"
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  className={editor.isActive('paragraph') ? 'bg-accent text-accent-foreground' : ''}
                >
                  <Text className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paragraaf</p>
              </TooltipContent>
            </Tooltip>

            {/* Heading 1 Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="heading1"
                  aria-label="Schakel kop 1 in"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={editor.isActive('heading', { level: 1 }) ? 'bg-accent text-accent-foreground' : ''}
                >
                  <Heading1 className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Titel 1</p>
              </TooltipContent>
            </Tooltip>

            {/* Heading 2 Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="heading2"
                  aria-label="Schakel kop 2 in"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={editor.isActive('heading', { level: 2 }) ? 'bg-accent text-accent-foreground' : ''}
                >
                  <Heading2 className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Titel 2</p>
              </TooltipContent>
            </Tooltip>

            {/* Heading 3 Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="heading3"
                  aria-label="Schakel kop 3 in"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={editor.isActive('heading', { level: 3 }) ? 'bg-accent text-accent-foreground' : ''}
                >
                  <Heading3 className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Titel 3</p>
              </TooltipContent>
            </Tooltip>
          </ToggleGroup>

          {/* Bullet List Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant="outline"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('list') ? 'bg-accent text-accent-foreground' : ''}
              >
                <ListIcon />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lijst</p>
            </TooltipContent>
          </Tooltip>

          {/* Link Toggle (Popover already present, so Tooltip wraps PopoverTrigger) */}
          <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
            <Tooltip> {/* Tooltip for the link icon itself */}
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Toggle
                    variant="outline"
                    onClick={setLink}
                    className={editor.isActive('link') ? 'bg-accent text-accent-foreground' : ''}
                  >
                    {editor.isActive('link') ? <Link2Off /> : <Link2 />}
                  </Toggle>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{editor.isActive('link') ? 'Link verwijderen' : 'Link toevoegen'}</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto p-2 flex flex-col gap-2" align="start">
              <Input
                ref={inputRef}
                type="url"
                placeholder="Voer URL in"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmLink()
                  }
                }}
                className="min-w-[200px]"
              />
              <div className="flex gap-2 justify-end">
                {editor.isActive('link') && url && (
                  <Button variant="outline" onClick={removeLink}>Link verwijderen</Button>
                )}
                <Button onClick={confirmLink}>Link {editor.isActive('link') ? 'bewerken' : 'toevoegen'}</Button>
              </div>
            </PopoverContent>
          </Popover>
        </TooltipProvider>
      </div>

      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}