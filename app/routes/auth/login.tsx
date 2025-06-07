import type { Route } from "../+types/login";


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Login" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Login() {
  return;
}
