import PageLayout from "../pageLayout"
import { fetchEvents, fetchActiveGroups, createEvent } from "~/utils/data"
import { useState, useEffect } from "react"
import type { Route } from "./+types/events"
import PrivateRoute from "~/context/PrivateRoute"

import type { Event, Group } from "~/types"
import EventCard from "~/components/event-card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Plus } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import MultipleSelector, { type Option }  from "~/components/ui/multiselect"

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "KSA Admin - Activiteiten" },
    ];
}

export default function Events() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<Event[]>();
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        target_groups: [] as string[],
    });
    const [groupOptions, setGroupOptions] = useState<Option[]>([]);

    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);
            try {
                const data = await fetchEvents();
                setEvents(data);
            } catch (err) {
                console.error("Failed to fetch groups:", err);
            } finally {
                setLoading(false);
            }
        };

        const loadGroups = async () => {
            try {
                const groups: Group[] = await fetchActiveGroups();
                const options: Option[] = groups.map((g) => ({
                    value: g.id.toString(),
                    label: g.naam,
                }));
                setGroupOptions(options);
            } catch (err) {
                console.error("Fout bij laden van groepen:", err);
            }
        };

        loadEvents();
        loadGroups();
    }, []);

    const handleCreate = async () => {
        try {
            const newEvent = {
                title: form.title.trim(),
                description: form.description.trim(),
                location: form.location.trim(),
                target_groups: form.target_groups, // send as-is for json field
            };

            await createEvent(newEvent);

            setOpen(false);
            setForm({ title: "", description: "", location: "", target_groups: [] });

            const updated = await fetchEvents();
            setEvents(updated);
        } catch (error) {
            console.error("❌ Fout bij aanmaken activiteit:", error);
        }
    };

    const handleDeleteEvent = (id: number) => {
        setEvents((prev) => prev?.filter((event) => event.id !== id));
    };

    return (
        <PrivateRoute>
            <PageLayout>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Activiteiten</h1>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" />Nieuwe activiteit</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Nieuwe activiteit</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="title" className="text-right">
                                        Titel
                                    </Label>
                                    <Input
                                        id="title"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="description" className="text-right">
                                        Beschrijving
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="location" className="text-right">
                                        Locatie
                                    </Label>
                                    <Input
                                        id="location"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="groups" className="text-right">
                                        Groepen
                                    </Label>
                                    <MultipleSelector
                                        value={groupOptions.filter(opt => form.target_groups.includes(opt.value))}
                                        onChange={(selected) =>
                                            setForm({
                                                ...form,
                                                target_groups: selected.map((option) => option.value),
                                            })
                                        }
                                        defaultOptions={groupOptions}
                                        hidePlaceholderWhenSelected
                                        emptyIndicator={<p className="text-center text-sm">Geen resultaten gevonden</p>}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Annuleer
                                    </Button>
                                </DialogClose>
                                <Button type="submit" onClick={handleCreate}>Activiteit aanmaken</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="px-2">
                    {events?.map((event) => (
                        <EventCard key={event.id} event={event} onDelete={handleDeleteEvent} />
                    ))}
                </div>

            </PageLayout>
        </PrivateRoute>
    );
}