import type { Route } from "../+types/home";


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Home" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return;
}
