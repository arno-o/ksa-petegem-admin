// React and Hooks
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

// Lucide Icons
import { CalendarArrowUp, Crown, Star, UserPlus } from "lucide-react";

// UI Components (shadcn/ui or custom)
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import LeidingCard from "~/components/cards/leiding-card";

// Context & Layout
import PrivateRoute from "~/context/PrivateRoute";
import PageLayout from "../../pageLayout";

// Data Utilities & Types
import type { Group, Leiding } from "~/types";
import type { Route } from "../users/+types/active"; // Assuming this path is correct
import { createLeiding, fetchActiveGroups, fetchActiveLeiding } from "~/utils/data";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "KSA Admin - Leiding" }];
}

export default function Active() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>();
  const [leiding, setLeiding] = useState<Leiding[]>();
  const [filteredLeiding, setFilteredLeiding] = useState<Leiding[]>();
  const [selectedFilter, setSelectedFilter] = useState<string>("*");

  const [voornaam, setVoornaam] = useState("");
  const [familienaam, setFamilienaam] = useState("");
  const [leidingsploeg, setLeidingsploeg] = useState<string>("");

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      try {
        const data = await fetchActiveGroups();
        setGroups(data);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadLeiding = async () => {
      try {
        const data = await fetchActiveLeiding();
        setLeiding(data);
      } catch (err) {
        console.error("Failed to fetch leiding:", err);
      }
    };

    loadGroups();
    loadLeiding();
  }, []);

  // Effect to filter and sort leiding whenever 'leiding' data or 'selectedFilter' changes
  useEffect(() => {
    if (!leiding) {
      setFilteredLeiding([]);
      return;
    }

    let tempLeiding = [...leiding]; // Create a mutable copy to sort

    if (selectedFilter === "*") {
      // Sort by leiding_sinds (ancieniteit) then geboortedatum
      tempLeiding.sort((a, b) => {
        const dateA_sinds = a.leiding_sinds ? new Date(a.leiding_sinds) : new Date(0);
        const dateB_sinds = b.leiding_sinds ? new Date(b.leiding_sinds) : new Date(0);
        if (dateA_sinds.getTime() !== dateB_sinds.getTime()) {
          return dateA_sinds.getTime() - dateB_sinds.getTime();
        }

        const dateA_geb = a.geboortedatum ? new Date(a.geboortedatum) : new Date(0);
        const dateB_geb = b.geboortedatum ? new Date(b.geboortedatum) : new Date(0);
        return dateA_geb.getTime() - dateB_geb.getTime(); // Sort ascending for birth date
      });
    } else if (selectedFilter === "trekkers") {
      // Filter for trekkers and sort by leidingsploeg (group ID)
      tempLeiding = leiding.filter(person => person.trekker);
      tempLeiding.sort((a, b) => a.leidingsploeg - b.leidingsploeg);
    } else if (selectedFilter === "hoofdleiding") {
      // Filter for hoofdleiding and sort by voornaam
      tempLeiding = leiding.filter(person => person.hoofdleiding);
      tempLeiding.sort((a, b) => a.voornaam.localeCompare(b.voornaam));
    } else {
      // Filter by specific group and sort trekkers first, then by ancieniteit
      const selectedGroupId = Number(selectedFilter);
      tempLeiding = leiding.filter(person => person.leidingsploeg === selectedGroupId);

      tempLeiding.sort((a, b) => {
        // Trekkers first (true comes before false)
        if (a.trekker && !b.trekker) return -1;
        if (!a.trekker && b.trekker) return 1;

        // Then by ancieniteit (leiding_sinds)
        const dateA_sinds = a.leiding_sinds ? new Date(a.leiding_sinds) : new Date(0);
        const dateB_sinds = b.leiding_sinds ? new Date(b.leiding_sinds) : new Date(0);
        return dateA_sinds.getTime() - dateB_sinds.getTime();
      });
    }
    setFilteredLeiding(tempLeiding);
  }, [leiding, selectedFilter]);


  const handleCreate = async () => {
    if (!voornaam || !familienaam || !leidingsploeg) return;

    try {
      const newId = await createLeiding({ voornaam, familienaam, leidingsploeg: Number(leidingsploeg) });
      setOpen(false);
      navigate(`/leiding/actief/edit/${newId.id}`);
    } catch (err) {
      console.error("Failed to create new leiding:", err);
    }
  };

  const handleDeleteLeiding = (id: number) => {
    setLeiding((prev) => prev?.filter((persoon) => persoon.id !== id));
  };

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

  return (
    <PrivateRoute>
      <PageLayout>
        <header className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold tracking-tight">Actieve Leiding</h3>
          <div className="flex gap-2">
            <Select defaultValue="*" onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kies een groep" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Nuttig</SelectLabel>
                  <SelectItem value="*">
                    <CalendarArrowUp />
                    Alle leiding (Anciëniteit)
                  </SelectItem>
                  <SelectItem value="trekkers">
                    <Star />Trekkers
                  </SelectItem>
                  <SelectItem value="hoofdleiding">
                    <Crown />Hoofdleiding
                  </SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Groepen</SelectLabel>
                  {groups?.sort((a, b) => a.id - b.id).map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>{g.naam}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><UserPlus />Voeg Leiding Toe</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nieuwe leiding aanmaken</DialogTitle>
                  <DialogDescription>
                    Vul snel de gegevens in om een nieuw profiel te starten.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="voornaam" className="text-right">Voornaam</Label>
                    <Input id="voornaam" className="col-span-3" value={voornaam} onChange={(e) => setVoornaam(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="familienaam" className="text-right">Familienaam</Label>
                    <Input id="familienaam" className="col-span-3" value={familienaam} onChange={(e) => setFamilienaam(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="leidingsploeg" className="text-right">Leidingsgroep</Label>
                    <Select onValueChange={setLeidingsploeg}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Kies groep" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups?.map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>{g.naam}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Annuleer</Button>
                  </DialogClose>
                  <Button onClick={handleCreate}>Ga naar profiel</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="rounded-lg border bg-background/50 dark:bg-background/30 shadow-md overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] gap-4 p-4 text-sm font-semibold text-muted-foreground border-b border-border bg-accent/20 dark:bg-accent/10">
            <div>Persoon</div>
            <div>Jaren leiding</div>
            <div className="flex justify-center">Geboortedatum</div>
            <div className="flex justify-center">Groep</div>
            <div className="flex justify-end">Acties</div>
          </div>

          <div>
            {filteredLeiding?.map((person) => {
              const group = groups?.find(g => g.id === person.leidingsploeg);
              const groupName = group?.naam;
              const groupTextColorClass = group?.color ? COLOR_MAP[group.color] : "text-foreground";
              const groupBadgeBgClass = group?.color ? BADGE_BACKGROUND_COLOR_MAP[group.color] : "bg-muted";
              const groupBadgeBorderClass = group?.color ? BADGE_BORDER_COLOR_MAP[group.color] : "border-border";

              return (
                <LeidingCard
                  key={person.id}
                  leiding={person}
                  onDelete={handleDeleteLeiding}
                  groupName={groupName}
                  groupTextColorClass={groupTextColorClass}
                  groupBadgeBgClass={groupBadgeBgClass}
                  groupBadgeBorderClass={groupBadgeBorderClass}
                />
              );
            })}
            {filteredLeiding?.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                Geen leiding gevonden voor de geselecteerde filter.
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </PrivateRoute>
  );
}