// components/groups/GroupForm.tsx
import { z } from "zod";
import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export const groupSchema = z.object({
  naam: z.string().min(2, "Minstens 2 tekens"),
  omschrijving: z.string().optional().default(""),
  info: z.string().optional().default(""),
  slug: z
    .string()
    .min(2, "Minstens 2 tekens")
    .regex(/^[a-z0-9-]+$/, "Alleen kleine letters, cijfers en koppeltekens"),
  active: z.boolean().default(true),
});

// Use z.input instead of z.infer
export type GroupFormValues = z.input<typeof groupSchema>;

type Props = {
  initial?: Partial<GroupFormValues>;
  submitting?: boolean;
  onSubmit: (values: GroupFormValues) => Promise<void> | void;
  onCancel?: () => void;
  /** "onSubmit" for Create (no blur validation), "onBlur" for Edit */
  validationMode?: "onSubmit" | "onBlur";
};

export default function GroupForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
  validationMode = "onBlur",
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    clearErrors,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      naam: "",
      omschrijving: "",
      info: "",
      slug: "",
      active: true,
      ...initial,
    },
    mode: validationMode,
    shouldUnregister: true,
  });

  const slugify = (input: string) => {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  useEffect(() => {
    reset({
      naam: initial?.naam ?? "",
      omschrijving: initial?.omschrijving ?? "",
      info: initial?.info ?? "",
      slug: initial?.slug ?? "",
      active: initial?.active ?? true,
    });
  }, [initial, reset]);

  const naam = watch("naam");
  const slug = watch("slug");
  const initSlug = useMemo(() => slugify(initial?.naam ?? ""), [initial?.naam]);

  useEffect(() => {
    if (!initial?.slug || slug === initSlug) {
      setValue("slug", slugify(naam ?? ""));
    }
  }, [naam]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleCancel = () => {
    clearErrors();
    if (isDirty) {
      const confirmLeave = window.confirm(
        "Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt annuleren?"
      );
      if (!confirmLeave) return;
    }
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
      {hasErrors && validationMode !== "onSubmit" && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
          Sommige velden bevatten fouten. Kijk je ze even na?
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="naam">Naam</Label>
          <Input id="naam" placeholder="Bv. Jongknapen" {...register("naam")} autoFocus />
          {errors.naam && <p className="text-sm text-destructive">{errors.naam.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (url)</Label>
          <Input id="slug" placeholder="jongknapen" {...register("slug")} />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="omschrijving">Korte omschrijving</Label>
        <Textarea id="omschrijving" rows={3} {...register("omschrijving")} className="max-h-[150px]" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="info">Uitgebreide info</Label>
        <Textarea id="info" rows={6} {...register("info")} />
      </div>

      <div className="flex items-center gap-3">
        <Controller
          name="active"
          control={control}
          render={({ field: { value, onChange } }) => (
            <>
              <Switch id="active" checked={!!value} onCheckedChange={onChange} />
              <Label htmlFor="active">Actief</Label>
            </>
          )}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={submitting || isSubmitting}
            className="sm:w-auto w-full"
          >
            Annuleren
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitting || isSubmitting || (!isDirty && validationMode !== "onSubmit")}
          className="sm:w-auto w-full"
        >
          {submitting || isSubmitting ? "Opslaan..." : "Opslaan"}
        </Button>
      </div>
    </form>
  );
}