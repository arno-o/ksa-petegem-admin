import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { toast } from "sonner";
import { ChevronDownIcon, ChevronLeft, SaveIcon } from "lucide-react";

import PageLayout from "../../pageLayout";
import FileUpload from "~/components/allround/file-upload";
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

import { fetchActiveGroups, fetchLeidingById, updateLeiding } from "~/utils/data";

import type { Leiding, Group } from "~/types";
import type { Route } from "../users/+types/edit";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Leiding Bewerken" }];
}

const EditUser = () => {
    const [dobDatePicker, setDobDatePicker] = useState(false);
    const navigate = useNavigate();
    const { leidingId } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [leiding, setLeiding] = useState<Leiding | null>(null);
    const [groepen, setGroepen] = useState<Group[]>([]);

    const [form, setForm] = useState({
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
        leiding_sinds: undefined as Date | undefined,
        geboortedatum: undefined as Date | undefined,
    });

    useEffect(() => {
        const getLeiding = async () => {
            if (!leidingId) {
                setError("Leiding ID is missing.");
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const fetchedLeiding = await fetchLeidingById(leidingId);
                setLeiding(fetchedLeiding);

                const allGroups = await fetchActiveGroups();
                setGroepen(allGroups);

                const parseDateSafely = (dateString: string | undefined): Date | undefined => {
                    if (!dateString) return undefined;
                    const [year, month, day] = dateString.split('-').map(Number);
                    return new Date(Date.UTC(year, month - 1, day));
                };

                const geboortedatumDate = parseDateSafely(fetchedLeiding.geboortedatum);
                const leidingSindsDate = parseDateSafely(fetchedLeiding.leiding_sinds);

                setForm({
                    voornaam: fetchedLeiding.voornaam,
                    familienaam: fetchedLeiding.familienaam,
                    leiding_sinds: leidingSindsDate,
                    geboortedatum: geboortedatumDate,
                    studies: fetchedLeiding.studies,
                    werk: fetchedLeiding.werk,
                    leidingsploeg: fetchedLeiding.leidingsploeg,
                    werkgroepen: fetchedLeiding.werkgroepen,
                    hoofdleiding: fetchedLeiding.hoofdleiding,
                    trekker: fetchedLeiding.trekker,
                    ksa_ervaring: fetchedLeiding.ksa_ervaring,
                    foto_url: fetchedLeiding.foto_url,
                });
            } catch (err) {
                setError("Dit profiel bestaat niet");
                toast.error("Fout bij het laden van dit profiel.");
            } finally {
                setLoading(false);
            }
        };

        getLeiding();
    }, [leidingId]);

    const handleSave = async () => {
        if (!leidingId) {
            toast.error("Geen Leiding ID gevonden om op te slaan.");
            return;
        }

        const formToSave = {
            ...form,
            geboortedatum: form.geboortedatum ? form.geboortedatum.toISOString().split('T')[0] : null,
            leiding_sinds: form.leiding_sinds ? `${form.leiding_sinds.getUTCFullYear()}-09-01` : null, // Changed this line
        };

        try {
            await updateLeiding(leidingId, formToSave);
            toast.success("Leiding succesvol bewerkt.");
            navigate("/leiding/actief", { viewTransition: true });
        } catch (err) {
            toast.error("Er is iets foutgelopen bij het opslaan.");
            console.error(err);
        }
    };

    const currentYear = new Date().getFullYear();
    const startYear = 2015;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    const handleLeidingSindsYearChange = (yearString: string) => {
        const year = parseInt(yearString, 10);
        // When setting the year, also ensure it's treated as UTC to avoid local timezone issues if saved as a date
        const newDate = new Date(Date.UTC(year, 8, 1)); // Month 8 is September (0-indexed)
        setForm({ ...form, leiding_sinds: newDate });
    };

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
            <div className="flex flex-col gap-6 pb-20">
                {/* Header */}
                <header className="flex flex-col gap-3 md:justify-between md:items-center md:flex-row">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
                            <ChevronLeft className="h-5 w-5" />
                            <span className="sr-only">Terug</span>
                        </Button>
                        <h3 className="text-2xl font-semibold tracking-tight">Profiel: {leiding.voornaam} {leiding.familienaam}</h3>
                    </div>
                    <Button onClick={handleSave}>
                        <SaveIcon className="mr-2 h-4 w-4" />
                        Opslaan
                    </Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Persoonlijke gegevens */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">Persoonlijke gegevens</h2>
                                <p className="text-sm text-muted-foreground">Naam en geboortedatum van de leiding.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="voornaam">Voornaam</Label>
                                    <Input id="voornaam" value={form.voornaam} onChange={(e) => setForm({ ...form, voornaam: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="familienaam">Familienaam</Label>
                                    <Input id="familienaam" value={form.familienaam} onChange={(e) => setForm({ ...form, familienaam: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>Geboortedatum</Label>
                                    <Popover open={dobDatePicker} onOpenChange={setDobDatePicker}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal">
                                                {/* Display the date correctly, potentially using UTC methods */}
                                                {form.geboortedatum ? new Date(form.geboortedatum).toLocaleDateString("nl-BE", { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }) : "Kies een datum"}
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
                                                        // When selecting, create a date object that represents the selected day in UTC
                                                        const newDateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
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
                                <p className="text-sm text-muted-foreground">Wat studeert of werkt deze leiding momenteel?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="studies">Studies</Label>
                                    <Input id="studies" value={form.studies} onChange={(e) => setForm({ ...form, studies: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="werk">Werk</Label>
                                    <Input id="werk" value={form.werk} onChange={(e) => setForm({ ...form, werk: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* KSA Informatie */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">KSA Informatie</h2>
                                <p className="text-sm text-muted-foreground">Informatie over de rol binnen de leidingsploeg en ervaringen.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <Label>Leidingsploeg</Label>
                                    <Select
                                        onValueChange={(value) => setForm({ ...form, leidingsploeg: value })}
                                        defaultValue={String(form.leidingsploeg)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Kies groep" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groepen.sort((a, b) => a.id - b.id).map((g) => (
                                                <SelectItem key={g.id} value={String(g.id)}>{g.naam}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Leiding sinds</Label>
                                    <Select
                                        onValueChange={handleLeidingSindsYearChange}
                                        value={form.leiding_sinds ? String(form.leiding_sinds.getUTCFullYear()) : ""} // Use UTC year for display
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
                                <Input id="werkgroepen" value={form.werkgroepen} onChange={(e) => setForm({ ...form, werkgroepen: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="ksa_ervaring">Beste KSA Ervaring</Label>
                                <Textarea id="ksa_ervaring" value={form.ksa_ervaring} className="resize-none"
                                    onChange={(e) => setForm({ ...form, ksa_ervaring: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Side Panel */}
                    <aside className="space-y-8">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">Profielfoto</h2>
                                <p className="text-sm text-muted-foreground">Upload een recente foto van deze leiding.</p>
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
                                <p className="text-sm text-muted-foreground">Is deze persoon trekker of hoofdleiding?</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="trekker">Trekker</Label>
                                <Switch
                                    id="trekker"
                                    checked={form.trekker}
                                    onCheckedChange={(checked: boolean) => setForm({ ...form, trekker: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="hoofdleiding">Hoofdleiding</Label>
                                <Switch
                                    id="hoofdleiding"
                                    checked={form.hoofdleiding}
                                    onCheckedChange={(checked: boolean) => setForm({ ...form, hoofdleiding: checked })}
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