// components/groups/PdfUpload.tsx
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Loader2, FileText, Upload, Trash2, ExternalLink } from "lucide-react";
import {
  uploadGroupLetter,
  deleteGroupLetter,
  updateGroupLetterUrl,
} from "~/utils/data";

type Props = {
  groupId: number | string;
  initialUrl?: string | null;
  onChange?: (url: string | null) => void; // bubble up to update local state
};

export default function PdfUpload({ groupId, initialUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);

  const pickFile = () => inputRef.current?.click();

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const publicUrl = await uploadGroupLetter(file, groupId);
      const updated = await updateGroupLetterUrl(groupId, publicUrl);
      setUrl(updated.brief_url ?? publicUrl);
      onChange?.(updated.brief_url ?? publicUrl);
      toast.success("Groepsbrief geüpload");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Uploaden mislukt");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Kies een PDF-bestand.");
      e.target.value = "";
      return;
    }
    await handleUpload(file);
    e.target.value = "";
  };

  const handleRemove = async () => {
    if (!window.confirm("Brief verwijderen?")) return;
    setUploading(true);
    try {
      await deleteGroupLetter(groupId);
      const updated = await updateGroupLetterUrl(groupId, null);
      setUrl(updated.brief_url ?? null);
      onChange?.(null);
      toast.success("Groepsbrief verwijderd");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Verwijderen mislukt");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Groepsbrief (PDF)</span>
        </div>
        <div className="flex items-center gap-2">
          {url ? (
            <>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-sm underline underline-offset-4"
              >
                Openen <ExternalLink className="ml-1 h-4 w-4" />
              </a>
              <Button
                type="button"
                variant="outline"
                onClick={pickFile}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Bezig...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Vervang PDF
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleRemove}
                disabled={uploading}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="sr-only">Verwijderen</span>
              </Button>
            </>
          ) : (
            <Button type="button" onClick={pickFile} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Bezig...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Upload PDF
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onFileChange}
      />

      {url ? (
        <p className="text-sm text-muted-foreground break-all">{url}</p>
      ) : (
        <p className="text-sm text-muted-foreground">Nog geen PDF geüpload.</p>
      )}
    </div>
  );
}