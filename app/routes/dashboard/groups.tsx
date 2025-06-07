import type { Route } from "./+types/groups";
import PageLayout from "../pageLayout";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Groepen" },
  ];
}

export default function Groups() {
  return(
    <PageLayout>
      Leeftijdsgroepen
    </PageLayout>
  );
}