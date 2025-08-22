// active.tsx

// React and Hooks
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useIsMobile } from "~/hooks/use-mobile";
import { toast } from "sonner";

// TanStack Table
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable, createColumnHelper, } from "@tanstack/react-table";

// Lucide Icons
import { CalendarArrowUp, Crown, Star, UserPlus, MoreVertical, Edit, ShieldX, Trash2, Search, Users, Download, FileSpreadsheet, FileBadge2, ListChecks, UserMinus2 } from "lucide-react";

// UI Components (shadcn/ui or custom)
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "~/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger, } from "~/components/ui/tooltip";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue, } from "~/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, } from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Checkbox } from "~/components/ui/checkbox";

// Context & Layout
import PrivateRoute from "~/context/PrivateRoute";
import PageLayout from "../../pageLayout";

// Data Utilities & Types
import type { Group, Leiding } from "~/types";
import type { Route } from "../users/+types/active";
import {
  createLeiding, fetchActiveGroups, fetchActiveLeiding,
  deleteLeiding, disableLeiding, massUpdateLeiding, // Import the new function
  deleteFromBucket
} from "~/utils/data";

// Export Libraries
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// @ts-ignore - autoTable might not have full TS definitions
import autoTable from 'jspdf-autotable'; // Correct import for jspdf-autotable

export function meta({ }: Route.MetaArgs) {
  return [{ title: "KSA Admin - Leiding" }];
}

const columnHelper = createColumnHelper<Leiding>();

