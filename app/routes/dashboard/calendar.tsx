import type { Route } from "./+types/calendar";
import PageLayout from "../pageLayout"


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Activiteiten" },
  ];
}

export default function Calendar() {
  return(
    <PageLayout>
      Activiteiten
    </PageLayout>
  );
}
