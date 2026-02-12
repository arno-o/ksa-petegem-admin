// React and Hooks
import { useState } from "react";
import { useRevalidator } from "react-router";

// UI Components (shadcn/ui or custom)
import LeidingCard from "~/components/cards/leiding-card";

// Context & Layout
import PageLayout from "../../pageLayout";

// Data Utilities & Types
import { toast } from "sonner";
import type { Group, Leiding } from "~/types";
import type { Route } from "../users/+types/inactive";
import { fetchInactiveLeiding, fetchActiveGroups } from "~/utils/data";
import FullScreenLoader from "~/components/allround/full-screen-loader";


export function meta({ }: Route.MetaArgs) {
  return [{ title: "KSA Admin - Leiding" }];
}

export async function clientLoader() {
  const [leiding, groups] = await Promise.all([
    fetchInactiveLeiding(),
    fetchActiveGroups(),
  ]);
  return { leiding, groups };
}

export function HydrateFallback() {
  return (
    <PageLayout permission={2}>
      <FullScreenLoader />
    </PageLayout>
  );
}

export default function Inactive({ loaderData }: Route.ComponentProps) {
  const revalidator = useRevalidator();

  const handleDeleteLeiding = (id: number) => {
    revalidator.revalidate();
  };

  const handleRestoreLeiding = (id: number) => {
    revalidator.revalidate();
  };

  const leiding = loaderData.leiding;
  const groups = loaderData.groups;

  return (
    <PageLayout permission={2}>
      <header className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold tracking-tight">Oudleiding</h3>
      </header>

      <div className="rounded-lg border bg-background/50 dark:bg-background/30 shadow-md overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_0.8fr] gap-4 p-4 text-sm font-semibold text-muted-foreground border-b border-border bg-accent/20 dark:bg-accent/10">
          <div>Persoon</div>
          <div className="flex justify-end">Acties</div>
        </div>

        <div>
          {leiding?.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              Geen oud-leiding gevonden.
            </div>
          )}
          {leiding?.map((person) => {
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