// routes/groups.tsx
import PageLayout from "../pageLayout";
import type { Route } from "./+types/groups";

import type { Group } from "~/types";
import { useEffect, useState, useCallback } from "react";
import { fetchAllGroups, createGroup, updateGroup } from "~/utils/data";
import GroupCard from "~/components/cards/group-card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { CircleFadingPlus } from "lucide-react";
import { toast } from "sonner";

import { useIsMobile } from "~/hooks/use-mobile";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "~/components/ui/drawer";


import GroupForm, { type GroupFormValues } from "~/components/groups/GroupForm";
import PdfUpload from "~/components/groups/PDFUpload";

// ---------- Page Meta ----------
export function meta({ }: Route.MetaArgs) {
  return [{ title: "KSA Admin - Groepen" }];
}

function ModalWrap({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  if (useIsMobile()) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <div className="p-6 pb-24 overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle className="text-2xl font-bold">{title}</DrawerTitle>
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Group | null>(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllGroups();
      const ordered = (data ?? []).slice().sort((a, b) => Number(a.id) - Number(b.id));
      setGroups(ordered);
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
      prev
        .map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
        .sort((a, b) => Number(a.id) - Number(b.id))
    );
    toast.success(`Groep "${updatedGroup.naam}" succesvol bijgewerkt!`);
  };

  const handleEditGroup = useCallback((group: Group) => {
    setSelected(group);
    setEditOpen(true);
  }, []);

  // Create
  const handleCreate = async (values: GroupFormValues) => {
    try {
      setSaving(true);
      const created = await createGroup(values as any);
      setGroups((prev) => [created, ...prev].sort((a, b) => Number(a.id) - Number(b.id)));
      toast.success(`"${created.naam}" aangemaakt.`);
      setCreateOpen(false);
    } catch (e: any) {
      console.error(e);
      toast.error(
        e?.message?.includes("duplicate key") ? "Slug bestaat al." : "Aanmaken mislukt."
      );
    } finally {
      setSaving(false);
    }
  };

  // Update
  const handleUpdate = async (values: GroupFormValues) => {
    if (!selected) return;
    try {
      setSaving(true);
      const updated = await updateGroup(selected.id, values);
      handleGroupUpdate(updated);
      setEditOpen(false);
      setSelected(null);
    } catch (e: any) {
      console.error(e);
      toast.error(
        e?.message?.includes("duplicate key") ? "Slug bestaat al." : "Bijwerken mislukt."
      );
    } finally {
      setSaving(false);
    }
  };

  const closeEdit = () => {
    setEditOpen(false);
    setTimeout(() => setSelected(null), 0);
  };

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <h3 className="text-2xl font-semibold tracking-tight">Groepsbeheer</h3>
        <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
          <CircleFadingPlus className="h-4 w-4" />
          Nieuwe Groep Toevoegen
        </Button>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Oeps!</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-input shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1.5fr_2fr_1fr_0.8fr] gap-4 p-4 text-sm font-semibold text-muted-foreground border-b border-input bg-muted/20">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-1/4 ml-auto" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-input last:border-b-0 bg-background">
              <div className="sm:hidden space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="hidden sm:grid grid-cols-[1.5fr_2fr_1fr_0.8fr] gap-4">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-1/2 mx-auto" />
                <Skeleton className="h-5 w-1/4 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length > 0 ? (
        <div className="rounded-lg border border-input shadow-sm overflow-hidden">
          {/* Header hidden on mobile */}
          <div className="hidden sm:grid grid-cols-[1.5fr_2fr_1fr_0.8fr] gap-4 p-4 text-sm font-semibold text-muted-foreground border-b border-input bg-muted/20">
            <div>Naam</div>
            <div>Omschrijving</div>
            <div className="text-center">Status</div>
            <div className="text-right">Acties</div>
          </div>

          {/* Body */}
          <div>
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onGroupUpdate={handleGroupUpdate}
                onEdit={() => handleEditGroup(group)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          Geen groepen gevonden. <br /> Voeg nieuwe groepen toe om ze hier te beheren.
        </div>
      )}

      {/* Create */}
      <ModalWrap
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nieuwe groep"
        description="Vul de velden in en klik op Opslaan."
      >
        <GroupForm
          submitting={saving}
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          validationMode="onSubmit"
        />
      </ModalWrap>

      {/* Edit */}
      <ModalWrap
        open={editOpen}
        onOpenChange={(v: boolean) => (v ? setEditOpen(true) : closeEdit())}
        title="Groep bewerken"
        description="Pas de gegevens aan en klik op Opslaan."
      >
        {selected && (
          <>
            <GroupForm
              // key={selected.id} // <-- Removed this line
              submitting={saving}
              initial={{
                naam: selected.naam ?? "",
                omschrijving: selected.omschrijving ?? "",
                info: selected.info ?? "",
                slug: selected.slug ?? "",
                active: !!selected.active,
              }}
              onSubmit={handleUpdate}
              onCancel={closeEdit}
            />

            {/* PDF upload section */}
            <div className="border-t pt-6">
              <PdfUpload
                groupId={selected.id}
                initialUrl={selected.brief_url ?? undefined}
                onChange={(newUrl) => {
                  const id = selected.id;
                  setSelected((prev) => (prev ? { ...prev, brief_url: newUrl } : prev));
                  setGroups((prev) =>
                    prev.map((g) => (g.id === id ? { ...g, brief_url: newUrl } : g))
                  );
                }}
              />
            </div>
          </>
        )}
      </ModalWrap>
    </PageLayout>
  );
}