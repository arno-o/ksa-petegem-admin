import PageLayout from "../pageLayout";
import type { Route } from "./+types/events";
import PrivateRoute from "~/context/PrivateRoute";
import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchEvents, fetchActiveGroups, createEvent, deleteEvent, updateEvent } from "~/utils/data";

import type { Event, Group } from "~/types";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Plus, Edit, Trash2, MapPin, Calendar as CalendarIcon, Clock, MoreHorizontal } from "lucide-react";
import { Input } from "~/components/ui/input";
import MultipleSelector, { type Option } from "~/components/ui/multiselect";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "~/lib/utils";

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

// --- Constants & Utility Functions (Move to a separate 'utils' file if growing) ---
const COLOR_MAP: Record<string, string> = {
    yellow: "bg-yellow-500 dark:bg-yellow-400",
    blue: "bg-blue-500 dark:bg-blue-400",
    green: "bg-green-500 dark:bg-green-400",
    purple: "bg-purple-500 dark:bg-purple-400",
    red: "bg-red-500 dark:bg-red-400",
    orange: "bg-orange-500 dark:bg-orange-400",
    lime: "bg-lime-500 dark:bg-lime-400",
    rose: "bg-rose-500 dark:bg-rose-400",
};

const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const h = String(hour).padStart(2, '0');
            const m = String(minute).padStart(2, '0');
            times.push(`${h}:${m}`);
        }
    }
    return times;
};

const TIME_OPTIONS = generateTimeOptions();

// --- Custom Hooks ---

/**
 * Custom hook to fetch and manage events.
 */
function useEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchEvents();
                // Map the incoming data to ensure date_start and date_end are Date objects
                const processedData: Event[] = data.map(event => ({
                    ...event,
                    date_start: event.date_start ? new Date(event.date_start) : null,
                    date_end: event.date_end ? new Date(event.date_end) : null,
                }));
                setEvents(processedData);
            } catch (err) {
                console.error("Failed to fetch events:", err);
                toast.error("Fout bij het laden van activiteiten.");
            } finally {
                setLoadingEvents(false);
            }
        };
        load();
    }, []);

    const refreshEvents = useCallback(async () => {
        setLoadingEvents(true);
        try {
            const data = await fetchEvents();
            const processedData: Event[] = data.map(event => ({
                ...event,
                date_start: event.date_start ? new Date(event.date_start) : null,
                date_end: event.date_end ? new Date(event.date_end) : null,
            }));
            setEvents(processedData);
        } catch (err) {
            console.error("Failed to refresh events:", err);
            toast.error("Fout bij het verversen van activiteiten.");
        } finally {
            setLoadingEvents(false);
        }
    }, []);

    return { events, setEvents, loadingEvents, refreshEvents };
}

/**
 * Custom hook to fetch and manage active groups.
 */
function useActiveGroups() {
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [groupOptions, setGroupOptions] = useState<Option[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const groups: Group[] = await fetchActiveGroups();
                setAllGroups(groups);
                const options: Option[] = groups.map((g) => ({
                    value: String(g.id), // Ensure value is a string for MultipleSelector
                    label: g.naam,
                }));
                setGroupOptions(options);
            } catch (err) {
                console.error("Failed to fetch groups:", err);
                toast.error("Fout bij het laden van groepen.");
            } finally {
                setLoadingGroups(false);
            }
        };
        load();
    }, []);

    return { allGroups, groupOptions, loadingGroups };
}

// --- Event Form Initial State & Type ---
interface EventFormState {
    title: string;
    description: string;
    location: string;
    target_groups: number[];
    date_start?: Date;
    date_end?: Date;
    time_start: string;
    time_end: string;
}

const INITIAL_FORM_STATE: EventFormState = {
    title: "",
    description: "",
    location: "",
    target_groups: [],
    date_start: undefined,
    date_end: undefined,
    time_start: "",
    time_end: "",
};

// --- Meta for the route ---
export function meta({ }: Route.MetaArgs) {
    return [{ title: "KSA Admin - Activiteiten" }];
}

