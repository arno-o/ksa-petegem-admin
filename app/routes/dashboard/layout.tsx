import { redirect, Outlet } from "react-router";
import { createSupabaseServerClient } from "~/utils/supabase.server";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw redirect("/login", { headers });
  }

  return new Response(null, { headers });
}

// Don't re-run this loader on every client navigation
export function shouldRevalidate() {
  return false;
}

export default function DashboardLayout() {
  return <Outlet />;
}
