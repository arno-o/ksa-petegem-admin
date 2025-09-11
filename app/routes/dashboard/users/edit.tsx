import { useIsMobile } from "~/hooks/use-mobile";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useBlocker } from "react-router";

import { toast } from "sonner";
import { ChevronDownIcon, ChevronLeft, SaveIcon } from "lucide-react";

import PageLayout from "../../pageLayout";
import FileUpload from "~/components/images/file-upload";
import FullScreenLoader from "~/components/allround/full-screen-loader";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

import { fetchActiveGroups, fetchLeidingById, updateLeiding } from "~/utils/data";

import type { Route } from "../users/+types/edit";

/* ---------------------------------- meta ---------------------------------- */
export function meta({ }: Route.MetaArgs) {
  return [{ title: "Leiding Bewerken" }];
}

/* ----------------------------- clientLoader (SSR) ----------------------------- */
export async function clientLoader({ params }: Route.LoaderArgs) {
  const leiding = await fetchLeidingById(params.leidingId);
  const groepen = await fetchActiveGroups();
  return { leiding, groepen };
}

export function HydrateFallback() {
  return (
    <PageLayout>
      <FullScreenLoader />
    </PageLayout>
  );
}

/* ------------------------------ helper utils ------------------------------ */
// make null/undefined safe strings
const s = (v: unknown) => (v ?? "").toString();

// YYYY-MM-DD (UTC) for date-only compares
const toYMD = (d?: Date) =>
  d
    ? new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
      )
        .toISOString()
        .slice(0, 10)
    : "";

// keep leidingsploeg as string (matches <Select> value)
const toGroupStr = (v: unknown) =>
  v === null || v === undefined ? "" : String(v);

// consistent snapshot for equality checks
type EditForm = {
  voornaam: string;
  familienaam: string;
  werk: string;
  studies: string;
  foto_url: string;
  werkgroepen: string;
  ksa_ervaring: string;
  leidingsploeg: string; // string in state to match <Select>
  trekker: boolean;
  hoofdleiding: boolean;
  leiding_sinds?: Date | undefined;
  geboortedatum?: Date | undefined;
};

const normalize = (state: EditForm) => ({
  voornaam: s(state.voornaam).trim(),
  familienaam: s(state.familienaam).trim(),
  studies: s(state.studies).trim(),
  werk: s(state.werk).trim(),
  leidingsploeg: toGroupStr(state.leidingsploeg),
  werkgroepen: s(state.werkgroepen).trim(),
  ksa_ervaring: s(state.ksa_ervaring).trim(),
  hoofdleiding: !!state.hoofdleiding,
  trekker: !!state.trekker,
  // compare dates as strings (date-only)
  geboortedatum: toYMD(state.geboortedatum),
  leiding_sinds_year: state.leiding_sinds
    ? String(state.leiding_sinds.getUTCFullYear())
    : "",
  foto_url: s(state.foto_url),
});

const equalNormalized = (a: EditForm, b: EditForm) =>
  JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));

