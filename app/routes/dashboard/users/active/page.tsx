// React and Hooks
import { useEffect, useState, useMemo } from "react";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import { useIsMobile } from "~/hooks/use-mobile";
import { toast } from "sonner";

// UI Components
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { UserPlus } from "lucide-react";

// Context & Layout
import PageLayout from "../../../pageLayout";

// Data Table Components
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

// Data Utilities & Types
import type { Group, Leiding } from "~/types";
import type { Route } from "./+types/page";
import { createLeiding, fetchActiveGroups, fetchActiveLeiding, deleteLeiding, disableLeiding, massUpdateLeiding, deleteFromBucket } from "~/utils/data";
import FullScreenLoader from "~/components/allround/full-screen-loader";

export function meta({}: Route.MetaArgs) {
  return [{ title: "KSA Admin - Leiding" }];
}

export async function clientLoader() {
  const groupData = await fetchActiveGroups();
  const leidingData = await fetchActiveLeiding();

  return { leidingData, groupData };
}

export function HydrateFallback() {
  return (
    <PageLayout permission={2}>
      <FullScreenLoader />
    </PageLayout>
  );
}

export default function Active({ loaderData }: Route.ComponentProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const groups = loaderData.groupData;
  const leiding = loaderData.leidingData;

  const [filteredLeiding, setFilteredLeiding] = useState<Leiding[]>();
  const [selectedFilter, setSelectedFilter] = useState<string>(() => {
    return window.localStorage.getItem("activeFilter") || "all_by_group";
  });

  // State for "Nieuwe leiding aanmaken" form
  const [voornaam, setVoornaam] = useState("");
  const [familienaam, setFamilienaam] = useState("");
  const [leidingsploeg, setLeidingsploeg] = useState<string>("");

  // States for action dialogs (Delete, Disable)
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [disableConfirmDialog, setDisableConfirmDialog] = useState(false);
  const [selectedLeidingForDialog, setSelectedLeidingForDialog] = useState<Leiding | null>(null);

  // States for Mass Edit
  const [massWipeGroupDialog, setMassWipeGroupDialog] = useState(false);
  const [massEditGroupDialog, setMassEditGroupDialog] = useState(false);
  const [massDisableDialog, setMassDisableDialog] = useState(false);
  const [selectedMassEditGroup, setSelectedMassEditGroup] = useState<string>("");
  const [selectedMassIds, setSelectedMassIds] = useState<number[]>([]);

  // Helper to reload all necessary data
  const reloadData = async () => {
    setLoading(true);
    try {
      // In a real implementation, you'd refetch the data here
      // For now, we'll just wait a bit to simulate loading
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error("Failed to reload data:", err);
      toast.error("Fout bij het vernieuwen van de gegevens.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []); // Initial load

  useEffect(() => {
    window.localStorage.setItem("activeFilter", selectedFilter);
  }, [selectedFilter]);

  const handleFilterChange = (newFilter: string) => {
    setSelectedFilter(newFilter);
  };

  // Effect to filter and sort leiding whenever 'leiding' data or 'selectedFilter' changes
  useEffect(() => {
    if (!leiding) {
      setFilteredLeiding([]);
      return;
    }

    let tempLeiding = [...leiding]; // Create a mutable copy to sort

    // Apply main filter based on selected group/category
    if (selectedFilter === "*") {
      tempLeiding.sort((a, b) => {
        const dateA_sinds = a.leiding_sinds ? new Date(a.leiding_sinds) : new Date(0);
        const dateB_sinds = b.leiding_sinds ? new Date(b.leiding_sinds) : new Date(0);
        if (dateA_sinds.getTime() !== dateB_sinds.getTime()) {
          return dateA_sinds.getTime() - dateB_sinds.getTime();
        }

        const dateA_geb = a.geboortedatum ? new Date(a.geboortedatum) : new Date(0);
        const dateB_geb = b.geboortedatum ? new Date(b.geboortedatum) : new Date(0);
        return dateA_geb.getTime() - dateB_geb.getTime();
      });
    } else if (selectedFilter === "trekkers") {
      tempLeiding = leiding.filter((person: Leiding) => person.trekker);
      tempLeiding.sort((a, b) => {
        const groupA = a.leidingsploeg ?? Number.MAX_SAFE_INTEGER;
        const groupB = b.leidingsploeg ?? Number.MAX_SAFE_INTEGER;
        if (groupA !== groupB) {
          return groupA - groupB;
        }
        return a.voornaam.localeCompare(b.voornaam);
      });
    } else if (selectedFilter === "hoofdleiding") {
      tempLeiding = leiding.filter((person: Leiding) => person.hoofdleiding);
      tempLeiding.sort((a, b) => a.voornaam.localeCompare(b.voornaam));
    } else if (selectedFilter === "all_by_group") {
      // Sort first by leidingsploeg (handling null/undefined), then by age
      tempLeiding.sort((a, b) => {
        const groupA = a.leidingsploeg ?? Number.MAX_SAFE_INTEGER;
        const groupB = b.leidingsploeg ?? Number.MAX_SAFE_INTEGER;
        if (groupA !== groupB) {
          return groupA - groupB;
        }
        // If groups are the same, sort by age (youngest first)
        const dateA_geb = a.geboortedatum ? new Date(a.geboortedatum) : new Date(0);
        const dateB_geb = b.geboortedatum ? new Date(b.geboortedatum) : new Date(0);
        return dateB_geb.getTime() - dateA_geb.getTime();
      });
    } else {
      const selectedGroupId = Number(selectedFilter);
      tempLeiding = leiding.filter((person: Leiding) => person.leidingsploeg === selectedGroupId);

      tempLeiding.sort((a, b) => {
        if (a.trekker && !b.trekker) return -1;
        if (!a.trekker && b.trekker) return 1;

        const dateA_sinds = a.leiding_sinds ? new Date(a.leiding_sinds) : new Date(0);
        const dateB_sinds = b.leiding_sinds ? new Date(b.leiding_sinds) : new Date(0);
        return dateA_sinds.getTime() - dateB_sinds.getTime();
      });
    }

    setFilteredLeiding(tempLeiding);
  }, [leiding, selectedFilter, groups]);

  const handleCreate = async () => {
    if (!voornaam || !familienaam || !leidingsploeg) {
      toast.error("Vul alle velden in om een nieuwe leiding aan te maken.");
      return;
    }

    try {
      const newId = await createLeiding({ voornaam, familienaam, leidingsploeg: Number(leidingsploeg), actief: true });
      setOpen(false);
      setVoornaam("");
      setFamilienaam("");
      setLeidingsploeg("");
      toast.success("Nieuwe leiding succesvol aangemaakt!");
      navigate(`/leiding/actief/edit/${newId.id}`);
    } catch (err) {
      toast.error("Aanmaken mislukt. Probeer opnieuw.");
      console.error("Failed to create new leiding:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedLeidingForDialog) return;
    try {
      if (selectedLeidingForDialog.foto_url) {
        try {
          const deleteURL = selectedLeidingForDialog.foto_url;
          await deleteFromBucket("leiding-fotos", deleteURL);
        } catch (bucketErr) {
          console.error("Failed to delete image from bucket:", bucketErr);
          toast.error(String(bucketErr));
          return;
        }
      }
      await deleteLeiding(selectedLeidingForDialog.id);
      toast.success("Leiding werd definitief verwijderd.");
      setDeleteDialog(false);
      await reloadData();
      setSelectedLeidingForDialog(null);
    } catch (err) {
      toast.error("Verwijderen mislukt. Probeer opnieuw.");
      console.error("Failed to delete leiding:", err);
    }
  };

  const handleDisable = async () => {
    if (!selectedLeidingForDialog) return;
    try {
      await disableLeiding(selectedLeidingForDialog.id);
      toast.success("Leiding is succesvol inactief gezet.");
      setDisableConfirmDialog(false);
      await reloadData();
      setSelectedLeidingForDialog(null);
    } catch (err) {
      toast.error("Inactief zetten mislukt. Probeer opnieuw.");
      console.error("Failed to disable leiding:", err);
    }
  };

  const handleMassWipe = async (selectedIds: number[]) => {
    if (selectedIds.length === 0) {
      toast.info("Geen leiding geselecteerd om groep te wissen.");
      return;
    }
    setSelectedMassIds(selectedIds);
    setMassWipeGroupDialog(true);
  };

  const handleMassWipeConfirm = async () => {
    if (selectedMassIds.length === 0) return;

    try {
      await massUpdateLeiding({
        leidingIds: selectedMassIds,
        updateData: { leidingsploeg: null },
      });

      toast.success(`Groep gewist voor ${selectedMassIds.length} leiding.`);
      setMassWipeGroupDialog(false);
      setSelectedMassIds([]);
      await reloadData();
    } catch (err) {
      toast.error("Groep wissen mislukt. Probeer opnieuw.");
      console.error("Failed to mass wipe group:", err);
    }
  };

  const handleMassEditGroup = async (selectedIds: number[]) => {
    if (selectedIds.length === 0) {
      toast.info("Geen leiding geselecteerd voor massabewerking.");
      return;
    }
    setSelectedMassIds(selectedIds);
    setMassEditGroupDialog(true);
  };

  const handleMassUpdateGroup = async () => {
    if (selectedMassIds.length === 0 || !selectedMassEditGroup) {
      toast.error("Selecteer een nieuwe groep.");
      return;
    }

    try {
      await massUpdateLeiding({
        leidingIds: selectedMassIds,
        updateData: { leidingsploeg: Number(selectedMassEditGroup) }
      });
      toast.success(`${selectedMassIds.length} leiding aangepast naar de nieuwe groep.`);
      setMassEditGroupDialog(false);
      setSelectedMassEditGroup("");
      setSelectedMassIds([]);
      await reloadData();
    } catch (err) {
      toast.error("Massabewerking groep mislukt. Probeer opnieuw.");
      console.error("Failed to mass update group:", err);
    }
  };

  const handleMassDisable = async (selectedIds: number[]) => {
    if (selectedIds.length === 0) {
      toast.info("Geen leiding geselecteerd om inactief te maken.");
      return;
    }
    setSelectedMassIds(selectedIds);
    setMassDisableDialog(true);
  };

  const handleMassDisableConfirm = async () => {
    if (selectedMassIds.length === 0) return;

    try {
      await massUpdateLeiding({
        leidingIds: selectedMassIds,
        updateData: { actief: false }
      });
      toast.success(`${selectedMassIds.length} leiding is succesvol inactief gezet.`);
      setMassDisableDialog(false);
      setSelectedMassIds([]);
      await reloadData();
    } catch (err) {
      toast.error("Massabewerking inactief zetten mislukt. Probeer opnieuw.");
      console.error("Failed to mass disable leiding:", err);
    }
  };

  const columns = useMemo(
    () =>
      createColumns({
        groups: groups || [],
        onEdit: (leiding) => navigate(`edit/${leiding.id}`, { viewTransition: true }),
        onDisable: (leiding) => {
          setSelectedLeidingForDialog(leiding);
          setDisableConfirmDialog(true);
        },
        onDelete: (leiding) => {
          setSelectedLeidingForDialog(leiding);
          setDeleteDialog(true);
        },
      }),
    [groups, navigate]
  );

  return (
    <PageLayout permission={2}>
      <header className="flex flex-col mb-4 gap-4">
        <div className="flex gap-2 items-baseline">
          <h3 className="text-2xl font-semibold tracking-tight">Actieve Leiding</h3>
          <p className="text-foreground/70">{leiding ? `${leiding.length}` : "0"}</p>
        </div>

        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Voeg Leiding Toe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nieuwe leiding aanmaken</DialogTitle>
                <DialogDescription>Vul snel de gegevens in om een nieuw profiel te starten.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="voornaam" className="text-right">
                    Voornaam
                  </Label>
                  <Input id="voornaam" className="col-span-3" value={voornaam} onChange={(e) => setVoornaam(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="familienaam" className="text-right">
                    Familienaam
                  </Label>
                  <Input id="familienaam" className="col-span-3" value={familienaam} onChange={(e) => setFamilienaam(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="leidingsploeg" className="text-right">
                    Leidingsgroep
                  </Label>
                  <Select onValueChange={setLeidingsploeg} value={leidingsploeg}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Kies groep" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups?.map((g: Group) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.naam}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Annuleer
                  </Button>
                </DialogClose>
                <Button onClick={handleCreate}>Ga naar profiel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <DataTable
        columns={columns}
        data={filteredLeiding || []}
        groups={groups || []}
        isMobile={isMobile}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
        onMassWipe={handleMassWipe}
        onMassEditGroup={handleMassEditGroup}
        onMassDisable={handleMassDisable}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription>
              Je staat op het punt om **{selectedLeidingForDialog?.voornaam} {selectedLeidingForDialog?.familienaam}** definitief te verwijderen. Deze actie kan niet ongedaan worden
              gemaakt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Verwijder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation Dialog */}
      <Dialog open={disableConfirmDialog} onOpenChange={setDisableConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription>
              Je staat op het punt om <strong>{selectedLeidingForDialog?.voornaam} {selectedLeidingForDialog?.familienaam}</strong> te markeren als oud-leiding en te verwijderen van de
              huidige <u>ksapetegem.be</u> website.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableConfirmDialog(false)}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleDisable}>
              Inactief plaatsen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mass Wipe Group Dialog */}
      <Dialog open={massWipeGroupDialog} onOpenChange={setMassWipeGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Massa Groep Wissen</DialogTitle>
            <DialogDescription>Je staat op het punt om <strong>{selectedMassIds.length}</strong> geselecteerde leiding hun groep te wissen.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMassWipeGroupDialog(false)}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleMassWipeConfirm}>
              Groep wissen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mass Edit Group Dialog */}
      <Dialog open={massEditGroupDialog} onOpenChange={setMassEditGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Massa Groep Wijzigen</DialogTitle>
            <DialogDescription>Wijzig de groep voor de geselecteerde <strong>{selectedMassIds.length}</strong> leiding.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="mass-edit-group" className="text-right">
                Nieuwe Leidingsgroep
              </Label>
              <Select onValueChange={setSelectedMassEditGroup} value={selectedMassEditGroup}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Kies nieuwe groep" />
                </SelectTrigger>
                <SelectContent>
                  {groups?.map((g: Group) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.naam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMassEditGroupDialog(false);
                setSelectedMassEditGroup("");
              }}
            >
              Annuleren
            </Button>
            <Button onClick={handleMassUpdateGroup} disabled={!selectedMassEditGroup}>
              Groep aanpassen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mass Disable Dialog */}
      <Dialog open={massDisableDialog} onOpenChange={setMassDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Massa Inactief Zetten</DialogTitle>
            <DialogDescription>Je staat op het punt om <strong>{selectedMassIds.length}</strong> geselecteerde leiding te markeren als oud-leiding en te verwijderen van de huidige website.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMassDisableDialog(false)}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleMassDisableConfirm}>
              Leiding inactief plaatsen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  let message = "Er is iets misgelopen.";
  let status: number | undefined = undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = (typeof error.data === "string" && error.data) || error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  return (
    <PageLayout permission={2}>
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-destructive">{status ? `Error ${status} – ${message}` : message}</p>
      </div>
    </PageLayout>
  );
}
