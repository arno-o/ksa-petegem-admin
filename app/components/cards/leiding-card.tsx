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
  groupName?: string; // Add groupName to props
}

const LeidingCard = ({ leiding, onDelete, groupName }: LeidingCardProps) => {
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

  const yearsInLeiding = leiding.leiding_sinds
    ? (() => {
        const leidingSinds = new Date(leiding.leiding_sinds);
        const today = new Date();
        let years = today.getFullYear() - leidingSinds.getFullYear();
        const m = today.getMonth() - leidingSinds.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < leidingSinds.getDate())) {
          years--;
        }
        return years;
      })()
    : null;

  const formattedGeboortedatum = leiding.geboortedatum
    ? new Date(leiding.geboortedatum).toLocaleDateString('nl-BE')
    : 'Onbekend';

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
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_0.8fr] gap-4 items-center px-4 py-3 border-b border-input hover:bg-muted/50 transition-colors last:border-b-0">
        {/* Persoon (Column 1) */}
        <div className="flex items-center gap-4">
          <Avatar className="h-9 w-9"> {/* Slightly smaller avatar for table row */}
            <AvatarImage src={leiding.foto_url ?? ""} alt={`${leiding.voornaam} ${leiding.familienaam}`} />
            <AvatarFallback>
              {leiding.voornaam.charAt(0)}
              {leiding.familienaam.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-medium leading-none">
              {leiding.voornaam} {leiding.familienaam}
            </p>
            {age !== null && (
              <p className="text-sm text-muted-foreground leading-none mt-0.5">
                {age} jaar oud
              </p>
            )}
          </div>
        </div>

        {/* Jaren leiding (Column 2) */}
        <div className="text-sm text-muted-foreground">
          {yearsInLeiding !== null ? `${yearsInLeiding} jaar` : 'Onbekend'}
        </div>

        {/* Geboortedatum (Column 3) */}
        <div className="text-sm text-muted-foreground flex justify-center">
          {formattedGeboortedatum}
        </div>

        {/* Groep (Column 4) */}
        <div className="text-sm text-muted-foreground flex justify-center">
          {groupName || 'Onbekend'} {/* Display the passed groupName */}
        </div>

        {/* Acties (Column 5) */}
        <div className="flex justify-end">
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