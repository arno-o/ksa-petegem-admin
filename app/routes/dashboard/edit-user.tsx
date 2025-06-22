import type { Leiding, Group } from "~/types";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchLeidingById, updateLeiding, fetchGroups } from "~/utils/data";

import { toast } from "sonner";
import { ChevronDownIcon, SaveIcon, ChevronLeft } from "lucide-react"; // Import all necessary icons

import PageLayout from "../pageLayout";
import type { Route } from "./+types/edit-user";
import PrivateRoute from "~/context/PrivateRoute";
import FullScreenLoader from "~/components/full-screen-loader";

import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import FileUpload from "~/components/comp-544";
import { Calendar } from "~/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Leiding Bewerken" }];
}

const EditUser = () => {
    const [dobDatePicker, setDobDatePicker] = useState(false);
    const [leadDatePicker, setLeadDatePicker] = useState(false);

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

        werkgroepen: "",
        ksa_ervaring: "",
        ksa_betekenis: "",
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

                const allGroups = await fetchGroups();
                setGroepen(allGroups);

                // Convert geboortedatum string to a Date object
                const geboortedatumDate = fetchedLeiding.geboortedatum
                    ? new Date(fetchedLeiding.geboortedatum)
                    : undefined;

                const leidingSindsDate = fetchedLeiding.leiding_sinds
                    ? new Date(fetchedLeiding.leiding_sinds)
                    : undefined;

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
                    ksa_betekenis: fetchedLeiding.ksa_betekenis,
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
        try {
            await updateLeiding(leidingId, form);
            toast.success("Leiding succesvol bewerkt.");
            navigate("/leiding", { viewTransition: true });
        } catch (err) {
            toast.error("Er is iets foutgelopen bij het opslaan.");
            console.error(err);
        }
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
        <PrivateRoute>
            <PageLayout>
                <div className="flex flex-col gap-6 pb-20">
                    {/* Header */}
                    <header className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
                                <ChevronLeft className="h-5 w-5" />
                                <span className="sr-only">Terug</span>
                            </Button>
                            <h1 className="text-2xl font-bold">Profiel bewerken: {leiding.voornaam}</h1>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="voornaam">Voornaam</Label>
                                        <Input id="voornaam" value={form.voornaam} onChange={(e) => setForm({ ...form, voornaam: e.target.value })} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="familienaam">Familienaam</Label>
                                        <Input id="familienaam" value={form.familienaam} onChange={(e) => setForm({ ...form, familienaam: e.target.value })} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Geboortedatum</Label>
                                    <Popover open={dobDatePicker} onOpenChange={setDobDatePicker}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal">
                                                {form.geboortedatum ? form.geboortedatum.toLocaleDateString("nl-BE") : "Kies een datum"}
                                                <ChevronDownIcon className="ml-2 h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0">
                                            <Calendar
                                                mode="single"
                                                selected={form.geboortedatum}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setForm({ ...form, geboortedatum: date });
                                                        setDobDatePicker(false);
                                                    }
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
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
                                                <SelectValue placeholder="Kies ploeg" />
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
                                        <Popover open={leadDatePicker} onOpenChange={setLeadDatePicker}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between font-normal">
                                                    {form.leiding_sinds ? form.leiding_sinds.toLocaleDateString("nl-BE") : "Kies een datum"}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={form.leiding_sinds}
                                                    captionLayout="dropdown"
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            setForm({ ...form, leiding_sinds: date });
                                                            setLeadDatePicker(false);
                                                        }
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="werkgroepen">Werkgroepen</Label>
                                    <Input id="werkgroepen" value={form.werkgroepen} onChange={(e) => setForm({ ...form, werkgroepen: e.target.value })} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="ksa_ervaring">KSA Ervaring</Label>
                                    <Textarea id="ksa_ervaring" value={form.ksa_ervaring} className="resize-none"
                                        onChange={(e) => setForm({ ...form, ksa_ervaring: e.target.value })} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="ksa_betekenis">Wat betekent KSA voor jou?</Label>
                                    <Textarea id="ksa_betekenis" value={form.ksa_betekenis} className="resize-none"
                                        onChange={(e) => setForm({ ...form, ksa_betekenis: e.target.value })} />
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
                                <FileUpload />
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
        </PrivateRoute>
    );
};

export default EditUser;