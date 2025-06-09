import PageLayout from "../pageLayout"
import type { Route } from "./+types/posts"
import PrivateRoute from "~/context/PrivateRoute"


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Berichten" },
  ];
}

export default function Posts() {
  return (
    <PrivateRoute>
      <PageLayout>
        Berichten
      </PageLayout>
    </PrivateRoute>
  );
}