// safe date parser for YYYY-MM-DD
const parseDateSafely = (dateString?: string | null): Date | undefined => {
  if (!dateString) return undefined;
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/* -------------------------------- component -------------------------------- */
const EditUser = ({ loaderData }: Route.ComponentProps) => {
  const [dobDatePicker, setDobDatePicker] = useState(false);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { leidingId } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leiding = loaderData.leiding;
  const groepen = loaderData.groepen;

  const [form, setForm] = useState<EditForm>({
    voornaam: "",
    familienaam: "",
    werk: "",
    studies: "",
    foto_url: "",
    werkgroepen: "",
    ksa_ervaring: "",
    leidingsploeg: "",
    trekker: false,
    hoofdleiding: false,
    leiding_sinds: undefined,
    geboortedatum: undefined,
  });

  const [initial, setInitial] = useState<EditForm>(form);

  // Load data and coerce types once
  useEffect(() => {
    const getLeiding = async () => {
      if (!leidingId) {
        setError("Leiding ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const geboortedatumDate = parseDateSafely(leiding.geboortedatum);
        const leidingSindsDate = parseDateSafely(leiding.leiding_sinds);

        const loaded: EditForm = {
          voornaam: s(leiding.voornaam),
          familienaam: s(leiding.familienaam),
          leiding_sinds: leidingSindsDate,
          geboortedatum: geboortedatumDate,
          studies: s(leiding.studies),
          werk: s(leiding.werk),
          leidingsploeg: toGroupStr(leiding.leidingsploeg), // keep as string in state
          werkgroepen: s(leiding.werkgroepen),
          hoofdleiding: !!leiding.hoofdleiding,
          trekker: !!leiding.trekker,
          ksa_ervaring: s(leiding.ksa_ervaring),
          foto_url: s(leiding.foto_url),
        };

        setForm(loaded);
        setInitial({ ...loaded });
      } catch (err) {
        setError("Dit profiel bestaat niet");
        toast.error("Fout bij het laden van dit profiel.");
      } finally {
        setLoading(false);
      }
    };

    getLeiding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leidingId]);

  // Compute isDirty via normalized snapshots
  const isDirty = useMemo(() => !equalNormalized(form, initial), [form, initial]);

  // Save handler (no auto-navigate; the nav-guard handles leaving)
  const handleSave = async (): Promise<boolean> => {
    if (!leidingId) {
      toast.error("Geen Leiding ID gevonden om op te slaan.");
      return false;
    }

    // If DB column is numeric, convert string -> number (or null)
    // If your DB column is TEXT, remove the Number(...) conversion below.
    const formToSave = {
      ...form,
      geboortedatum: form.geboortedatum ? toYMD(form.geboortedatum) : null,
      // you were forcing 09-01; keep consistent
      leiding_sinds: form.leiding_sinds
        ? `${form.leiding_sinds.getUTCFullYear()}-09-01`
        : null,
      leidingsploeg:
        form.leidingsploeg === "" ? null : Number(form.leidingsploeg),
    };

    try {
      setSaving(true);
      await updateLeiding(leidingId, formToSave);
      // refresh the initial snapshot to the *current* form (coerced)
      setInitial({ ...form });
      toast.success("Leiding succesvol bewerkt.");
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Er is iets foutgelopen bij het opslaan.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Years for "Leiding sinds"
  const currentYear = new Date().getUTCFullYear();
  const startYear = 2015;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

  const handleLeidingSindsYearChange = (yearString: string) => {
    const year = parseInt(yearString, 10);
    const newDate = new Date(Date.UTC(year, 8, 1)); // Sep 1 in UTC
    setForm({ ...form, leiding_sinds: newDate });
  };

  /* --------------------------- SPA navigation guard -------------------------- */
  const blocker = useBlocker(isDirty);
  const [leaveOpen, setLeaveOpen] = useState(false);

  // When router attempts to navigate and we're dirty, open the dialog
  useEffect(() => {
    if (blocker.state === "blocked") {
      setLeaveOpen(true);
    }
  }, [blocker.state]);

  const onCancelLeave = () => {
    setLeaveOpen(false);
    if (blocker.reset) blocker.reset(); // stay on page
  };

  const onDiscardLeave = () => {
    setLeaveOpen(false);
    if (blocker.proceed) blocker.proceed(); // discard changes, allow navigation
    navigate("/leiding/actief", { viewTransition: true });
  };

  const onSaveAndLeave = async () => {
    const ok = await handleSave();
    if (ok) {
      setLeaveOpen(false);
      if (blocker.proceed) blocker.proceed();
      navigate("/leiding/actief", { viewTransition: true });
    }
  };

  // Warn on hard refresh / tab close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = ""; // required by some browsers
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  /* ---------------------------------- UI ---------------------------------- */
  if (loading) {
    return (
      <PageLayout>
        <FullScreenLoader />
      </PageLayout>
    );
  }

  if (error || !leiding) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <p className="text-destructive">{error || "Leiding niet gevonden."}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Leave Guard Dialog */}
      <AlertDialog open={leaveOpen} onOpenChange={(open) => !open && onCancelLeave()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Niet-opgeslagen wijzigingen</AlertDialogTitle>
            <AlertDialogDescription>
              Je hebt wijzigingen die nog niet zijn opgeslagen. Wil je deze opslaan voor je vertrekt?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="">
            <AlertDialogCancel onClick={onCancelLeave}>Annuleren</AlertDialogCancel>
            <Separator orientation={isMobile ? "horizontal" : "vertical"} />
            <Button onClick={onDiscardLeave} variant={"outline"}>
                Niet opslaan
            </Button>
            <Button onClick={onSaveAndLeave} disabled={saving}>
                {saving ? "Opslaan…" : "Opslaan en sluiten"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-6 pb-20">
        {/* Header */}
        <header className="flex flex-col gap-3 md:justify-between md:items-center md:flex-row">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Terug</span>
            </Button>
            <h3 className="text-2xl font-semibold tracking-tight">
              Profiel: {leiding.voornaam} {leiding.familienaam}
            </h3>
          </div>
          <Button onClick={handleSave} disabled={!isDirty || saving}>
            <SaveIcon className="mr-2 h-4 w-4" />
            {saving ? "Opslaan…" : "Opslaan"}
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Persoonlijke gegevens */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Persoonlijke gegevens</h2>
                <p className="text-sm text-muted-foreground">
                  Naam en geboortedatum van de leiding.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="voornaam">Voornaam</Label>
                  <Input
                    id="voornaam"
                    value={form.voornaam}
                    onChange={(e) =>
                      setForm({ ...form, voornaam: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="familienaam">Familienaam</Label>
                  <Input
                    id="familienaam"
                    value={form.familienaam}
                    onChange={(e) =>
                      setForm({ ...form, familienaam: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Geboortedatum</Label>
                  <Popover open={dobDatePicker} onOpenChange={setDobDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal"
                      >
                        {form.geboortedatum
                          ? new Date(form.geboortedatum).toLocaleDateString(
                              "nl-BE",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                timeZone: "UTC",
                              }
                            )
                          : "Kies een datum"}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        hideWeekdays
                        mode="single"
                        selected={form.geboortedatum}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (date) {
                            const newDateUTC = new Date(
                              Date.UTC(
                                date.getFullYear(),
                                date.getMonth(),
                                date.getDate()
                              )
                            );
                            setForm({ ...form, geboortedatum: newDateUTC });
                            setDobDatePicker(false);
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        defaultMonth={form.geboortedatum}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <Separator />

            {/* Opleiding & Werk */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Opleiding & Werk</h2>
                <p className="text-sm text-muted-foreground">
                  Wat studeert of werkt deze leiding momenteel?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="studies">Studies</Label>
                  <Input
                    id="studies"
                    value={form.studies}
                    onChange={(e) =>
                      setForm({ ...form, studies: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="werk">Werk</Label>
                  <Input
                    id="werk"
                    value={form.werk}
                    onChange={(e) =>
                      setForm({ ...form, werk: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* KSA Informatie */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">KSA Informatie</h2>
                <p className="text-sm text-muted-foreground">
                  Informatie over de rol binnen de leidingsploeg en ervaringen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <Label>Leidingsploeg</Label>
                  <Select
                    value={String(form.leidingsploeg)}
                    onValueChange={(value) =>
                      setForm({ ...form, leidingsploeg: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Kies groep" />
                    </SelectTrigger>
                    <SelectContent>
                      {groepen
                        .slice()
                        .sort((a: any, b: any) => a.id - b.id)
                        .map((g: any) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.naam}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Leiding sinds</Label>
                  <Select
                    onValueChange={handleLeidingSindsYearChange}
                    value={
                      form.leiding_sinds
                        ? String(form.leiding_sinds.getUTCFullYear())
                        : ""
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Kies een jaar" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="werkgroepen">Werkgroepen</Label>
                <Input
                  id="werkgroepen"
                  value={form.werkgroepen}
                  onChange={(e) =>
                    setForm({ ...form, werkgroepen: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="ksa_ervaring">Beste KSA Ervaring</Label>
                <Textarea
                  id="ksa_ervaring"
                  value={form.ksa_ervaring}
                  className="resize-none"
                  onChange={(e) =>
                    setForm({ ...form, ksa_ervaring: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <aside className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Profielfoto</h2>
                <p className="text-sm text-muted-foreground">
                  Upload een recente foto van deze leiding.
                </p>
              </div>
              <FileUpload
                bucket="leiding-fotos"
                path={`leiding-${leiding.id}`}
                initialUrl={leiding.foto_url || ""}
                onChange={(url) => setForm({ ...form, foto_url: url })}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Leiding Rollen</h2>
                <p className="text-sm text-muted-foreground">
                  Is deze persoon trekker of hoofdleiding?
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="trekker">Trekker</Label>
                <Switch
                  id="trekker"
                  checked={form.trekker}
                  onCheckedChange={(checked: boolean) =>
                    setForm({ ...form, trekker: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hoofdleiding">Hoofdleiding</Label>
                <Switch
                  id="hoofdleiding"
                  checked={form.hoofdleiding}
                  onCheckedChange={(checked: boolean) =>
                    setForm({ ...form, hoofdleiding: checked })
                  }
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
};

export default EditUser;