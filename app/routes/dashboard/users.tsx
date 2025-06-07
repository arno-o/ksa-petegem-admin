import type { Route } from "./+types/users";
import PageLayout from "../pageLayout"

import { toast } from "sonner"
import { Button } from "~/components/ui/button"


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Leiding" },
  ];
}

export default function Users() {
  return (
    <PageLayout>
      
      <Button
        variant="outline"
        onClick={() =>
          toast.info("Dit is een test melding")
        }
      >
        Een nieuwe melding
      </Button>
    </PageLayout>
  );
}
