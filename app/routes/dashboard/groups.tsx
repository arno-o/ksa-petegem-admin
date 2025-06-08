import PageLayout from "../pageLayout";
import type { Route } from "./+types/groups";
import PrivateRoute from "~/context/PrivateRoute"

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Groepen" },
  ];
}

export default function Groups() {
  return (
    <PrivateRoute>
      <PageLayout>
        Leeftijdsgroepen
      </PageLayout>
    </PrivateRoute>
  );
}