export default function Active() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // For "Nieuwe leiding aanmaken"
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>();
  const [leiding, setLeiding] = useState<Leiding[]>();
  const [filteredLeiding, setFilteredLeiding] = useState<Leiding[]>();
  const [selectedFilter, setSelectedFilter] = useState<string>("all_by_group");

  // State for row selection
  const [rowSelection, setRowSelection] = useState({});

  // State for "Nieuwe leiding aanmaken" form
  const [voornaam, setVoornaam] = useState("");
  const [familienaam, setFamilienaam] = useState("");
  const [leidingsploeg, setLeidingsploeg] = useState<string>("");

  // States for action dialogs (Delete, Disable)
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [disableConfirmDialog, setDisableConfirmDialog] = useState(false);
  const [selectedLeidingForDialog, setSelectedLeidingForDialog] = useState<Leiding | null>(null);

  // New states for search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // NEW: States for Mass Edit
  const [massWipeGroupDialog, setMassWipeGroupDialog] = useState(false);
  const [massEditGroupDialog, setMassEditGroupDialog] = useState(false);
  const [massDisableDialog, setMassDisableDialog] = useState(false);
  const [selectedMassEditGroup, setSelectedMassEditGroup] = useState<string>("");


  // Debounce effect for search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Color maps (assuming these are constant, can be moved outside the component)
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

  // Helper to reload all necessary data
  const reloadData = async () => {
    setLoading(true);
    try {
      const groupData = await fetchActiveGroups();
      setGroups(groupData);
      const leidingData = await fetchActiveLeiding();
      setLeiding(leidingData);
      setRowSelection({}); // Clear row selection after data reload
    } catch (err) {
      console.error("Failed to reload data:", err);
      toast.error("Fout bij het vernieuwen van de gegevens.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []); // Initial load

  // Effect to filter and sort leiding whenever 'leiding' data, 'selectedFilter', or 'debouncedSearchTerm' changes
  useEffect(() => {
    if (!leiding) {
      setFilteredLeiding([]);
      return;
    }

    let tempLeiding = [...leiding]; // Create a mutable copy to sort

    // Apply main filter based on selected group/category
    if (selectedFilter === "*") {
      tempLeiding.sort((a, b) => {
        const dateA_sinds = a.leiding_sinds ? new Date(a.leiding_sinds) : new Date(0);
        const dateB_sinds = b.leiding_sinds ? new Date(b.leiding_sinds) : new Date(0);
        if (dateA_sinds.getTime() !== dateB_sinds.getTime()) {
          return dateA_sinds.getTime() - dateB_sinds.getTime();
        }

        const dateA_geb = a.geboortedatum ? new Date(a.geboortedatum) : new Date(0);
        const dateB_geb = b.geboortedatum ? new Date(b.geboortedatum) : new Date(0);
        return dateA_geb.getTime() - dateB_geb.getTime();
      });
    } else if (selectedFilter === "trekkers") {
      tempLeiding = leiding.filter(person => person.trekker);
      tempLeiding.sort((a, b) => {
        const groupA = groups?.find(g => g.id === a.leidingsploeg)?.naam || '';
        const groupB = groups?.find(g => g.id === b.leidingsploeg)?.naam || '';
        return groupA.localeCompare(groupB);
      });
    } else if (selectedFilter === "hoofdleiding") {
      tempLeiding = leiding.filter(person => person.hoofdleiding);
      tempLeiding.sort((a, b) => a.voornaam.localeCompare(b.voornaam));
    } else if (selectedFilter === "all_by_group") { // New option: All Leiding (by Group)
      // Sort first by leidingsploeg (handling null/undefined), then by voornaam
      tempLeiding.sort((a, b) => {
        const groupA = a.leidingsploeg ?? Number.MAX_SAFE_INTEGER;
        const groupB = b.leidingsploeg ?? Number.MAX_SAFE_INTEGER;
        if (groupA !== groupB) {
          return groupA - groupB;
        }
        // If groups are the same, sort by first name
        return (a.voornaam || '').localeCompare(b.voornaam || '');
      });
    } else {
      const selectedGroupId = Number(selectedFilter);
      tempLeiding = leiding.filter(person => person.leidingsploeg === selectedGroupId);

      tempLeiding.sort((a, b) => {
        if (a.trekker && !b.trekker) return -1;
        if (!a.trekker && b.trekker) return 1;

        const dateA_sinds = a.leiding_sinds ? new Date(a.leiding_sinds) : new Date(0);
        const dateB_sinds = b.leiding_sinds ? new Date(b.leiding_sinds) : new Date(0);
        return dateA_sinds.getTime() - dateB_sinds.getTime();
      });
    }

    // Apply search filter (case-insensitive on voornaam and familienaam)
    if (debouncedSearchTerm) {
      const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
      tempLeiding = tempLeiding.filter(person => {
        const group = groups?.find(g => g.id === person.leidingsploeg);
        const groupName = group?.naam?.toLowerCase() || '';

        return (
          (person.voornaam?.toLowerCase().includes(lowerCaseSearchTerm) ?? false) ||
          (person.familienaam?.toLowerCase().includes(lowerCaseSearchTerm) ?? false) ||
          (person.leiding_sinds?.toString().includes(lowerCaseSearchTerm) ?? false) ||
          groupName.includes(lowerCaseSearchTerm)
        );
      });
    }

    setFilteredLeiding(tempLeiding);
  }, [leiding, selectedFilter, debouncedSearchTerm, groups]);


  const handleCreate = async () => {
    if (!voornaam || !familienaam || !leidingsploeg) {
      toast.error("Vul alle velden in om een nieuwe leiding aan te maken.");
      return;
    }

    try {
      const newId = await createLeiding({ voornaam, familienaam, leidingsploeg: Number(leidingsploeg), actief: true }); // Ensure new leiding is active
      setOpen(false);
      setVoornaam("");
      setFamilienaam("");
      setLeidingsploeg("");
      toast.success("Nieuwe leiding succesvol aangemaakt!");
      navigate(`/leiding/actief/edit/${newId.id}`);
    } catch (err) {
      toast.error("Aanmaken mislukt. Probeer opnieuw.");
      console.error("Failed to create new leiding:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedLeidingForDialog) return;
    try {
      if (selectedLeidingForDialog.foto_url) {
        try {
          const deleteURL = selectedLeidingForDialog.foto_url;
          await deleteFromBucket("leiding-fotos", deleteURL);
        } catch (bucketErr) {
          console.error("Failed to delete image from bucket:", bucketErr);
          toast.error(String(bucketErr));
          return;
        }
      }
      await deleteLeiding(selectedLeidingForDialog.id);
      toast.success("Leiding werd definitief verwijderd.");
      setDeleteDialog(false); // Close the dialog
      await reloadData();
      setSelectedLeidingForDialog(null);
    } catch (err) {
      toast.error("Verwijderen mislukt. Probeer opnieuw.");
      console.error("Failed to delete leiding:", err);
    }
  };

  const handleDisable = async () => {
    if (!selectedLeidingForDialog) return;
    try {
      await disableLeiding(selectedLeidingForDialog.id);
      toast.success("Leiding is succesvol inactief gezet.");
      setDisableConfirmDialog(false); // Close the dialog
      await reloadData();
      setSelectedLeidingForDialog(null);
    } catch (err) {
      toast.error("Inactief zetten mislukt. Probeer opnieuw.");
      console.error("Failed to disable leiding:", err);
    }
  };

  const handleMassWipe = async () => {
    const selectedLeidingIds =
      table.getSelectedRowModel().rows.map(r => r.original.id);

    if (selectedLeidingIds.length === 0) {
      toast.info("Geen leiding geselecteerd om groep te wissen.");
      return;
    }

    try {
      await massUpdateLeiding({
        leidingIds: selectedLeidingIds,
        updateData: { leidingsploeg: null },
      });

      toast.success(`Groep gewist voor ${selectedLeidingIds.length} leiding.`);
      setMassWipeGroupDialog(false); // Close the dialog
      await reloadData();
    } catch (err) {
      toast.error("Groep wissen mislukt. Probeer opnieuw.");
      console.error("Failed to mass wipe group:", err);
    }
  };

  const handleMassUpdateGroup = async () => {
    const selectedLeidingIds = table.getSelectedRowModel().rows.map(row => row.original.id);
    if (selectedLeidingIds.length === 0) {
      toast.info("Geen leiding geselecteerd voor massabewerking.");
      return;
    }
    if (!selectedMassEditGroup) {
      toast.error("Selecteer een nieuwe groep.");
      return;
    }

    try {
      await massUpdateLeiding({
        leidingIds: selectedLeidingIds,
        updateData: { leidingsploeg: Number(selectedMassEditGroup) }
      });
      toast.success(`${selectedLeidingIds.length} leiding aangepast naar de nieuwe groep.`);
      setMassEditGroupDialog(false); // Close the dialog
      setSelectedMassEditGroup("");
      await reloadData();
    } catch (err) {
      toast.error("Massabewerking groep mislukt. Probeer opnieuw.");
      console.error("Failed to mass update group:", err);
    }
  };

  const handleMassDisable = async () => {
    const selectedLeidingIds = table.getSelectedRowModel().rows.map(row => row.original.id);
    if (selectedLeidingIds.length === 0) {
      toast.info("Geen leiding geselecteerd om inactief te maken.");
      return;
    }

    try {
      await massUpdateLeiding({
        leidingIds: selectedLeidingIds,
        updateData: { actief: false }
      });
      toast.success(`${selectedLeidingIds.length} leiding is succesvol inactief gezet.`);
      setMassDisableDialog(false); // Close the dialog
      await reloadData();
    } catch (err) {
      toast.error("Massabewerking inactief zetten mislukt. Probeer opnieuw.");
      console.error("Failed to mass disable leiding:", err);
    }
  };

  const getFormattedExportData = () => {
    return table.getSelectedRowModel().rows.map(row => {
      const leiding = row.original;
      const group = groups?.find(g => g.id === leiding.leidingsploeg);
      const groupName = group?.naam || 'Onbekend';
      const formattedDob = leiding.geboortedatum
        ? new Date(leiding.geboortedatum).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'Onbekend';

      return {
        Voornaam: leiding.voornaam || '',
        Familienaam: leiding.familienaam || '',
        Geboortedatum: formattedDob,
        Groep: groupName,
      };
    });
  };

  const getFilterTitle = () => {
    let filterTitle = "";
    switch (selectedFilter) {
      case "all_by_group":
        filterTitle = "Alle Leiding (per groep)";
        break;
      case "*":
        filterTitle = "Alle Leiding (Anciëniteit)";
        break;
      case "trekkers":
        filterTitle = "Trekkers";
        break;
      case "hoofdleiding":
        filterTitle = "Hoofdleiding";
        break;
      default:
        // If it's a numeric group ID, find the group name
        const selectedGroupId = Number(selectedFilter);
        const group = groups?.find(g => g.id === selectedGroupId);
        filterTitle = group ? `Groep: ${group.naam}` : "Onbekende Filter";
        break;
    }
    return filterTitle;
  };

  const handleExportXLS = () => {
    const exportData = getFormattedExportData();
    if (exportData.length === 0) {
      toast.info("Geen leiding geselecteerd voor export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Actieve Leiding");
    XLSX.writeFile(workbook, "actieve_leiding.xlsx");
    toast.success("Geselecteerde leiding geëxporteerd als XLS!");
  };

  const handleExportPDF = () => {
    const exportData = getFormattedExportData();
    if (exportData.length === 0) {
      toast.info("Geen leiding geselecteerd voor export.");
      return;
    }

    const doc = new jsPDF();
    const filterTypeText = getFilterTitle();
    const pdfTitle = `Leidinglijst - ${filterTypeText}`;

    doc.text(pdfTitle, 14, 20);

    const tableColumn = ["Voornaam", "Familienaam", "Geboortedatum", "Groep"];
    const tableRows = exportData.map(item => [
      item.Voornaam,
      item.Familienaam,
      item.Geboortedatum,
      item.Groep,
    ]);

    // Use autoTable with the expected object format for head and body
    autoTable(doc, {
      head: [tableColumn], // 'head' expects an array of arrays (even for one row)
      body: tableRows,
      startY: 30
    });

    doc.save("actieve_leiding.pdf");
    toast.success("Geselecteerde leiding geëxporteerd als PDF!");
  };

  //@ts-ignore (Remove this if you fix your Leiding type or ColumnDef typing)
  const columns: ColumnDef<Leiding>[] = useMemo(
    () => [
      // Selection Checkbox
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecteer alles"
            className="translate-y-[2px]" // Align checkbox better
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecteer rij"
            className="translate-y-[2px]" // Align checkbox better
          />
        ),
        enableSorting: false,
        enableHiding: false,
      }),
      columnHelper.accessor("voornaam", {
        id: "persoon",
        header: () => "Persoon",
        cell: info => (
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={info.row.original.foto_url ?? ""} alt={`${info.row.original.voornaam || ''} ${info.row.original.familienaam || ''}`} />
              <AvatarFallback>
                {info.row.original.voornaam?.charAt(0) || ''}
                {info.row.original.familienaam?.charAt(0) || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-row items-center gap-2">
              <Link to={`/leiding/actief/edit/${info.row.original.id}`} viewTransition>
                <p className="text-md font-medium leading-none hover:underline">
                  {info.row.original.voornaam} {info.row.original.familienaam}
                </p>
              </Link>
              {info.row.original.trekker && (
                <Tooltip>
                  <TooltipTrigger>
                    <Star className="h-4 w-4 fill-[#0167B1] stroke-[#0167B1]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Trekker
                  </TooltipContent>
                </Tooltip>
              )}

              {info.row.original.hoofdleiding && (
                <Tooltip>
                  <TooltipTrigger>
                    <Crown className="h-4 w-4 fill-[#F37D31] stroke-[#F37D31]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Hoofdleiding
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("leiding_sinds", {
        id: "jarenLeiding",
        header: () => "Jaren leiding",
        cell: info => {
          const leidingSindsValue = info.getValue<string | undefined>();
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
                <div className="text-sm text-muted-foreground">
                  {yearsInLeiding !== null ? `${yearsInLeiding} jaar` : 'Onbekend'}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Leiding sinds {leidingSindsValue ? new Date(leidingSindsValue).getFullYear() : 'Onbekend'}</p>
              </TooltipContent>
            </Tooltip>
          );
        },
      }),
      columnHelper.accessor("geboortedatum", {
        id: "geboortedatum",
        header: () => <div className="flex justify-center">Geboortedatum</div>,
        cell: info => {
          const geboortedatumValue = info.getValue<string | undefined>();
          const formattedGeboortedatum = geboortedatumValue
            ? new Date(geboortedatumValue).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Onbekend';
          return (
            <div className="text-sm text-muted-foreground flex justify-center">
              {formattedGeboortedatum}
            </div>
          );
        },
      }),
      columnHelper.accessor("leidingsploeg", {
        id: "groep",
        header: () => <div className="flex justify-center">Groep</div>,
        cell: info => {
          const leidingPerson = info.row.original;
          const group = groups?.find(g => g.id === leidingPerson.leidingsploeg);
          const groupName = group?.naam;
          const groupTextColorClass = group?.color ? COLOR_MAP[group.color] : "text-foreground";
          const groupBadgeBgClass = group?.color ? BADGE_BACKGROUND_COLOR_MAP[group.color] : "bg-muted";
          const groupBadgeBorderClass = group?.color ? BADGE_BORDER_COLOR_MAP[group.color] : "border-border";

          return (
            <div className="flex justify-center">
              {groupName ? (
                <Badge className={`${groupTextColorClass} ${groupBadgeBgClass} border ${groupBadgeBorderClass}`}>
                  {groupName}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">Onbekend</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="flex justify-end">Acties</div>,
        cell: ({ row }) => {
          const leiding = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu modal={false}>
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
                    onClick={() => { setSelectedLeidingForDialog(leiding); setDisableConfirmDialog(true); }}
                  >
                    <ShieldX className="mr-2 h-4 w-4" /> Inactief zetten
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => { setSelectedLeidingForDialog(leiding); setDeleteDialog(true); }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Verwijderen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [groups, navigate, setSelectedLeidingForDialog, setDisableConfirmDialog, setDeleteDialog, COLOR_MAP, BADGE_BACKGROUND_COLOR_MAP, BADGE_BORDER_COLOR_MAP]
  );

  const table = useReactTable({
    data: filteredLeiding || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  const selectedRowCount = Object.keys(rowSelection).length;

  // active.tsx

  // ... (all the imports and component logic from before)

  return (
    <PrivateRoute>
      <PageLayout>
        <header className="flex flex-col mb-4 gap-4">
          <h3 className="text-2xl font-semibold tracking-tight">Actieve Leiding</h3>
          <div className="flex flex-col md:flex-row md:justify-between gap-2">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative ">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek op naam, groep, jaar leiding..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full md:w-xs"
                />
              </div>
              <Select defaultValue="all_by_group" onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full md:w-fit">
                  <SelectValue placeholder="Kies een groep" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Nuttig</SelectLabel>
                    <SelectItem value="all_by_group">
                      <Users className="mr-2 h-4 w-4" />
                      Alle leiding (per groep)
                    </SelectItem>
                    <SelectItem value="*">
                      <CalendarArrowUp className="mr-2 h-4 w-4" />
                      Alle leiding (Anciëniteit)
                    </SelectItem>
                    <SelectSeparator />
                    <SelectItem value="trekkers">
                      <Star className="mr-2 h-4 w-4" />Trekkers
                    </SelectItem>
                    <SelectItem value="hoofdleiding">
                      <Crown className="mr-2 h-4 w-4" />Hoofdleiding
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

              {isMobile ? <Separator className="my-5" /> : ""}
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              {/* NEW: Mass Action Dropdown */}
              {selectedRowCount > 0 && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"outline"}>
                      <ListChecks className="mr-2 h-4 w-4" />
                      Massa Acties ({selectedRowCount})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onSelect={(e) => e.preventDefault()}>
                    <DropdownMenuItem
                      onClick={() => setMassWipeGroupDialog(true)}
                      className="cursor-pointer"
                    >
                      <UserMinus2 className="mr-2 h-4 w-4" /> Groep wissen
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setMassEditGroupDialog(true)}
                      className="cursor-pointer"
                    >
                      <Users className="mr-2 h-4 w-4" /> Groep wijzigen
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setMassDisableDialog(true)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <ShieldX className="mr-2 h-4 w-4 text-destructive" /> Inactief zetten
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"outline"}
                    disabled={selectedRowCount === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exporteer ({selectedRowCount})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" >
                  <DropdownMenuItem onClick={handleExportXLS}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export als XLS
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileBadge2 className="mr-2 h-4 w-4" /> Export als PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto"><UserPlus className="mr-2 h-4 w-4" />Voeg Leiding Toe</Button>
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
                      <Select onValueChange={setLeidingsploeg} value={leidingsploeg}>
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
          </div>
        </header>

        <div className="rounded-lg border bg-background/50 dark:bg-background/30 shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Geen leiding gevonden voor de geselecteerde filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Weet je het zeker?</DialogTitle>
              <DialogDescription>
                Je staat op het punt om **{selectedLeidingForDialog?.voornaam} {selectedLeidingForDialog?.familienaam}** definitief te verwijderen. Deze actie kan niet ongedaan worden gemaakt.
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

        {/* Disable Confirmation Dialog (for active -> inactive) */}
        <Dialog open={disableConfirmDialog} onOpenChange={setDisableConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Weet je het zeker?</DialogTitle>
              <DialogDescription>
                Je staat op het punt om <strong>{selectedLeidingForDialog?.voornaam} {selectedLeidingForDialog?.familienaam}</strong> te markeren als oud-leiding en te verwijderen van de huidige <u>ksapetegem.be</u> website.
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

        <Dialog open={massWipeGroupDialog} onOpenChange={setMassWipeGroupDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Massa Groep Wissen</DialogTitle>
              <DialogDescription>
                Je staat op het punt om <strong>{selectedRowCount}</strong> geselecteerde leiding hun groep te wissen.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMassWipeGroupDialog(false)}>
                Annuleren
              </Button>
              <Button variant="destructive" onClick={handleMassWipe}>
                Groep wissen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={massEditGroupDialog} onOpenChange={setMassEditGroupDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Massa Groep Wijzigen</DialogTitle>
              <DialogDescription>
                Wijzig de groep voor de geselecteerde <strong>{selectedRowCount}</strong> leiding.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="mass-edit-group" className="text-right">Nieuwe Leidingsgroep</Label>
                <Select onValueChange={setSelectedMassEditGroup} value={selectedMassEditGroup}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Kies nieuwe groep" />
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
              <Button variant="outline" onClick={() => { setMassEditGroupDialog(false); setSelectedMassEditGroup(""); }}>
                Annuleren
              </Button>
              <Button onClick={handleMassUpdateGroup} disabled={!selectedMassEditGroup}>
                Groep aanpassen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={massDisableDialog} onOpenChange={setMassDisableDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Massa Inactief Zetten</DialogTitle>
              <DialogDescription>
                Je staat op het punt om <strong>{selectedRowCount}</strong> geselecteerde leiding te markeren als oud-leiding en te verwijderen van de huidige website.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMassDisableDialog(false)}>
                Annuleren
              </Button>
              <Button variant="destructive" onClick={handleMassDisable}>
                Leiding inactief plaatsen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </PageLayout>
    </PrivateRoute>
  )
};