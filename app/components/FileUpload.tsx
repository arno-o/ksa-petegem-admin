import { useState, useEffect } from "react";
import { ImageUpIcon, XIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { uploadLeidingPhoto } from "~/utils/data";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";

interface SimpleUploadProps {
  leidingId: string;
  initialUrl?: string;
  onSuccess: (url: string) => void;
}

export default function SimpleUpload({ leidingId, initialUrl, onSuccess }: SimpleUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const url = await uploadLeidingPhoto(file, leidingId);
      setPreview(url);
      setFilename(file.name);
      onSuccess(url);
      toast.success("Foto geüpload!");
    } catch (err: any) {
      toast.error("Upload mislukt: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFilename(null);
    onSuccess("");
  };

  return (
    <div className="space-y-2">
      <Label className="block text-sm font-medium">Profielfoto</Label>

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full aspect-square object-cover rounded-lg border"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-3 py-1 rounded-b-lg flex items-center justify-between">
            <span className="truncate max-w-[80%]">{filename || "Foto geupload"}</span>
            {!loading ? <CheckCircle2Icon className="w-4 h-4 text-green-400" /> : <Loader2Icon className="w-4 h-4 animate-spin" />}
          </div>
          <button
            onClick={handleRemove}
            type="button"
            className="absolute top-2 right-2 z-10 rounded-full bg-black/70 p-1 text-white hover:bg-black"
            aria-label="Foto verwijderen"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-accent transition">
          <ImageUpIcon className="w-6 h-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Klik om een foto te kiezen</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
        </label>
      )}

      {loading && <p className="text-sm text-muted-foreground">Bezig met uploaden…</p>}
    </div>
  );
}