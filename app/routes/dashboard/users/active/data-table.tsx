import * as React from "react";
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Search, ListChecks, Download, FileSpreadsheet, FileBadge2, UserMinus2, Users, ShieldX } from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "~/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Separator } from "~/components/ui/separator";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

// Types
import type { Leiding, Group } from "~/types";

// Export Libraries
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
// @ts-ignore - autoTable might not have full TS definitions
import autoTable from "jspdf-autotable";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  groups: Group[];
  isMobile: boolean;
  sortBy: string;
  onSortChange: (sort: string) => void;
  filterByGroup: string[];
  onFilterGroupChange: (groups: string[]) => void;
  filterByFunction: string[];
  onFilterFunctionChange: (functions: string[]) => void;
  onMassWipe: (selectedIds: number[]) => void;
  onMassEditGroup: (selectedIds: number[]) => void;
  onMassDisable: (selectedIds: number[]) => void;
}

export function DataTable<TData extends Leiding, TValue>({
  columns,
  data,
  groups,
  isMobile,
  sortBy,
  onSortChange,
  filterByGroup,
  onFilterGroupChange,
  filterByFunction,
  onFilterFunctionChange,
  onMassWipe,
  onMassEditGroup,
  onMassDisable,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Search state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");

  // Debounce effect for search term
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!debouncedSearchTerm) return data;

    const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
    return data.filter((item) => {
      const group = groups?.find((g) => g.id === item.leidingsploeg);
      const groupName = group?.naam?.toLowerCase() || "";

      return (
        (item.voornaam?.toLowerCase().includes(lowerCaseSearchTerm) ?? false) ||
        (item.familienaam?.toLowerCase().includes(lowerCaseSearchTerm) ?? false) ||
        (item.leiding_sinds?.toString().includes(lowerCaseSearchTerm) ?? false) ||
        groupName.includes(lowerCaseSearchTerm)
      );
    });
  }, [data, debouncedSearchTerm, groups]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRowCount = Object.keys(rowSelection).length;

  const getSelectedIds = (): number[] => {
    return table.getSelectedRowModel().rows.map(row => row.original.id);
  };

  const getFormattedExportData = () => {
    return table.getSelectedRowModel().rows.map((row) => {
      const leiding = row.original;
      const group = groups?.find((g) => g.id === leiding.leidingsploeg);
      const groupName = group?.naam || "Onbekend";
      const formattedDob = leiding.geboortedatum
        ? new Date(leiding.geboortedatum).toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric" })
        : "Onbekend";

      return {
        Voornaam: leiding.voornaam || "",
        Familienaam: leiding.familienaam || "",
        Geboortedatum: formattedDob,
        Groep: groupName,
      };
    });
  };

  const getFilterTitle = () => {
    let parts: string[] = [];
    
    // Add sort description
    if (sortBy === "age") parts.push("Leeftijd");
    else if (sortBy === "ancienniteit") parts.push("Anciëniteit");
    else if (sortBy === "alphabet") parts.push("Alfabetisch");
    else if (sortBy === "group") parts.push("Per groep");
    
    // Add function filter
    if (filterByFunction.includes("trekkers")) parts.push("Trekkers");
    if (filterByFunction.includes("hoofdleiding")) parts.push("Hoofdleiding");
    
    // Add group filter
    if (filterByGroup.length > 0) {
      const selectedGroups = filterByGroup
        .map(id => groups?.find((g) => g.id === Number(id))?.naam)
        .filter(Boolean);
      if (selectedGroups.length > 0) {
        parts.push(selectedGroups.join(", "));
      }
    }
    
    return parts.length > 0 ? `Leidinglijst - ${parts.join(" - ")}` : "Leidinglijst";
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
    const tableRows = exportData.map((item) => [item.Voornaam, item.Familienaam, item.Geboortedatum, item.Groep]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("actieve_leiding.pdf");
    toast.success("Geselecteerde leiding geëxporteerd als PDF!");
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:justify-between gap-2">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Zoeken" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-full md:w-xs" />
          </div>
          
          {/* Sort By */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sorteren op" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sorteren op</SelectLabel>
                <SelectItem value="group">Per groep</SelectItem>
                <SelectItem value="age">Leeftijd</SelectItem>
                <SelectItem value="ancienniteit">Anciëniteit</SelectItem>
                <SelectItem value="alphabet">Alfabetisch</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Filter by Group - Faceted */}
          <DataTableFacetedFilter
            title="Groep"
            options={groups?.sort((a, b) => a.id - b.id).map((g) => ({
              label: g.naam,
              value: String(g.id),
            })) || []}
            selectedValues={new Set(filterByGroup)}
            onSelectionChange={onFilterGroupChange}
          />

          {/* Filter by Function - Faceted */}
          <DataTableFacetedFilter
            title="Functie"
            options={[
              { label: "Trekkers", value: "trekkers" },
              { label: "Hoofdleiding", value: "hoofdleiding" },
            ]}
            selectedValues={new Set(filterByFunction)}
            onSelectionChange={onFilterFunctionChange}
          />

          {isMobile && <Separator className="my-5" />}
        </div>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {selectedRowCount > 0 && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Massa Acties ({selectedRowCount})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onSelect={(e) => e.preventDefault()}>
                <DropdownMenuItem onClick={() => onMassWipe(getSelectedIds())} className="cursor-pointer">
                  <UserMinus2 className="mr-2 h-4 w-4" /> Groep wissen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMassEditGroup(getSelectedIds())} className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" /> Groep wijzigen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onMassDisable(getSelectedIds())} className="text-destructive focus:text-destructive cursor-pointer">
                  <ShieldX className="mr-2 h-4 w-4 text-destructive" /> Inactief zetten
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={selectedRowCount === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exporteer ({selectedRowCount})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportXLS}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export als XLS
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileBadge2 className="mr-2 h-4 w-4" /> Export als PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-muted bg-background/50 dark:bg-background/30 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
