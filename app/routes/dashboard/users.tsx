import type { Route } from "./+types/users";
import PageLayout from "../pageLayout"


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Leiding" },
  ];
}

export default function Users() {
  return(
    <PageLayout>
      Leiding Pagina
    </PageLayout>
  );
}
