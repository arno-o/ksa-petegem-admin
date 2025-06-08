import { toast } from "sonner"
import PageLayout from "../pageLayout"
import type { Route } from "./+types/users"
import { Button } from "~/components/ui/button"
import PrivateRoute from "~/context/PrivateRoute"


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Leiding" },
  ];
}

export default function Users() {
  return (
    <PrivateRoute>
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
    </PrivateRoute>
  );
}
