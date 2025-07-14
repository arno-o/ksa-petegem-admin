import PageLayout from "../pageLayout";
import type { Route } from "./+types/events";
import PrivateRoute from "~/context/PrivateRoute";
import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchEvents, fetchActiveGroups, createEvent, deleteEvent, updateEvent } from "~/utils/data";

import type { Event, Group } from "~/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { Edit, Trash2, MapPin, Calendar as CalendarIcon, Clock, MoreHorizontal } from "lucide-react";
import { Input } from "~/components/ui/input";
import { type Option } from "~/components/ui/multiselect";
import { toast } from "sonner";
import { format } from "date-fns";
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
import { EventDialog } from "~/components/event-dialogs";

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

function useEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchEvents();
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
                    value: String(g.id),
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

export function meta({ }: Route.MetaArgs) {
    return [{ title: "KSA Admin - Activiteiten" }];
}

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
                target_groups: form.target_groups,
                date_start: form.date_start ? format(form.date_start, 'yyyy-MM-dd') : "",
                date_end: form.date_end ? format(form.date_end, 'yyyy-MM-dd') : null,
                time_start: form.time_start,
                time_end: form.time_end || null,
            };

            await createEvent(newEventData);

            setIsCreateDialogOpen(false);
            setForm(INITIAL_FORM_STATE);
            setErrors({});
            toast.success("Activiteit succesvol aangemaakt!");

            await refreshEvents();
        } catch (error) {
            console.error("❌ Fout bij aanmaken activiteit:", error);
            toast.error("Er is een fout opgetreden bij het aanmaken van de activiteit.");
        }
    };

    const handleEditEvent = async () => {
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
    };

    const handleDeleteEvent = async (id: number) => {
        try {
            await deleteEvent(id);
            setEvents((prev) => prev.filter((event) => event.id !== id));
            toast.success("Activiteit succesvol verwijderd.");
        } catch (err) {
            console.error("Failed to delete event:", err);
            toast.error("Verwijderen mislukt. Probeer opnieuw.");
        }
    };

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
                accessorKey: "date_start",
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
                accessorKey: "time_start",
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
                    const targetGroupIds: number[] = Array.isArray(row.original.target_groups)
                        ? row.original.target_groups.map(Number)
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
        [allGroups, handleDeleteEvent]
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

                        <EventDialog
                            open={isCreateDialogOpen}
                            setOpen={(open) => {
                                setIsCreateDialogOpen(open);
                                if (open) {
                                    setForm(INITIAL_FORM_STATE);
                                    setErrors({});
                                }
                            }}
                            form={form}
                            setForm={setForm}
                            errors={errors}
                            setErrors={setErrors}
                            groupOptions={groupOptions}
                            TIME_OPTIONS={TIME_OPTIONS}
                            onSubmit={handleCreateEvent}
                        />

                        <EventDialog
                            open={editDialogOpen}
                            setOpen={(open) => {
                                setEditDialogOpen(open);
                                if (!open) {
                                    setForm(INITIAL_FORM_STATE);
                                    setErrors({});
                                    setEditingEvent(null);
                                }
                            }}
                            form={form}
                            setForm={setForm}
                            errors={errors}
                            setErrors={setErrors}
                            groupOptions={groupOptions}
                            TIME_OPTIONS={TIME_OPTIONS}
                            onSubmit={handleEditEvent}
                            isEdit
                        />
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