import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { cn } from "~/lib/utils"; // For combining Tailwind classes
import PageLayout from "../../pageLayout";
import { Button } from "~/components/ui/button";
import PrivateRoute from "~/context/PrivateRoute";
import LeidingCard from "~/components/cards/leiding-card";
import type { Route } from "../users/+types/active";

import { UserPlus, ChevronDown } from "lucide-react";

import type { Group, Leiding } from "~/types";
import { fetchActiveGroups, fetchActiveLeiding, createLeiding } from "~/utils/data";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"

export function meta({ }: Route.MetaArgs) {
  return [{ title: "KSA Admin - Leiding" }];
}

export default function Active() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>();
  const [leiding, setLeiding] = useState<Leiding[]>();

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

  const colorMap: Record<string, string> = {
        yellow: "bg-yellow-500 dark:bg-yellow-400",
        blue: "bg-blue-500 dark:bg-blue-400",
        green: "bg-green-500 dark:bg-green-400",
        purple: "bg-purple-500 dark:bg-purple-400",
        red: "bg-red-500 dark:bg-red-400",
        orange: "bg-orange-500 dark:bg-orange-400",
        lime: "bg-lime-500 dark:bg-lime-400",
        rose: "bg-rose-500 dark:bg-rose-400",
    };

  return (
    <PrivateRoute>
      <PageLayout>
        <header className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold tracking-tight">Actieve Leiding</h3>
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
        </header>

        <div className="flex flex-col p-4">
          {groups?.sort((a, b) => a.id - b.id).map((group) => (
            <div className="w-full ">
              <div className="flex items-center justify-between border-b py-4 mb-4">
                <h1 className="text-2xl font-bold">{group.naam}</h1>
                <div key={group.id} className={`h-6 w-6 ${colorMap[group.color] ?? "bg-gray-300"} ring-background rounded-full ring-2`}></div>
              </div>

              <div className="flex flex-col gap-3">
                {leiding?.filter(persoon => persoon.leidingsploeg === group.id)
                  .sort((a, b) => {
                    if (a.trekker && !b.trekker) { return -1; }
                    if (!a.trekker && b.trekker) { return 1; }
                    return 0;
                  })
                  .map(persoon => (
                    <LeidingCard key={persoon.id} leiding={persoon} onDelete={handleDeleteLeiding} />
                  ))}
              </div>
            </div>
          ))}
        </div>

      </PageLayout>
    </PrivateRoute>
  );
}