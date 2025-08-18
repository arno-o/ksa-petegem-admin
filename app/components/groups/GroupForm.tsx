// components/groups/GroupForm.tsx
import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";

// ---- Validation schema (no color, no icon_url/brief_url) ----
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
export type GroupFormValues = z.input<typeof groupSchema>;

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

type Props = {
  initial?: Partial<GroupFormValues>;
  submitting?: boolean;
  onSubmit: (values: GroupFormValues) => Promise<void> | void;
  onCancel?: () => void; // ← for better UX
};

export default function GroupForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
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
    mode: "onBlur",
  });

  // Reset form when `initial` changes (e.g., when opening Edit for a different group)
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

  // Auto-generate slug from naam unless user changed it
  useEffect(() => {
    if (!initial?.slug || slug === initSlug) {
      setValue("slug", slugify(naam ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naam]);

  // Basic error summary (accessibility + UX)
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {hasErrors && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
          Sommige velden bevatten fouten. Kijk je ze even na?
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="naam">Naam</Label>
          <Input
            id="naam"
            placeholder="Bv. Jongknapen"
            {...register("naam")}
            autoFocus
            aria-invalid={!!errors.naam}
          />
          {errors.naam && (
            <p className="text-sm text-destructive">{errors.naam.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (url)</Label>
          <Input
            id="slug"
            placeholder="jongknapen"
            {...register("slug")}
            aria-invalid={!!errors.slug}
          />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="omschrijving">Korte omschrijving</Label>
        <Textarea id="omschrijving" rows={3} {...register("omschrijving")} />
        {errors.omschrijving && (
          <p className="text-sm text-destructive">
            {errors.omschrijving.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="info">Uitgebreide info</Label>
        <Textarea id="info" rows={6} {...register("info")} />
        {errors.info && (
          <p className="text-sm text-destructive">{errors.info.message}</p>
        )}
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

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting || isSubmitting}
          >
            Annuleren
          </Button>
        )}
        <Button type="submit" disabled={submitting || isSubmitting || !isDirty}>
          {submitting || isSubmitting ? "Opslaan..." : "Opslaan"}
        </Button>
      </div>
    </form>
  );
}