// --- Main Events Component ---
export default function Events() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [form, setForm] = useState<EventFormState>(INITIAL_FORM_STATE);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const { events, setEvents, loadingEvents, refreshEvents } = useEvents();
    const { allGroups, groupOptions, loadingGroups } = useActiveGroups();

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);


    const validateForm = useCallback((): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!form.title.trim()) {
            newErrors.title = "Titel is vereist.";
        }
        if (!form.location.trim()) {
            newErrors.location = "Locatie is vereist.";
        }
        if (form.target_groups.length === 0) {
            newErrors.target_groups = "Selecteer ten minste één groep.";
        }
        if (!form.date_start) {
            newErrors.date_start = "Startdatum is vereist.";
        }
        if (!form.time_start.trim()) {
            newErrors.time_start = "Starttijd is vereist.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form]);

    const handleCreateEvent = async () => {
        if (!validateForm()) {
            toast.error("Vul alle verplichte velden in.");
            return;
        }

        try {
            const newEventData = {
                title: form.title.trim(),
                description: form.description.trim(),
                location: form.location.trim(),
                target_groups: form.target_groups, // This is the crucial fix: keep as numbers
                date_start: form.date_start ? format(form.date_start, 'yyyy-MM-dd') : "",
                date_end: form.date_end ? format(form.date_end, 'yyyy-MM-dd') : null,
                time_start: form.time_start,
                time_end: form.time_end || null,
            };

            await createEvent(newEventData);

            setIsCreateDialogOpen(false);
            setForm(INITIAL_FORM_STATE); // Reset form to initial state
            setErrors({}); // Clear any validation errors
            toast.success("Activiteit succesvol aangemaakt!");

            await refreshEvents(); // Re-fetch all events to update the table
        } catch (error) {
            console.error("❌ Fout bij aanmaken activiteit:", error);
            toast.error("Er is een fout opgetreden bij het aanmaken van de activiteit.");
        }
    };

    const handleDeleteEvent = async (id: number) => {
        try {
            await deleteEvent(id);
            setEvents((prev) => prev.filter((event) => event.id !== id)); // Optimistic UI update
            toast.success("Activiteit succesvol verwijderd.");
        } catch (err) {
            console.error("Failed to delete event:", err);
            toast.error("Verwijderen mislukt. Probeer opnieuw.");
        }
    };

    // --- DataTable Logic ---
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const columns: ColumnDef<Event>[] = useMemo(
        () => [
            {
                accessorKey: "title",
                header: "Titel",
                cell: ({ row }) => (
                    <div className="font-medium">{row.getValue("title")}</div>
                ),
            },
            {
                accessorKey: "location",
                header: "Locatie",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {row.getValue("location")}
                    </div>
                ),
            },
            {
                accessorKey: "date_start", // Use date_start as accessorKey for sorting/filtering consistency
                header: "Datum",
                cell: ({ row }) => {
                    const event = row.original;
                    const startDate = event.date_start ? new Date(event.date_start).toLocaleDateString('nl-BE') : 'Geen datum';
                    const endDate = event.date_end && event.date_start?.toDateString() !== event.date_end.toDateString()
                        ? new Date(event.date_end).toLocaleDateString('nl-BE')
                        : null;
                    return (
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            {startDate} {endDate && `- ${endDate}`}
                        </div>
                    );
                },
            },
            {
                accessorKey: "time_start", // Use time_start as accessorKey
                header: "Tijd",
                cell: ({ row }) => {
                    const event = row.original;
                    const startTime = event.time_start
                        ? new Date(`1970-01-01T${event.time_start}Z`).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
                        : 'Geen tijd';
                    const endTime = event.time_end
                        ? new Date(`1970-01-01T${event.time_end}Z`).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
                        : null;
                    return (
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {startTime} {endTime && `- ${endTime}`}
                        </div>
                    );
                },
            },
            {
                accessorKey: "target_groups",
                header: "Groepen",
                cell: ({ row }) => {
                    // Ensure targetGroupIds is treated as an array of numbers
                    const targetGroupIds: number[] = Array.isArray(row.original.target_groups)
                        ? row.original.target_groups.map(Number) // Explicitly map to Number just in case
                        : [];

                    return (
                        <div className="flex -space-x-2">
                            {targetGroupIds.map((groupId) => {
                                const group = allGroups.find(g => g.id === groupId);
                                if (group) {
                                    return (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div key={group.id}
                                                    className={`h-6 w-6 rounded-full ring-2 ring-background ${COLOR_MAP[group.color] ?? "bg-gray-300"}`}
                                                ></div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {group.naam}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    );
                },
            },
            {
                id: "actions",
                enableHiding: false,
                cell: ({ row }) => {
                    const event = row.original;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => {
                                        const formatTime = (timeStr: string | null | undefined) =>
                                            timeStr?.slice(0, 5) ?? ""; // "09:00:00" → "09:00"

                                        setForm({
                                            title: event.title,
                                            description: event.description || "",
                                            location: event.location,
                                            target_groups: event.target_groups.map(Number),
                                            date_start: event.date_start ? new Date(event.date_start) : undefined,
                                            date_end: event.date_end ? new Date(event.date_end) : undefined,
                                            time_start: formatTime(event.time_start),
                                            time_end: formatTime(event.time_end),
                                        });

                                        setEditingEvent(event);
                                        setEditDialogOpen(true);
                                    }}
                                >
                                    <Edit className="mr-2 h-4 w-4" /> Bewerken
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" /> Verwijderen
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Je staat op het punt om dit evenement permanent te verwijderen.
                                                Deze actie kan niet ongedaan worden gemaakt.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-red-600 hover:bg-red-700">
                                                Verwijder
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [allGroups, handleDeleteEvent] // Dependency on allGroups and handleDeleteEvent
    );

    const table = useReactTable({
        data: events,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <PrivateRoute>
            <PageLayout>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-6 w-full">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                        Activiteiten
                    </h1>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-fit md:ml-auto">
                        <Input
                            placeholder="Zoek op titel..."
                            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
                            className="w-full sm:w-64"
                        />

                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow duration-200">
                                    <Plus className="mr-2 h-4 w-4" />Nieuwe activiteit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl max-h-[90vh]"> {/* Added overflow-y-auto and max-h */}
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">Nieuwe activiteit</DialogTitle>
                                    <DialogDescription>
                                        Vul alle velden in om een nieuwe activiteit aan te maken.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="title">Titel</Label>
                                        <Input
                                            id="title"
                                            value={form.title}
                                            onChange={(e) => {
                                                setForm((prev) => ({ ...prev, title: e.target.value }));
                                                setErrors((prev) => ({ ...prev, title: "" }));
                                            }}
                                            className={`${errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="location">Locatie</Label>
                                        <Input
                                            id="location"
                                            value={form.location}
                                            onChange={(e) => {
                                                setForm((prev) => ({ ...prev, location: e.target.value }));
                                                setErrors((prev) => ({ ...prev, location: "" }));
                                            }}
                                            className={`${errors.location ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        />
                                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="date_start">Startdatum</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !form.date_start && "text-muted-foreground",
                                                            errors.date_start ? "border-red-500 focus-visible:ring-red-500" : ""
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {form.date_start ? format(form.date_start, "PPP") : <span>Kies een datum</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={form.date_start}
                                                        onSelect={(date) => {
                                                            setForm((prev) => ({ ...prev, date_start: date ?? undefined }));
                                                            setErrors((prev) => ({ ...prev, date_start: "" }));
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.date_start && <p className="text-red-500 text-sm mt-1">{errors.date_start}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="time_start">Starttijd</Label>
                                            <Select
                                                value={form.time_start}
                                                onValueChange={(value) => {
                                                    setForm((prev) => ({ ...prev, time_start: value }));
                                                    setErrors((prev) => ({ ...prev, time_start: "" }));
                                                }}
                                            >
                                                <SelectTrigger className={cn(
                                                    "w-full",
                                                    errors.time_start ? "border-red-500 focus-visible:ring-red-500" : ""
                                                )}>
                                                    <SelectValue placeholder="Kies een tijd" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_OPTIONS.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.time_start && <p className="text-red-500 text-sm mt-1">{errors.time_start}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="date_end">Einddatum (optioneel)</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !form.date_end && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {form.date_end ? format(form.date_end, "PPP") : <span>Kies een datum</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={form.date_end}
                                                        onSelect={(date) => setForm((prev) => ({ ...prev, date_end: date ?? undefined }))}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="time_end">Eindtijd (optioneel)</Label>
                                            <Select
                                                value={form.time_end}
                                                onValueChange={(value) => setForm((prev) => ({ ...prev, time_end: value }))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Kies een tijd" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_OPTIONS.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="groups">Groepen</Label>
                                        <MultipleSelector
                                            value={groupOptions.filter(opt => form.target_groups.includes(Number(opt.value)))}
                                            onChange={(selected) => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    target_groups: selected.map((option) => Number(option.value)),
                                                }));
                                                setErrors((prev) => ({ ...prev, target_groups: "" }));
                                            }}
                                            defaultOptions={groupOptions}
                                            hidePlaceholderWhenSelected
                                            emptyIndicator={<p className="text-center text-sm">Geen resultaten gevonden</p>}
                                            className={`${errors.target_groups ? "border border-red-500 focus-visible:ring-red-500" : ""}`}
                                        />
                                        {errors.target_groups && <p className="text-red-500 text-sm mt-1">{errors.target_groups}</p>}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Annuleer
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        onClick={handleCreateEvent}
                                        disabled={loadingEvents || loadingGroups} // Disable if data is still loading
                                    >
                                        Activiteit aanmaken
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                            <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">Bewerk activiteit</DialogTitle>
                                    <DialogDescription>Pas de details van deze activiteit aan.</DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="title">Titel</Label>
                                        <Input
                                            id="title"
                                            value={form.title}
                                            onChange={(e) => {
                                                setForm((prev) => ({ ...prev, title: e.target.value }));
                                                setErrors((prev) => ({ ...prev, title: "" }));
                                            }}
                                            className={`${errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="location">Locatie</Label>
                                        <Input
                                            id="location"
                                            value={form.location}
                                            onChange={(e) => {
                                                setForm((prev) => ({ ...prev, location: e.target.value }));
                                                setErrors((prev) => ({ ...prev, location: "" }));
                                            }}
                                            className={`${errors.location ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        />
                                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="date_start">Startdatum</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !form.date_start && "text-muted-foreground",
                                                            errors.date_start ? "border-red-500 focus-visible:ring-red-500" : ""
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {form.date_start ? format(form.date_start, "PPP") : <span>Kies een datum</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={form.date_start}
                                                        onSelect={(date) => {
                                                            setForm((prev) => ({ ...prev, date_start: date ?? undefined }));
                                                            setErrors((prev) => ({ ...prev, date_start: "" }));
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.date_start && <p className="text-red-500 text-sm mt-1">{errors.date_start}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="time_start">Starttijd</Label>
                                            <Select
                                                value={form.time_start}
                                                onValueChange={(value) => {
                                                    setForm((prev) => ({ ...prev, time_start: value }));
                                                    setErrors((prev) => ({ ...prev, time_start: "" }));
                                                }}
                                            >
                                                <SelectTrigger className={cn(
                                                    "w-full",
                                                    errors.time_start ? "border-red-500 focus-visible:ring-red-500" : ""
                                                )}>
                                                    <SelectValue placeholder="Kies een tijd" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_OPTIONS.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.time_start && <p className="text-red-500 text-sm mt-1">{errors.time_start}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="date_end">Einddatum (optioneel)</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !form.date_end && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {form.date_end ? format(form.date_end, "PPP") : <span>Kies een datum</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={form.date_end}
                                                        onSelect={(date) => setForm((prev) => ({ ...prev, date_end: date ?? undefined }))}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="time_end">Eindtijd (optioneel)</Label>
                                            <Select
                                                value={form.time_end}
                                                onValueChange={(value) => setForm((prev) => ({ ...prev, time_end: value }))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Kies een tijd" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_OPTIONS.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="groups">Groepen</Label>
                                        <MultipleSelector
                                            value={groupOptions.filter(opt => form.target_groups.includes(Number(opt.value)))}
                                            onChange={(selected) => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    target_groups: selected.map((option) => Number(option.value)),
                                                }));
                                                setErrors((prev) => ({ ...prev, target_groups: "" }));
                                            }}
                                            defaultOptions={groupOptions}
                                            hidePlaceholderWhenSelected
                                            emptyIndicator={<p className="text-center text-sm">Geen resultaten gevonden</p>}
                                            className={`${errors.target_groups ? "border border-red-500 focus-visible:ring-red-500" : ""}`}
                                        />
                                        {errors.target_groups && <p className="text-red-500 text-sm mt-1">{errors.target_groups}</p>}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Annuleer
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        onClick={async () => {
                                            if (!validateForm()) {
                                                toast.error("Vul alle verplichte velden in.");
                                                return;
                                            }

                                            try {
                                                const updates = {
                                                    title: form.title.trim(),
                                                    description: form.description.trim(),
                                                    location: form.location.trim(),
                                                    target_groups: form.target_groups,
                                                    date_start: form.date_start ? format(form.date_start, "yyyy-MM-dd") : null,
                                                    date_end: form.date_end ? format(form.date_end, "yyyy-MM-dd") : null,
                                                    time_start: form.time_start,
                                                    time_end: form.time_end || null,
                                                };

                                                if (editingEvent) {
                                                    await updateEvent(editingEvent.id, updates);
                                                    toast.success("Activiteit bijgewerkt!");
                                                    setEditDialogOpen(false);
                                                    setEditingEvent(null);
                                                    setForm(INITIAL_FORM_STATE);
                                                    await refreshEvents();
                                                }
                                            } catch (error) {
                                                console.error("❌ Fout bij bewerken:", error);
                                                toast.error("Bijwerken mislukt.");
                                            }
                                        }}
                                    >
                                        Opslaan
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {loadingEvents ? (
                    <div className="text-center py-8">Laden van activiteiten...</div>
                ) : (
                    <>
                        {table.getRowModel().rows?.length ? (
                            <>
                                {/* Desktop table */}
                                <div className="hidden md:block rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => (
                                                        <TableHead key={header.id}>
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {table.getRowModel().rows.map((row) => (
                                                <TableRow key={row.id}>
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile cards */}
                                <div className="md:hidden flex flex-col gap-4">
                                    {table.getRowModel().rows.map((row) => {
                                        const event = row.original;
                                        const groupBadges = event.target_groups.map((id) => {
                                            const group = allGroups.find((g) => g.id === id);
                                            return group ? (
                                                <div
                                                    key={group.id}
                                                    className={`h-5 w-5 rounded-full ${COLOR_MAP[group.color] ?? "bg-gray-300"}`}
                                                    title={group.naam}
                                                />
                                            ) : null;
                                        });

                                        return (
                                            <div
                                                key={event.id}
                                                className="bg-card border rounded-lg p-4 shadow-sm flex flex-col gap-2"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h2 className="text-lg font-semibold leading-tight">{event.title}</h2>
                                                        <p className="text-sm text-muted-foreground">{event.location}</p>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    const formatTime = (timeStr: string | null | undefined) =>
                                                                        timeStr?.slice(0, 5) ?? ""; // "09:00:00" → "09:00"

                                                                    setForm({
                                                                        title: event.title,
                                                                        description: event.description || "",
                                                                        location: event.location,
                                                                        target_groups: event.target_groups.map(Number),
                                                                        date_start: event.date_start ? new Date(event.date_start) : undefined,
                                                                        date_end: event.date_end ? new Date(event.date_end) : undefined,
                                                                        time_start: formatTime(event.time_start),
                                                                        time_end: formatTime(event.time_end),
                                                                    });

                                                                    setEditingEvent(event);
                                                                    setEditDialogOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" /> Bewerken
                                                            </DropdownMenuItem>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                                                                        <Trash2 className="mr-2 h-4 w-4" /> Verwijderen
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Je staat op het punt om dit evenement permanent te verwijderen.
                                                                            Deze actie kan niet ongedaan worden gemaakt.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteEvent(event.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Verwijder
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <p className="text-md">
                                                    📅 {event.date_start?.toLocaleDateString("nl-BE")}
                                                    {event.date_end &&
                                                        event.date_start?.toDateString() !== event.date_end?.toDateString() &&
                                                        ` - ${event.date_end?.toLocaleDateString("nl-BE")}`}
                                                </p>

                                                <p className="text-md">
                                                    ⏰ {event.time_start}
                                                    {event.time_end && ` - ${event.time_end}`}
                                                </p>

                                                <div className="flex gap-1">{groupBadges}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <p className="text-center mt-10">Geen resultaten gevonden.</p>
                        )}
                    </>
                )}
            </PageLayout>
        </PrivateRoute>
    );
}