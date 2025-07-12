import PageLayout from "../pageLayout";
import type { Route } from "./+types/groups";
import PrivateRoute from "~/context/PrivateRoute";

import type { Group } from "~/types";
import { useEffect, useState } from "react";
import GroupCard from "~/components/group-card";
import { fetchAllGroups } from "~/utils/data";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "KSA Admin - Groepen" }];
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await fetchAllGroups();
        setGroups(data ?? []);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  const handleGroupUpdate = (updatedGroup: Group) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  return (
    <PrivateRoute>
      <PageLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Groepsbeheer</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[180px] w-full rounded-lg" />
            ))}
          </div>
        ) : groups?.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} onGroupUpdate={handleGroupUpdate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 text-lg">
            Geen groepen gevonden. <br />
            Voeg nieuwe groepen toe om ze hier te beheren.
          </div>
        )}
      </PageLayout>
    </PrivateRoute>
  );
}