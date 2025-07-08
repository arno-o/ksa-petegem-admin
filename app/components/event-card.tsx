import { useNavigate } from "react-router";
import type { Event, Group } from "~/types";
import { fetchGroupsByEventID } from "~/utils/data";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Edit, Trash2, MapPin } from "lucide-react";

interface EventCardProps {
    event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
    const colorMap: Record<string, string> = {
        yellow: "bg-yellow-500",
        blue: "bg-blue-500",
        green: "bg-green-500",
        purple: "bg-purple-500",
        red: "bg-red-500",
        orange: "bg-orange-500",
        lime: "bg-lime-500",
        rose: "bg-rose-500",
    };

    let navigate = useNavigate();

    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        const fetchGroups = async () => {
            const data = await fetchGroupsByEventID(event.id);
            setGroups(data);
        }

        fetchGroups();
    })

    return (
        <>
            <div className="flex items-center justify-between border-b-1 pb-6 px-6">
                <div className="flex flex-col w-40">
                    <h3 className="text-xl">{event.title}</h3>
                    <p className="text-sm truncate text-stone-500 dark:text-stone-300">{event.description}</p>
                </div>

                <div className="flex items-center gap-2">
                    <MapPin />
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
                    <Button variant="outline" size="icon" className="size-8">
                        <Edit />
                    </Button>
                    <Button variant="destructive" size="icon" className="size-8">
                        <Trash2 />
                    </Button>
                </div>
            </div>
        </>
    )
}

export default EventCard;