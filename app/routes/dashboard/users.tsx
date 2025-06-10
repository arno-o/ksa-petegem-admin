import PageLayout from "../pageLayout"
import type { Route } from "./+types/users"
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
        Leiding
      </PageLayout>
    </PrivateRoute>
  );
}
