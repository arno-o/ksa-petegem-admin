import { toast } from "sonner";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { useIsMobile } from "~/hooks/use-mobile";

import { Loader2, FileText, Upload, Trash2, ExternalLink } from "lucide-react";

import {
  uploadGroupLetter,
  deleteGroupLetter,
  updateGroupLetterUrl,
} from "~/utils/data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

type Props = {
  groupId: number | string;
  initialUrl?: string | null;
  onChange?: (url: string | null) => void; // bubble up to update local state
};

export default function PdfUpload({ groupId, initialUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);

  const isMobile = useIsMobile()
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
      <div className="flex items-center gap-4 flex-col md:flex-row md:gap-2">
        {url ? (
          <>
            <div className="flex items-center justify-between w-[100%]">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Groepsbrief (PDF)</span>
              </div>

              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-md underline underline-offset-4 md:text-sm"
              >
                Openen <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div className="flex items-center gap-2 justify-center w-full md:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={pickFile}
                disabled={uploading}
                className={isMobile ? "w-[50%]" : undefined}
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

              {/* Delete with ShadCN AlertDialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size={isMobile ? "lg" : "icon"}
                    disabled={uploading}
                    className={isMobile ? "w-[50%]" : undefined}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className={isMobile ? "" : "sr-only"}>Verwijderen</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Brief verwijderen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Deze actie kan niet ongedaan gemaakt worden. Weet je zeker
                      dat je de groepsbrief wil verwijderen?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRemove}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Verwijderen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between w-[100%]">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Groepsbrief (PDF)</span>
              </div>

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
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}