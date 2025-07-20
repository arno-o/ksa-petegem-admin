// UI Components
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Separator } from "~/components/ui/separator";
import MultipleSelector, { type Option } from "~/components/ui/multiselect";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

// Utilities
import { cn } from "~/lib/utils";

// Types
import type { EventFormState } from "../../types";

// External Libraries
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface Props {
  form: EventFormState;
  setForm: React.Dispatch<React.SetStateAction<EventFormState>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  groupOptions: Option[];
  TIME_OPTIONS: string[];
}

export function EventFormFields({
  form,
  setForm,
  errors,
  setErrors,
  groupOptions,
  TIME_OPTIONS,
}: Props) {
  return (
    <div className="grid gap-4 py-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, title: e.target.value }));
            setErrors((prev) => ({ ...prev, title: "" }));
          }}
          className={cn(errors.title && "border-red-500 focus-visible:ring-red-500")}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Locatie</Label>
        <Input
          id="location"
          value={form.location}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, location: e.target.value }));
            setErrors((prev) => ({ ...prev, location: "" }));
          }}
          className={cn(errors.location && "border-red-500 focus-visible:ring-red-500")}
        />
        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
      </div>

      <Separator />

      <div className="grid grid-cols-5 gap-4">
        <div className="flex flex-col gap-2 col-span-3">
          <Label htmlFor="date_start">Startdatum</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.date_start && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="inline h-4 w-4" />
                {form.date_start ? format(form.date_start, "dd/MM/yyyy") : "Kies een datum"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.date_start}
                onSelect={(date) => {
                  setForm((prev) => ({ ...prev, date_start: date ?? undefined }));
                  setErrors((prev) => ({ ...prev, date_start: "" }));
                }}
                defaultMonth={form.date_start}
              />
            </PopoverContent>
          </Popover>
          {errors.date_start && <p className="text-red-500 text-sm mt-1">{errors.date_start}</p>}
        </div>

        <div className="flex flex-col gap-2 col-span-2">
          <Label htmlFor="time_start">Starttijd</Label>
          <Select
            value={form.time_start}
            onValueChange={(value) => {
              setForm((prev) => ({ ...prev, time_start: value }));
              setErrors((prev) => ({ ...prev, time_start: "" }));
            }}
          >
            <SelectTrigger className={cn("w-full", errors.time_start && "border-red-500 focus-visible:ring-red-500")}>
              <SelectValue placeholder="Kies een tijd" />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.time_start && <p className="text-red-500 text-sm mt-1">{errors.time_start}</p>}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="flex flex-col gap-2 col-span-3">
          <Label htmlFor="date_end" className="text-neutral-500">Einddatum (*)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.date_end && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {form.date_end ? format(form.date_end, "dd/MM/yyyy") : <span>Kies een datum</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.date_end}
                onSelect={(date) => setForm((prev) => ({ ...prev, date_end: date ?? undefined }))}
                defaultMonth={form.date_end}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2 col-span-2">
          <Label htmlFor="time_end" className="text-neutral-500">Eindtijd (*)</Label>
          <Select
            value={form.time_end}
            onValueChange={(value) => setForm((prev) => ({ ...prev, time_end: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Kies een tijd" />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <Label htmlFor="groups">Groepen</Label>
        <MultipleSelector
          value={groupOptions.filter((opt) => form.target_groups.includes(Number(opt.value)))}
          onChange={(selected) => {
            setForm((prev) => ({
              ...prev,
              target_groups: selected.map((option) => Number(option.value)),
            }));
            setErrors((prev) => ({ ...prev, target_groups: "" }));
          }}
          defaultOptions={groupOptions}
          hidePlaceholderWhenSelected
          emptyIndicator={<p className="text-center text-sm">Geen resultaten gevonden</p>}
          className={cn(errors.target_groups && "border border-red-500 focus-visible:ring-red-500")}
        />
        {errors.target_groups && <p className="text-red-500 text-sm mt-1">{errors.target_groups}</p>}
      </div>
    </div>
  );
}