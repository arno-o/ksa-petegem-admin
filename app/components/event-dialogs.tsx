import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { EventFormFields } from "./event-form-fields";
import type { EventFormState } from "../types";
import type { Option } from "~/components/ui/multiselect";

interface Props {
  form: EventFormState;
  setForm: React.Dispatch<React.SetStateAction<EventFormState>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  groupOptions: Option[];
  TIME_OPTIONS: string[];
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
  TIME_OPTIONS,
  open,
  setOpen,
  onSubmit,
  isEdit = false,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!isEdit && (
          <Button className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow duration-200">
            + Nieuwe activiteit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "Bewerk activiteit" : "Nieuwe activiteit"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Pas de details van deze activiteit aan."
              : "Vul alle velden in om een nieuwe activiteit aan te maken."}
          </DialogDescription>
        </DialogHeader>

        <EventFormFields
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          groupOptions={groupOptions}
          TIME_OPTIONS={TIME_OPTIONS}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuleer
            </Button>
          </DialogClose>
          <Button type="submit" onClick={onSubmit}>
            {isEdit ? "Opslaan" : "Activiteit aanmaken"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}