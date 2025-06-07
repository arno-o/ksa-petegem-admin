import type { Route } from "./+types/posts";


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Petegem - Admin" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Posts() {
  return;
}
