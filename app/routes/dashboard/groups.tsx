import PageLayout from "../pageLayout";
import type { Route } from "./+types/groups";
import PrivateRoute from "~/context/PrivateRoute";

import type { Group } from "~/types";
import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { fetchAllGroups } from "~/utils/data";
import GroupCard from "~/components/group-card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button"; // Assuming you have a button component
import { PlusCircle } from "lucide-react"; // Icon for adding new group
import { toast } from "sonner"; // For notifications

export function meta({}: Route.MetaArgs) {
  return [{ title: "KSA Admin - Groepen" }];
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State for error handling

  // Centralized function to load groups, memoized with useCallback
  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const data = await fetchAllGroups();
      setGroups(data ?? []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setError("Fout bij het laden van groepen. Probeer opnieuw.");
      toast.error("Fout bij het laden van groepen."); // User-friendly notification
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies, so it only gets created once

  useEffect(() => {
    loadGroups();
  }, [loadGroups]); // Depend on loadGroups

  const handleGroupUpdate = (updatedGroup: Group) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
    toast.success(`Groep "${updatedGroup.naam}" succesvol bijgewerkt!`); // Confirmation for user
  };

  // Function to handle adding a new group (placeholder for now)
  const handleAddGroup = () => {
    // In a real application, this would open a modal or navigate to a new page
    // for creating a new group.
    toast.info("Functie voor het toevoegen van een nieuwe groep is in ontwikkeling.");
    console.log("Add new group functionality not yet implemented.");
  };

  return (
    <PrivateRoute>
      <PageLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Groepsbeheer</h1>
          <Button onClick={handleAddGroup} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Nieuwe Groep Toevoegen
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Oeps!</strong>
            <span className="block sm:inline"> {error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onClick={() => setError(null)}>
                <title>Sluiten</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </span>
          </div>
        )}

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