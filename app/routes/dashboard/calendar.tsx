import PageLayout from "../pageLayout"
import type { Route } from "./+types/calendar"
import PrivateRoute from "~/context/PrivateRoute"


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Activiteiten" },
  ];
}

export default function Calendar() {
  return (
    <PrivateRoute>
      <PageLayout>
        Activiteiten
      </PageLayout>
    </PrivateRoute>
  );
}
