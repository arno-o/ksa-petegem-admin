import type { Leiding } from "~/types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { MoreVertical, Edit, Trash2, ShieldX } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { deleteLeiding } from "~/utils/data";
import { toast } from "sonner";
import { Separator } from "../ui/separator";

interface LeidingCardProps {
  leiding: Leiding;
  onDelete?: (id: number) => void;
  groupName?: string;
}

const LeidingCard = ({ leiding, onDelete }: LeidingCardProps) => {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [disableDialog, setDisableDialog] = useState(false);

  const age = leiding.geboortedatum
    ? (() => {
        const geboortedatum = new Date(leiding.geboortedatum);
        const today = new Date();
        let age = today.getFullYear() - geboortedatum.getFullYear();
        const m = today.getMonth() - geboortedatum.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < geboortedatum.getDate())) {
          age--;
        }
        return age;
      })()
    : null;

  const handleDelete = async () => {
    try {
      await deleteLeiding(leiding.id);
      toast.success("Leiding werd verwijderd.");
      setDeleteDialog(false);
      onDelete?.(leiding.id);
    } catch (err) {
      toast.error("Verwijderen mislukt. Probeer opnieuw.");
    }
  };

  const handleDisable = async () => {
    return;
  }

  return (
    <>
      <div className="relative flex items-center justify-between rounded-md bg-card px-4 py-3 hover:bg-muted transition-colors">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={leiding.foto_url ?? ""} alt={`${leiding.voornaam} ${leiding.familienaam}`} />
            <AvatarFallback>
              {leiding.voornaam.charAt(0)}
              {leiding.familienaam.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-xl font-medium leading-tight">
              {leiding.voornaam} {leiding.familienaam}
            </p>
            {age !== null && (
              <p className="text-muted-foreground leading-none mt-0.5">
                {age} jaar oud
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Meer opties</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => navigate(`edit/${leiding.id}`, { viewTransition: true })}
            >
              <Edit className="mr-2 h-4 w-4" /> Bewerken
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDisableDialog(true)}
            >
              <ShieldX className="mr-2 h-4 w-4" /> Inactief zetten
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Verwijderen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription>
              Je staat op het punt om <strong>{leiding.voornaam} {leiding.familienaam}</strong> te verwijderen. Deze actie kan niet ongedaan worden gemaakt.
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

      <Dialog open={disableDialog} onOpenChange={setDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription>
              Je staat op het punt om <strong>{leiding.voornaam} {leiding.familienaam}</strong> te markeren als oud-leiding en te verwijderen van de huidige <u>ksapetegem.be</u> website.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableDialog(false)}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleDisable}>
              Inactief plaatsen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeidingCard;