import type { Leiding } from "~/types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { deleteLeiding } from "~/utils/data";
import { toast } from "sonner";

interface LeidingCardProps {
  leiding: Leiding;
  onDelete?: (id: number) => void;
}

const LeidingCard = ({ leiding, onDelete }: LeidingCardProps) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const age = leiding.geboortedatum ? (() => {
    const geboortedatum = new Date(leiding.geboortedatum);
    const today = new Date();
    let age = today.getFullYear() - geboortedatum.getFullYear();
    const m = today.getMonth() - geboortedatum.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < geboortedatum.getDate())) {
      age--;
    }
    return age;
  })() : null;

  const handleDelete = async () => {
    try {
      await deleteLeiding(leiding.id);
      toast.success("Leiding werd verwijderd.");
      setDialogOpen(false);
      onDelete?.(leiding.id);
    } catch (err) {
      toast.error("Verwijderen mislukt. Probeer opnieuw.");
    }
  };

  return (
    <>
      <div className="bg-card text-card-foreground relative flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
        {/* Dropdown Menu */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate(`edit/${leiding.id}`, { viewTransition: true })}
              >
                <Edit className="mr-2 h-4 w-4" /> Bewerken
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => setDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Verwijderen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={leiding.foto_url ?? ""} alt={`${leiding.voornaam} ${leiding.familienaam}`} />
            <AvatarFallback className="text-xl">
              {leiding.voornaam.charAt(0)}
              {leiding.familienaam.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-lg font-semibold">{leiding.voornaam} {leiding.familienaam}</p>
            {age !== null && <p className="text-sm text-muted-foreground">{age} jaar oud</p>}
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription>
              Je staat op het punt om <strong>{leiding.voornaam} {leiding.familienaam}</strong> permanent te verwijderen.
              Deze actie kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Verwijder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeidingCard;