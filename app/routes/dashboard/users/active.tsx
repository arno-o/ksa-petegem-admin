import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import PageLayout from "../../pageLayout";
import { Button } from "~/components/ui/button";
import PrivateRoute from "~/context/PrivateRoute";
import type { Route } from "../users/+types/active";
import LeidingCard from "~/components/cards/leiding-card";

import { UserPlus, CalendarArrowUp, Star, Crown } from "lucide-react";

import type { Group, Leiding } from "~/types";
import { fetchActiveGroups, fetchActiveLeiding, createLeiding } from "~/utils/data";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup, SelectSeparator } from "~/components/ui/select";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge";


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
      tempLeiding.sort((a, b) => {
        const dateA_sinds = a.leiding_sinds ? new Date(a.leiding_sinds) : new Date(0);
        const dateB_sinds = b.leiding_sinds ? new Date(b.leiding_sinds) : new Date(0);
        if (dateA_sinds.getTime() !== dateB_sinds.getTime()) {
          return dateA_sinds.getTime() - dateB_sinds.getTime();
        }

        const dateA_geb = a.geboortedatum ? new Date(a.geboortedatum) : new Date(0);
        const dateB_geb = b.geboortedatum ? new Date(b.geboortedatum) : new Date(0);
        return dateA_geb.getTime() - dateB_geb.getTime(); // Changed: Sort ascending for birth date
      });
    } else if (selectedFilter === "trekkers") {
      tempLeiding = leiding.filter(person => person.trekker);
      tempLeiding.sort((a, b) => a.voornaam.localeCompare(b.voornaam));
    } else if (selectedFilter === "hoofdleiding") {
      tempLeiding = leiding.filter(person => person.hoofdleiding);
      tempLeiding.sort((a, b) => a.voornaam.localeCompare(b.voornaam));
    } else {
      tempLeiding = leiding.filter(person => person.leidingsploeg === Number(selectedFilter));
      tempLeiding.sort((a, b) => a.voornaam.localeCompare(b.voornaam));
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

  // const colorMap: Record<string, string> = {
  //   yellow: "bg-yellow-500 dark:bg-yellow-400",
  //   blue: "bg-blue-500 dark:bg-blue-400",
  //   green: "bg-green-500 dark:bg-green-400",
  //   purple: "bg-purple-500 dark:bg-purple-400",
  //   red: "bg-red-500 dark:bg-red-400",
  //   orange: "bg-orange-500 dark:bg-orange-400",
  //   lime: "bg-lime-500 dark:bg-lime-400",
  //   rose: "bg-rose-500 dark:bg-rose-400",
  // };

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

        <div className="rounded-lg border border-input shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_0.8fr] gap-4 p-4 text-sm font-semibold text-muted-foreground border-b border-input bg-muted/20">
            <div>Persoon</div>
            <div>Jaren leiding</div>
            <div className="flex justify-center">Geboortedatum</div>
            <div className="flex justify-center">Groep</div>
            <div className="flex justify-end">Acties</div>
          </div>

          {/* Table Body - Map through leiding to render LeidingCard as rows */}
          <div>
            {filteredLeiding?.map((person) => {
              const groupName = groups?.find(g => g.id === person.leidingsploeg)?.naam;
              return (
                <LeidingCard
                  key={person.id}
                  leiding={person}
                  onDelete={handleDeleteLeiding}
                  groupName={groupName} // Pass the group name
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