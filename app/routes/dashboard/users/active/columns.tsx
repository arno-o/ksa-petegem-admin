"use client"

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { Star, Crown, MoreVertical, Edit, ShieldX, Trash2 } from "lucide-react";

// UI Components
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "~/components/ui/dropdown-menu";

// Types
import type { Leiding, Group } from "~/types";

// Color maps
const COLOR_MAP: Record<string, string> = {
  yellow: "text-amber-600 dark:text-amber-300",
  blue: "text-blue-600 dark:text-blue-300",
  green: "text-emerald-600 dark:text-emerald-300",
  purple: "text-purple-600 dark:text-purple-300",
  red: "text-red-600 dark:text-red-300",
  orange: "text-orange-600 dark:text-orange-300",
  lime: "text-lime-600 dark:text-lime-300",
  rose: "text-rose-600 dark:text-rose-300",
};

const BADGE_BACKGROUND_COLOR_MAP: Record<string, string> = {
  yellow: "bg-amber-100 dark:bg-amber-900",
  blue: "bg-blue-50 dark:bg-blue-900",
  green: "bg-emerald-50 dark:bg-emerald-900",
  purple: "bg-purple-50 dark:bg-purple-900",
  red: "bg-red-50 dark:bg-red-900",
  orange: "bg-orange-50 dark:bg-orange-900",
  lime: "bg-lime-50 dark:bg-lime-900",
  rose: "bg-rose-50 dark:bg-rose-900",
};

export type ColumnContext = {
  groups: Group[];
  onEdit: (leiding: Leiding) => void;
  onDisable: (leiding: Leiding) => void;
  onDelete: (leiding: Leiding) => void;
};

export const createColumns = (context: ColumnContext): ColumnDef<Leiding>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecteer alles"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecteer rij"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "voornaam",
    id: "persoon",
    header: "Naam",
    cell: ({ row }) => (
      <Link to={`/leiding/actief/edit/${row.original.id}`} viewTransition>
        <div className="flex items-center gap-4">
          <div className="flex flex-row items-center gap-2 py-6 md:py-4">
            <p className="text-sm font-medium leading-none">
              {row.original.voornaam} {row.original.familienaam}
            </p>
            {row.original.trekker && (
              <Tooltip>
                <TooltipTrigger>
                  <Star className="h-4 w-4 fill-[#0167B1] stroke-[#0167B1]" />
                </TooltipTrigger>
                <TooltipContent>Trekker</TooltipContent>
              </Tooltip>
            )}
            {row.original.hoofdleiding && (
              <Tooltip>
                <TooltipTrigger>
                  <Crown className="h-4 w-4 fill-[#F37D31] stroke-[#F37D31]" />
                </TooltipTrigger>
                <TooltipContent>Hoofdleiding</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "leidingsploeg",
    id: "groep",
    header: "Groep",
    cell: ({ row }) => {
      const leidingPerson = row.original;
      const group = context.groups?.find((g) => g.id === leidingPerson.leidingsploeg);
      const groupName = group?.naam;
      const groupTextColorClass = group?.color ? COLOR_MAP[group.color] : "text-foreground";
      const groupBadgeBgClass = group?.color ? BADGE_BACKGROUND_COLOR_MAP[group.color] : "bg-muted";

      return (
        <div>
          {groupName ? (
            <Badge className={`${groupTextColorClass} ${groupBadgeBgClass}`}>
              {groupName}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">Onbekend</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "leiding_sinds",
    id: "jarenLeiding",
    header: "Jaren leiding",
    cell: ({ row }) => {
      const leidingSindsValue = row.original.leiding_sinds;
      const yearsInLeiding = leidingSindsValue
        ? (() => {
            const leidingSinds = new Date(leidingSindsValue);
            const today = new Date();
            let years = today.getFullYear() - leidingSinds.getFullYear();
            const m = today.getMonth() - leidingSinds.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < leidingSinds.getDate())) {
              years--;
            }
            return years + 1;
          })()
        : null;
      return (
        <Tooltip>
          <TooltipTrigger>
            <div className="text-sm leading-none flex justify-center">
              {yearsInLeiding !== null ? `${yearsInLeiding} jaar` : "Onbekend"}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Leiding sinds {leidingSindsValue ? new Date(leidingSindsValue).getFullYear() : "Onbekend"}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "geboortedatum",
    id: "geboortedatum",
    header: "Leeftijd",
    cell: ({ row }) => {
      const geboortedatumValue = row.original.geboortedatum;
      const formattedGeboortedatum = geboortedatumValue
        ? new Date(geboortedatumValue).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" })
        : "Onbekend";
      const birthday = geboortedatumValue ? new Date(geboortedatumValue) : null;
      return (
        <Tooltip>
          <TooltipTrigger>
            <div className="text-sm leading-none flex justify-center">
              {birthday ? `${Math.floor((Date.now() - birthday.getTime()) / (1000 * 60 * 60 * 24 * 365.25))} jaar` : "Onbekend"}
            </div>
          </TooltipTrigger>
          <TooltipContent>{formattedGeboortedatum}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const leiding = row.original;
      return (
        <div className="flex justify-end pr-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Meer opties</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Acties voor {leiding.voornaam}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => context.onEdit(leiding)}>
                <Edit className="mr-2 h-4 w-4" /> Bewerken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => context.onDisable(leiding)}>
                <ShieldX className="mr-2 h-4 w-4" /> Inactief zetten
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => context.onDelete(leiding)}
              >
                <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Verwijderen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
