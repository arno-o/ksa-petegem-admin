import PageLayout from "../pageLayout"
import type { Route } from "./+types/news"
import { useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
import { UserAuth } from "~/context/AuthContext"
import PrivateRoute from "~/context/PrivateRoute"


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "KSA Admin - Berichten" },
  ];
}

export default function News() {
  const { session, signOut } = UserAuth();

  let navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/")
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <PrivateRoute>
      <PageLayout>
        Berichten pagina
        <p className="pt-4">Welkom {session?.user?.email}</p>
        <Button onClick={handleSignOut}>Uitloggen</Button>
      </PageLayout>
    </PrivateRoute>
  );
}
