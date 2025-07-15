import type { Route } from "./+types/register";
import { RegisterForm } from "~/components/allround/register-form";


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Register" },
  ];
}

export default function Register() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}