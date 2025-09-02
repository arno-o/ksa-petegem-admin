import { useCallback, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { ImageIcon, Loader2, Trash } from "lucide-react";

import imageCompression from "browser-image-compression";
import { uploadLeidingPhoto, uploadPostCover, deleteFromBucket } from "~/utils/data";

interface FileUploadProps {
  bucket: "leiding-fotos" | "post-covers";
  path: string;
  initialUrl?: string;
  onChange: (url: string) => void;
}

export default function FileUpload({ bucket, path, initialUrl, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);

  const handleRemove = useCallback(async () => {
    if (!previewUrl) return;
    try {
      await deleteFromBucket(bucket, previewUrl);
      setPreviewUrl(null);
      onChange("");
      toast.success("Afbeelding verwijderd");
    } catch (error) {
      console.error(error);
      toast.error("Verwijderen mislukt");
    }
  }, [previewUrl, bucket, onChange]);

const handleUpload = async (file: File) => {
  setUploading(true);
  try {
    // ⬇️ Compress image
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1, // Adjust max file size (in MB)
      maxWidthOrHeight: 1280, // Optional: resize large images
      useWebWorker: true,
    });

    const uploadFunction = bucket === "leiding-fotos" ? uploadLeidingPhoto : uploadPostCover;
    const url = await uploadFunction(compressedFile, path);

    setPreviewUrl(url);
    onChange(url);
    toast.success("Afbeelding geüpload", {
      description: String(url),
    });
  } catch (err) {
    console.error(err);
    toast.error("Uploaden mislukt");
  } finally {
    setUploading(false);
  }
};

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleUpload(file);
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div
          className="flex items-center justify-center group w-full rounded-md overflow-hidden aspect-video border hover:border-destructive transition-all cursor-pointer relative"
          onClick={handleRemove}
        >
          <img
            src={previewUrl}
            alt="Preview"
            style={{ objectFit: "cover" }}
            className="w-full h-full absolute inset-0 transition-opacity duration-200 group-hover:opacity-10"
          />
          <Trash className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute inset-0 m-auto" />
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center border border-dashed border-muted-foreground/40 rounded-md p-6 cursor-pointer hover:bg-muted/40 aspect-video",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {uploading ? (
            <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
          ) : (
            <>
              <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
              <p className="text-sm text-muted-foreground">Klik om afbeelding te uploaden</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}