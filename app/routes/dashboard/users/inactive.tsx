// React and Hooks
import { useEffect, useState } from "react";

// UI Components (shadcn/ui or custom)
import LeidingCard from "~/components/cards/leiding-card";

// Context & Layout
import PageLayout from "../../pageLayout";

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
  );
}