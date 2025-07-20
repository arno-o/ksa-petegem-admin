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
import { MoreVertical, Edit, Trash2, ShieldX, Undo2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
// Import the new functions from data.ts
import { deleteLeiding, disableLeiding, restoreLeiding } from "~/utils/data";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { Badge } from "~/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";


interface LeidingCardProps {
  leiding: Leiding;
  onDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
  onDisable?: (id: number) => void; // New prop for disable, useful for Active.tsx
  groupName?: string;
  groupTextColorClass?: string;
  groupBadgeBgClass?: string;
  groupBadgeBorderClass?: string;
  isInactiveMode?: boolean;
}

const LeidingCard = ({
  leiding,
  onDelete,
  onRestore,
  onDisable, // Destructure new prop
  isInactiveMode = false,
}: LeidingCardProps) => {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [restoreConfirmDialog, setRestoreConfirmDialog] = useState(false);
  const [disableConfirmDialog, setDisableConfirmDialog] = useState(false);

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
        return years + 1;
      })()
    : null;

  const formattedGeboortedatum = leiding.geboortedatum
    ? new Date(leiding.geboortedatum).toLocaleDateString('nl-BE')
    : 'Onbekend';

  const handleDelete = async () => {
    try {
      await deleteLeiding(leiding.id);
      toast.success("Leiding werd definitief verwijderd.");
      setDeleteDialog(false);
      onDelete?.(leiding.id);
    } catch (err) {
      toast.error("Verwijderen mislukt. Probeer opnieuw.");
      console.error("Failed to delete leiding:", err);
    }
  };

  const handleDisable = async () => {
    try {
      await disableLeiding(leiding.id); // Use the data.ts function
      toast.success("Leiding is succesvol inactief gezet.");
      setDisableConfirmDialog(false);
      onDisable?.(leiding.id); // Notify parent (Active.tsx) to remove from active list
    } catch (err) {
      toast.error("Inactief zetten mislukt. Probeer opnieuw.");
      console.error("Failed to disable leiding:", err);
    }
  };

  const handleRestore = async () => {
    try {
      await restoreLeiding(leiding.id); // Use the data.ts function
      toast.success("Leiding is succesvol hersteld en is nu actief.");
      setRestoreConfirmDialog(false);
      onRestore?.(leiding.id); // Notify parent (Inactive.tsx) to remove from inactive list
    } catch (err) {
      toast.error("Herstellen mislukt. Probeer opnieuw.");
      console.error("Failed to restore leiding:", err);
    }
  };


  return (
    <>
      {/* Desktop/Tablet View (md and up) */}
      <div className={`hidden md:grid gap-4 items-center px-4 py-3 border-b bg-card/30 dark:bg-card/20 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors last:border-b-0
        ${isInactiveMode ? "grid-cols-[1fr_0.8fr]" : "grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr]"}`}>
        {/* Persoon (Column 1) */}
        <div className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
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
            {isInactiveMode && age !== null && (
              <p className="text-sm text-muted-foreground leading-none mt-0.5">
                {age} jaar oud
              </p>
            )}
          </div>
        </div>

        {!isInactiveMode && (
          <>
            <div className="text-sm text-muted-foreground">
              {yearsInLeiding !== null ? `${yearsInLeiding} jaar` : 'Onbekend'}
            </div>
            <div className="text-sm text-muted-foreground flex justify-center">
              {formattedGeboortedatum}
            </div>
          </>
        )}

        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Meer opties</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {!isInactiveMode ? (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate(`edit/${leiding.id}`, { viewTransition: true })}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Bewerken
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDisableConfirmDialog(true)}
                  >
                    <ShieldX className="mr-2 h-4 w-4" /> Inactief zetten
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => setRestoreConfirmDialog(true)}>
                  <Undo2 className="mr-2 h-4 w-4" /> Herstellen
                </DropdownMenuItem>
              )}
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

      {/* Mobile View (sm and down) - Card-like layout */}
      <div className={`flex items-center gap-4 px-4 py-4 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors md:hidden border-b bg-card/30 dark:bg-card/20 last:border-b-0`}>
        <Avatar className="h-12 w-12">
          <AvatarImage src={leiding.foto_url ?? ""} alt={`${leiding.voornaam} ${leiding.familienaam}`} />
          <AvatarFallback>
            {leiding.voornaam.charAt(0)}
            {leiding.familienaam.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-left flex-grow">
          <p className="text-lg font-bold leading-tight">
            {leiding.voornaam} {leiding.familienaam}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Meer opties</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {!isInactiveMode ? (
              <>
                <DropdownMenuItem
                  onClick={() => navigate(`edit/${leiding.id}`, { viewTransition: true })}
                >
                  <Edit className="mr-2 h-4 w-4" /> Bewerken
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDisableConfirmDialog(true)}
                >
                  <ShieldX className="mr-2 h-4 w-4" /> Inactief zetten
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => setRestoreConfirmDialog(true)}>
                <Undo2 className="mr-2 h-4 w-4" /> Herstellen
              </DropdownMenuItem>
            )}
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


      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription>
              Je staat op het punt om <strong>{leiding.voornaam} {leiding.familienaam}</strong> definitief te verwijderen. Deze actie kan niet ongedaan worden gemaakt.
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

      {/* Restore Confirmation Dialog (for inactive -> active) */}
      <Dialog open={restoreConfirmDialog} onOpenChange={setRestoreConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leiding herstellen?</DialogTitle>
            <DialogDescription>
              Je staat op het punt om <strong>{leiding.voornaam} {leiding.familienaam}</strong> te herstellen naar actieve leiding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreConfirmDialog(false)}>
              Annuleren
            </Button>
            <Button onClick={handleRestore}>
              Herstel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation Dialog (for active -> inactive) */}
      <Dialog open={disableConfirmDialog} onOpenChange={setDisableConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
            <DialogDescription>
              Je staat op het punt om <strong>{leiding.voornaam} {leiding.familienaam}</strong> te markeren als oud-leiding en te verwijderen van de huidige <u>ksapetegem.be</u> website.
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
    </>
  );
};

export default LeidingCard;