"use client"

import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react"
import { ImageIcon, Loader2, Trash, ArrowLeftIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import imageCompression from "browser-image-compression";
import { uploadLeidingPhoto, uploadPostCover, deleteFromBucket } from "~/utils/data";

import { Button } from '~/components/ui/button'
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from '~/components/images/cropper'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Slider } from '~/components/ui/slider'

interface FileUploadProps {
  bucket: "leiding-fotos" | "post-covers";
  path: string;
  initialUrl?: string;
  onChange: (url: string) => void;
}

type Area = { x: number; y: number; width: number; height: number }

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      return null
    }

    canvas.width = outputWidth
    canvas.height = outputHeight

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, "image/jpeg", 0.95)
    })
  } catch (error) {
    console.error("Error in getCroppedImg:", error)
    return null
  }
}

export default function FileUpload({ bucket, path, initialUrl, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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

  const handleApply = async () => {
    if (!tempImageUrl || !croppedAreaPixels) {
      console.error("Missing data for apply:", { tempImageUrl, croppedAreaPixels });
      return;
    }

    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(tempImageUrl, croppedAreaPixels);

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image blob.");
      }

      const croppedFile = new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" });
      const compressedFile = await imageCompression(croppedFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      const uploadFunction = bucket === "leiding-fotos" ? uploadLeidingPhoto : uploadPostCover;
      const url = await uploadFunction(compressedFile, path);

      setPreviewUrl(url);
      onChange(url);

      toast.success("Afbeelding geüpload en bijgesneden!", {
        description: "De nieuwe afbeelding is opgeslagen.",
      });

    } catch (err) {
      console.error(err);
      toast.error("Uploaden mislukt");
    } finally {
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }
      setUploading(false);
      setIsDialogOpen(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImageUrl(url);
      setIsDialogOpen(true);

      setZoom(1);
      setCroppedAreaPixels(null);
      e.target.value = '';
    }
  };

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels)
  }, [])

  useEffect(() => {
    return () => {
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
    };
  }, [tempImageUrl]);

  return (
    <>
      {/* Cropper Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140 [&>button]:hidden">
          <DialogDescription className="sr-only">
            Crop foto menu
          </DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-my-1 opacity-60"
                  onClick={() => setIsDialogOpen(false)}
                  aria-label="Cancel"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </Button>
                <span>Crop foto</span>
              </div>
              <Button
                className="-my-1"
                onClick={handleApply}
                disabled={!tempImageUrl || !croppedAreaPixels || uploading}
                autoFocus
              >
                {uploading ? 'Opslaan...' : 'Opslaan'}
              </Button>
            </DialogTitle>
          </DialogHeader>
          {tempImageUrl && (
            <Cropper
              className="h-96 sm:h-120"
              image={tempImageUrl}
              zoom={zoom}
              aspectRatio={17/10}
              onCropChange={handleCropChange}
              onZoomChange={setZoom}
            >
              <CropperDescription />
              <CropperImage />
              <CropperCropArea />
            </Cropper>
          )}
          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              <ZoomOutIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
              <Slider
                defaultValue={[1]}
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                aria-label="Zoom slider"
              />
              <ZoomInIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {previewUrl ? (
          <div onClick={handleRemove}
            className="flex items-center justify-center group w-full rounded-md overflow-hidden aspect-video border hover:border-destructive transition-all cursor-pointer relative"
          >
            <img
              src={previewUrl}
              alt="Preview"
              style={{ objectFit: "cover" }}
              className="w-full h-full absolute inset-0 transition-opacity duration-200 group-hover:opacity-10"
            />
            <Trash className="h-6 w-6 mr-1 text-destructive opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
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
    </>
  );
}