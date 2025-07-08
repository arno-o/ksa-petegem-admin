import PageLayout from "../pageLayout"
import { fetchEvents } from "~/utils/data"
import { useState, useEffect } from "react"
import type { Route } from "./+types/events"
import PrivateRoute from "~/context/PrivateRoute"

import type { Event } from "~/types"
import EventCard from "~/components/event-card"

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "KSA Admin - Activiteiten" },
    ];
}

export default function Events() {
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<Event[]>();

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

        loadEvents();
    }, []);

    return (
        <PrivateRoute>
            <PageLayout>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Activiteiten</h1>
                </div>

                {events?.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}

            </PageLayout>
        </PrivateRoute>
    );
}