// UI Components
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Separator } from "~/components/ui/separator";
import MultipleSelector, { type Option } from "~/components/ui/multiselect";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

// Utilities
import { cn } from "~/lib/utils";

// Types
import type { EventFormState } from "../../types";

// External Libraries
import { format } from "date-fns";
import { CalendarIcon, Clock2Icon } from "lucide-react";

interface Props {
  form: EventFormState;
  setForm: React.Dispatch<React.SetStateAction<EventFormState>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  groupOptions: Option[];
}

export function EventFormFields({
  form,
  setForm,
  errors,
  setErrors,
  groupOptions,
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Locatie</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, location: e.target.value }));
              setErrors((prev) => ({ ...prev, location: "" }));
            }}
            className={cn(errors.location && "border-red-500 focus-visible:ring-red-500 w-fill pl-8")}
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="link">Link (Ravot)</Label>
          <Input
            id="link"
            placeholder="https://"
            value={form.link}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, link: e.target.value }));
              setErrors((prev) => ({ ...prev, link: "" }));
            }}
            className={cn(errors.link && "border-red-500 focus-visible:ring-red-500 w-fill")}
          />
          {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
          <Label htmlFor="date_start">Datum</Label>
          <Popover modal>
            <PopoverTrigger asChild>
              <div className="w-full">
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
              </div>
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="time_start">Startuur</Label>
          <div className="relative flex w-full items-center gap-2">
            <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none" />
            <Input
              id="time_start"
              type="time"
              step="1"
              value={form.time_start}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, time_start: e.target.value }));
                setErrors((prev) => ({ ...prev, time_start: "" }));
              }}
              className="appearance-none pl-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
          {errors.time_start && <p className="text-red-500 text-sm mt-1">{errors.time_start}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="time_end">Einduur</Label>
          <div className="relative flex w-full items-center gap-2">
            <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none" />
            <Input
              id="time_end"
              type="time"
              step="1"
              value={form.time_end}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, time_end: e.target.value }));
                setErrors((prev) => ({ ...prev, time_end: "" }));
              }}
              className="appearance-none pl-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
          {errors.time_end && <p className="text-red-500 text-sm mt-1">{errors.time_end}</p>}
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