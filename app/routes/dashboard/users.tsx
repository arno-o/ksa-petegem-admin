import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import PageLayout from "../pageLayout";
import type { Route } from "./+types/users";
import { Button } from "~/components/ui/button";
import PrivateRoute from "~/context/PrivateRoute";
import LeidingCard from "~/components/leiding-card";

import { UserPlus } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Group, Leiding } from "~/types";
import { fetchActiveGroups, fetchLeiding, createLeiding } from "~/utils/data";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "KSA Admin - Leiding" }];
}

export default function Users() {
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
        const data = await fetchLeiding();
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
      navigate(`/leiding/edit/${newId.id}`);
    } catch (err) {
      console.error("Failed to create new leiding:", err);
    }
  };

  const handleDeleteLeiding = (id: number) => {
    setLeiding((prev) => prev?.filter((persoon) => persoon.id !== id));
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

        <Tabs defaultValue="1" className="w-fill">
          <TabsList>
            {groups?.sort((a, b) => a.id - b.id).map((group) => (
              <TabsTrigger key={group.id} value={`${group.id}`}>{group.naam}</TabsTrigger>
            ))}
          </TabsList>
          {groups?.sort((a, b) => a.id - b.id).map((group) => (
            <TabsContent key={group.id} value={`${group.id}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-1">
                {leiding?.filter(persoon => persoon.leidingsploeg === group.id).map(persoon => (
                  <LeidingCard key={persoon.id} leiding={persoon} onDelete={handleDeleteLeiding} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </PageLayout>
    </PrivateRoute>
  );
}