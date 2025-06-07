import type { Route } from "../+types/news";


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Berichten" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function News() {
  return;
}
