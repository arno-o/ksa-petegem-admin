// React and Hooks
import { useEffect, useState } from "react";

// UI Components (shadcn/ui or custom)
import LeidingCard from "~/components/cards/leiding-card";

// Context & Layout
import PageLayout from "../../pageLayout";
import PrivateRoute from "~/context/PrivateRoute";

// Data Utilities & Types
import { toast } from "sonner";
import type { Group, Leiding } from "~/types";
import type { Route } from "../users/+types/inactive";
import { fetchInactiveLeiding, fetchActiveGroups } from "~/utils/data";


export function meta({ }: Route.MetaArgs) {
  return [{ title: "KSA Admin - Leiding" }];
}

export default function Inactive() {
  const [loading, setLoading] = useState(false);
  const [leiding, setLeiding] = useState<Leiding[]>();
  const [groups, setGroups] = useState<Group[]>(); // Keep this to display group names for inactive leiding

  const COLOR_MAP: Record<string, string> = {
    yellow: "text-yellow-600 dark:text-yellow-300",
    blue: "text-blue-600 dark:text-blue-300",
    green: "text-green-600 dark:text-green-300",
    purple: "text-purple-600 dark:text-purple-300",
    red: "text-red-600 dark:text-red-300",
    orange: "text-orange-600 dark:text-orange-300",
    lime: "text-lime-600 dark:text-lime-300",
    rose: "text-rose-600 dark:text-rose-300",
  };

  const BADGE_BACKGROUND_COLOR_MAP: Record<string, string> = {
    yellow: "bg-yellow-50 dark:bg-yellow-900",
    blue: "bg-blue-50 dark:bg-blue-900",
    green: "bg-green-50 dark:bg-green-900",
    purple: "bg-purple-50 dark:bg-purple-900",
    red: "bg-red-50 dark:bg-red-900",
    orange: "bg-orange-50 dark:bg-orange-900",
    lime: "bg-lime-50 dark:bg-lime-900",
    rose: "bg-rose-50 dark:bg-rose-900",
  };

  const BADGE_BORDER_COLOR_MAP: Record<string, string> = {
    yellow: "border-yellow-200 dark:border-yellow-700",
    blue: "border-blue-200 dark:border-blue-700",
    green: "border-green-200 dark:border-green-700",
    purple: "border-purple-200 dark:border-purple-700",
    red: "border-red-200 dark:border-red-700",
    orange: "border-orange-200 dark:border-orange-700",
    lime: "border-lime-200 dark:border-lime-700",
    rose: "border-rose-200 dark:border-rose-700",
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const inactiveLeidingData = await fetchInactiveLeiding();
        setLeiding(inactiveLeidingData);
        const activeGroupsData = await fetchActiveGroups();
        setGroups(activeGroupsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error("Fout bij het laden van oud-leiding.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeleteLeiding = (id: number) => {
    setLeiding((prev) => prev?.filter((persoon) => persoon.id !== id));
  };

  const handleRestoreLeiding = (id: number) => {
    setLeiding((prev) => prev?.filter((persoon) => persoon.id !== id));
  };


  return (
    <PrivateRoute>
      <PageLayout>
        <header className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold tracking-tight">Oudleiding</h3>
        </header>

        <div className="rounded-lg border bg-background/50 dark:bg-background/30 shadow-md overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_0.8fr] gap-4 p-4 text-sm font-semibold text-muted-foreground border-b border-border bg-accent/20 dark:bg-accent/10">
            <div>Persoon</div>
            <div className="flex justify-end">Acties</div>
          </div>

          <div>
            {loading && <div className="p-4 text-center text-muted-foreground">Laden...</div>}
            {!loading && leiding?.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                Geen oud-leiding gevonden.
              </div>
            )}
            {!loading && leiding?.map((person) => {
              const group = groups?.find(g => g.id === person.leidingsploeg);

              return (
                <LeidingCard
                  key={person.id}
                  leiding={person}
                  onDelete={handleDeleteLeiding}
                  onRestore={handleRestoreLeiding}
                  isInactiveMode={true}
                />
              );
            })}
          </div>
        </div>
      </PageLayout>
    </PrivateRoute>
  );
}