import { toast } from "sonner";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router";

import { FileText, XIcon, Eye } from "lucide-react";

import { getGlobalPdfUrl, uploadGlobalPdf, deleteGlobalPdf } from "~/utils/data";

type Props = {
  settingKey: "general.inschrijvingsbundel_url" | "general.privacyverklaring_url" | string;
  label: string;
  description?: string;
};

export default function PdfSettingField({ settingKey, label, description }: Props) {
  const [url, setUrl] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await getGlobalPdfUrl(settingKey);
        if (!cancelled) setUrl(u);
      } catch (e) {
        console.error(e);
        toast.error("Kon huidige PDF niet ophalen.");
      }
    })();
    return () => { cancelled = true; };
  }, [settingKey]);

  const pick = () => fileRef.current?.click();

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Enkel PDF-bestanden zijn toegestaan.");
      e.target.value = "";
      return;
    }
    try {
      setBusy(true);
      const publicUrl = await uploadGlobalPdf(settingKey, f);
      setUrl(publicUrl);
      toast.success("PDF geüpload.");
    } catch (err) {
      console.error(err);
      toast.error("Upload mislukt.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function remove() {
    try {
      setBusy(true);
      await deleteGlobalPdf(settingKey);
      setUrl("");
      toast.success("PDF verwijderd.");
    } catch (e) {
      console.error(e);
      toast.error("Verwijderen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  return (

    <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
      {url ? (
        <>
          <div className="flex items-center justify-between gap-2 rounded-xl border px-4 py-2 w-full">
            <div className="flex items-center gap-2">
              <FileText className="size-4 shrink-0 opacity-60" />
              <Link to={url} target="_blank" className="truncate text-[13px] font-medium hover:underline">
                {
                  settingKey === "general.inschrijvingsbundel_url"
                    ? "inschrijvingsbundel.pdf"
                    : settingKey === "general.privacyverklaring_url"
                      ? "privacy_verklaring.pdf"
                      : ""
                }
              </Link>
            </div>
            <div className="flex gap-2">
              <Button variant={"ghost"} size={"icon"} onClick={remove}>
                <XIcon />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Probably leave as is? */}
        </>
      )}
      <div className="flex items-center gap-2">
        <Button variant={url ? "outline" : "default"} onClick={pick} disabled={busy}>{url ? "PDF Vervangen" : "PDF Uploaden"}</Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  );
}