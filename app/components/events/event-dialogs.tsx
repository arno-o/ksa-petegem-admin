// event-dialog.tsx
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { EventFormFields } from "./event-form-fields";
import { useIsMobile } from "~/hooks/use-mobile"; // Import your custom hook

import type { EventFormState } from "../../types";
import type { Option } from "~/components/ui/multiselect";

interface Props {
  form: EventFormState;
  setForm: React.Dispatch<React.SetStateAction<EventFormState>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  groupOptions: Option[];
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: () => void;
  isEdit?: boolean;
}

export function EventDialog({
  form,
  setForm,
  errors,
  setErrors,
  groupOptions,
  open,
  setOpen,
  onSubmit,
  isEdit = false,
}: Props) {
  const isMobile = useIsMobile(); // Use your custom hook

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {!isEdit && (
            <Button className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow duration-200">
              <Plus className="h-4 w-4" /> Nieuwe activiteit
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="px-6 pt-6">
            <DrawerTitle className="text-2xl font-bold">
              {isEdit ? "Bewerk activiteit" : "Nieuwe activiteit"}
            </DrawerTitle>
            <DrawerDescription>
              {isEdit
                ? "Pas de details van deze activiteit aan."
                : "Vul alle velden in om een nieuwe activiteit aan te maken."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-6">
            <EventFormFields
              form={form}
              setForm={setForm}
              errors={errors}
              setErrors={setErrors}
              groupOptions={groupOptions}
            />
          </div>
          <DrawerFooter className="px-6 py-4 border-t bg-background">
            <DrawerClose asChild>
              <Button type="button" variant="outline">Annuleer</Button>
            </DrawerClose>
            <Button type="submit" onClick={onSubmit}>
              {isEdit ? "Opslaan" : "Activiteit aanmaken"}
            </Button>
          </DrawerFooter>
        </DrawerContent>

      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!isEdit && (
          <Button className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow duration-200">
            <Plus className="h-4 w-4" /> Nieuwe activiteit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[92vw] sm:max-w-[640px] p-0 max-h-[90vh] overflow-visible">

        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "Bewerk activiteit" : "Nieuwe activiteit"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Pas de details van deze activiteit aan."
              : "Vul alle velden in om een nieuwe activiteit aan te maken."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          <EventFormFields
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
            groupOptions={groupOptions}
          />
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-background">
          <DialogClose asChild>
            <Button type="button" variant="outline">Annuleer</Button>
          </DialogClose>
          <Button type="submit" onClick={onSubmit}>
            {isEdit ? "Opslaan" : "Activiteit aanmaken"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}