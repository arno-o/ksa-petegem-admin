import PageLayout from "../pageLayout"
import type { Route } from "./+types/users"
import PrivateRoute from "~/context/PrivateRoute"
import LeidingCard from "~/components/leiding-card"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

import type { Group, Leiding } from "~/types";
import { fetchGroups, fetchLeiding } from "~/utils/data";

import { useEffect, useState } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Leiding" },
  ];
}

export default function Users() {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>()
  const [leiding, setLeiding] = useState<Leiding[]>()

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      try {
        const data = await fetchGroups();
        setGroups(data);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadLeiding = async () => {
      try {
        const data = await fetchLeiding();
        setLeiding(data);
      } catch (err) {
        console.error("Failed to fetch leiding: ", err);
      }
    }

    loadGroups();
    loadLeiding();
  }, []);

  return (
    <PrivateRoute>
      <PageLayout>

        <header className="flex justify-between items-center mb-6">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Actieve Leiding</h3>
        </header>

        <Tabs defaultValue="1" className="w-fill">
          <TabsList>
            {groups?.sort((a, b) => a.id - b.id).map((group) => (
              <TabsTrigger value={`${group.id}`}>{group.naam}</TabsTrigger>
            ))}
          </TabsList>
          {groups?.sort((a, b) => a.id - b.id).map((group) => (
            <TabsContent value={`${group.id}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-1">
                {leiding?.filter(persoon => persoon.leidingsploeg === group.id).map(persoon => (
                  <LeidingCard leiding={persoon} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

      </PageLayout>
    </PrivateRoute>
  );
}
