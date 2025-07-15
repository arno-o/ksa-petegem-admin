import PageLayout from "../pageLayout";
import type { Route } from "./+types/groups";
import PrivateRoute from "~/context/PrivateRoute";

import type { Group } from "~/types";
import { useEffect, useState, useCallback } from "react";
import { fetchAllGroups } from "~/utils/data";
import GroupCard from "~/components/cards/group-card"; // Your updated GroupCard component
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { CircleFadingPlus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router"; // Import useNavigate for potential add group flow

export function meta({}: Route.MetaArgs) {
  return [{ title: "KSA Admin - Groepen" }];
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Initialize navigate

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllGroups();
      setGroups(data ?? []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setError("Fout bij het laden van groepen. Probeer opnieuw.");
      toast.error("Fout bij het laden van groepen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleGroupUpdate = (updatedGroup: Group) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
    toast.success(`Groep "${updatedGroup.naam}" succesvol bijgewerkt!`);
  };

  // Function to handle editing a group (to pass to GroupCard)
  const handleEditGroup = useCallback((group: Group) => {
    // Navigate to an edit page or open a dialog
    // For now, let's assume a dedicated edit page.
    navigate(`/groepen/bewerken/${group.id}`); // Adjust this route as needed
  }, [navigate]);

  // Function to handle adding a new group (placeholder for now)
  const handleAddGroup = () => {
    // Example: navigate to a create group page
    navigate("/groepen/nieuw"); // Adjust this route as needed for creating a new group
    // toast.info("Functie voor het toevoegen van een nieuwe groep is in ontwikkeling.");
    // console.log("Add new group functionality not yet implemented.");
  };

  return (
    <PrivateRoute>
      <PageLayout>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold tracking-tight">Groepsbeheer</h3>
          <Button onClick={handleAddGroup} className="flex items-center gap-2">
            <CircleFadingPlus className="h-4 w-4" />
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
          // Adjusted skeleton to better reflect the new table-like layout
          <div className="rounded-lg border border-input shadow-sm overflow-hidden">
             {/* Header Skeleton */}
            <div className="grid grid-cols-[1.5fr_2fr_1fr_0.8fr] gap-4 p-4 text-sm font-semibold text-muted-foreground border-b border-input bg-muted/20">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2 mx-auto" /> {/* Adjusted width for status column */}
              <Skeleton className="h-4 w-1/4 ml-auto" /> {/* Adjusted width for actions column */}
            </div>
            {/* Row Skeletons */}
            {Array.from({ length: 5 }).map((_, index) => ( // Show a few rows
              <div key={index} className="flex items-center py-3 px-4 border-b border-input last:border-b-0 bg-background">
                <div className="grid grid-cols-[1.5fr_2fr_1fr_0.8fr] gap-4 w-full pl-2">
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-1/2 mx-auto" />
                  <Skeleton className="h-5 w-1/4 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : groups?.length > 0 ? (
          // This is the new "table" container
          <div className="rounded-lg border border-input shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1.5fr_2fr_1fr_0.8fr] gap-4 p-4 text-sm font-semibold text-muted-foreground border-b border-input bg-muted/20">
              <div>Naam</div>
              <div>Omschrijving</div>
              <div className="text-center">Status</div> {/* Center align for Status */}
              <div className="text-right">Acties</div> {/* Right align for Acties */}
            </div>

            {/* Table Body - Map through groups to render GroupCard as rows */}
            <div>
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onGroupUpdate={handleGroupUpdate}
                  onEdit={handleEditGroup} // Pass the handleEditGroup function
                />
              ))}
            </div>
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