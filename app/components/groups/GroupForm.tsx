// components/groups/GroupForm.tsx
import { z } from "zod";
import { useEffect } from "react";
import { useIsMobile } from "~/hooks/use-mobile";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";
import { Badge, BadgeCheck } from "lucide-react";

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

type Props = {
  initial?: Partial<GroupFormValues>;
  submitting?: boolean;
  onSubmit: (values: GroupFormValues) => Promise<void> | void;
  onCancel?: () => void;
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
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      naam: initial?.naam ?? "",
      omschrijving: initial?.omschrijving ?? "",
      info: initial?.info ?? "",
      slug: initial?.slug ?? "",
      active: initial?.active ?? true,
    },
    mode: validationMode,
    shouldUnregister: true,
  });

  const slugify = (input: string) => {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-");
  };

  const naam = watch("naam");
  const slug = watch("slug");
  const isEditing = initial?.slug !== undefined && initial?.slug !== "";

  useEffect(() => {
    if (!isEditing && naam !== slug) {
      setValue("slug", slugify(naam));
    }
  }, [naam, slug, isEditing, setValue]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleCancel = () => {
    onCancel?.();
  };

  const isMobile = useIsMobile();

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
        {hasErrors && validationMode !== "onSubmit" && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
            Sommige velden bevatten fouten. Kijk je ze even na?
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="naam" className={errors.naam ? "text-destructive" : undefined}>
              Naam
            </Label>
            <Input
              id="naam"
              placeholder="Bv. Jongknapen"
              {...register("naam")}
              className={errors.naam ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40" : undefined}
            />
            {errors.naam && <p className="text-sm text-destructive">{errors.naam.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className={errors.slug ? "text-destructive" : undefined}>
              Slug (url)
            </Label>
            <Input
              id="slug"
              placeholder="jongknapen"
              {...register("slug")}
              className={errors.slug ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40" : undefined}
            />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="omschrijving">Korte omschrijving</Label>
          <Input id="omschrijving" {...register("omschrijving")} className="max-h-[150px]" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="info">Uitgebreide info</Label>
          <Textarea id="info" rows={3} {...register("info")} />
        </div>

        <div className="flex justify-between flex-col gap-4 md:flex-row md:gap-0">
          <div className="flex items-center gap-3">
            <Controller
              name="active"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Button
                  type="button"
                  variant={value ? "default" : "destructive"}
                  onClick={() => onChange(!value)}
                  aria-pressed={value}
                  className="grow md:w-fit"
                >
                  {value ? <BadgeCheck className="mr-2 h-4 w-4" /> : <Badge className="mr-2 h-4 w-4" />}
                  {value ? "Actief" : "Niet actief"}
                </Button>
              )}
            />
          </div>

          {isMobile ? <Separator /> : undefined}

          <div className="flex items-center gap-2 justify-center w-full md:w-auto">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={submitting || isSubmitting}
                className={isMobile ? "w-[50%]" : undefined}
              >
                Annuleren
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting || isSubmitting || (!isDirty && validationMode !== "onSubmit")}
              className={isMobile ? "w-[50%]" : undefined}
            >
              {submitting || isSubmitting ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}