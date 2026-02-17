import { redirect } from "react-router";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import type { Route } from "./+types/reroute";

export async function loader({ request }: Route.LoaderArgs) {
    const { supabase, headers } = createSupabaseServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        throw redirect("/berichten", { headers });
    } else {
        throw redirect("/login", { headers });
    }
}

// This component should never render because the loader always redirects
export default function Reroute() {
    return null;
}