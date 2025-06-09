import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/login";
import { UserAuth } from "~/context/AuthContext";
import { LoginForm } from "~/components/login-form";
import FullScreenLoader from "~/components/full-screen-loader";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Login" },
  ];
}

export default function Login() {
  const { session, loading } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate("/berichten", { viewTransition: true });
    }
  }, [loading, session, navigate]);

  if (loading || session) {
    return <FullScreenLoader />;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}