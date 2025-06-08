import PageLayout from "../pageLayout"
import type { Route } from "./+types/news"
import PrivateRoute from "~/context/PrivateRoute"


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Berichten" },
  ];
}

export default function News() {
  return (
    <PrivateRoute>
      <PageLayout>
        Berichten
      </PageLayout>
    </PrivateRoute>
  );
}
