import type { Route } from "./+types/news";
import PageLayout from "../pageLayout"


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Berichten" },
  ];
}

export default function News() {
  return(
    <PageLayout>
      Berichten pagina
    </PageLayout>
  );
}
