import PageLayout from "../pageLayout"
import type { Route } from "./+types/news";
import { UserAuth } from "~/context/AuthContext"


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Berichten" },
  ];
}

export default function News() {
  const { session } = UserAuth();

  return(
    <PageLayout>
      Berichten pagina
      <p className="pt-4">Welkom {session?.user?.email}</p>
    </PageLayout>
  );
}
