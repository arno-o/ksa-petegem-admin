import { useNavigate } from "react-router";
import type { Event, Group } from "~/types";
import { fetchGroupsByEventID, deleteEvent } from "~/utils/data";

import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle
} from "~/components/ui/dialog";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Edit, Trash2, MapPin, Calendar, Clock } from "lucide-react";

interface EventCardProps {
    event: Event;
    onDelete?: (id: number) => void;
}

const EventCard = ({ event, onDelete }: EventCardProps) => {
    const colorMap: Record<string, string> = {
        yellow: "bg-yellow-500 dark:bg-yellow-400",
        blue: "bg-blue-500 dark:bg-blue-400",
        green: "bg-green-500 dark:bg-green-400",
        purple: "bg-purple-500 dark:bg-purple-400",
        red: "bg-red-500 dark:bg-red-400",
        orange: "bg-orange-500 dark:bg-orange-400",
        lime: "bg-lime-500 dark:bg-lime-400",
        rose: "bg-rose-500 dark:bg-rose-400",
    };

    let navigate = useNavigate();

    const [groups, setGroups] = useState<Group[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const tableIconStyle = `w-5 text-neutral-400 dark:text-neutral-600`;

    useEffect(() => {
        const fetchGroups = async () => {
            const data = await fetchGroupsByEventID(event.id);
            setGroups(data);
        }

        fetchGroups();
    });

    const handleDelete = async () => {
        try {
            await deleteEvent(event.id);
            setDialogOpen(false);
            onDelete?.(event.id);
        } catch (err) {
            toast.error("Verwijderen mislukt. Probeer opnieuw.");
        }
    };
    
    return (
        <>
            <div className="flex items-center justify-between border-b-1 py-6">
                <div className="flex flex-col w-40">
                    <h3 className="text-xl">{event.title}</h3>
                    <p className="truncate text-neutral-400">{event.description}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className={tableIconStyle}/>
                    <div className="flex gap-1">
                        {event.date_start ? new Date(event.date_start).toLocaleDateString('nl-BE') : 'Geen datum'}
                        {event.date_end && event.date_start !== event.date_end ?
                            <>
                                <span>-</span>
                                {new Date(event.date_end).toLocaleDateString('nl-BE')}
                            </>
                            : null}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Clock className={tableIconStyle} />
                    {event.time_start ? new Date(`1970-01-01T${event.time_start}Z`).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : 'Geen tijd'}
                    {event.time_end ?
                        <>
                            <span>-</span>
                            {new Date(`1970-01-01T${event.time_end}Z`).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                        </>
                        : null}
                </div>

                <div className="flex items-center gap-2">
                    <MapPin className={tableIconStyle}/>
                    {event.location}
                </div>

                <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                    {groups?.map((group) => (
                        <div
                            key={group.id}
                            className={`h-6 w-6 ${colorMap[group.color] ?? "bg-gray-300"} ring-background rounded-full ring-2`}
                        ></div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="size-8" onClick={() => navigate(`edit/${event.id}`, { viewTransition: true     })}>
                        <Edit />
                    </Button>
                    <Button variant="destructive" size="icon" className="size-8" onClick={() => setDialogOpen(true)}>
                        <Trash2 />
                    </Button>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Weet je het zeker?</DialogTitle>
                        <DialogDescription>
                            Je staat op het punt om dit evenement permanent te verwijderen.
                            Deze actie kan niet ongedaan worden gemaakt.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Annuleren
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Verwijder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default EventCard;