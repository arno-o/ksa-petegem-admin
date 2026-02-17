import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { UserAuth } from "~/context/AuthContext";

interface PageProps {
  children: React.ReactNode;
  permissionLvl?: number;
}

export default function PrivateRoute({ children, permissionLvl = 1 }: PageProps) {
  const { permission } = UserAuth();

  // Auth redirect is now handled server-side by the dashboard layout loader.
  // This component only checks permission levels.
  if (permission < permissionLvl) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Geen toegang</h1>
        <p className="text-sm text-muted-foreground">
          Je hebt onvoldoende rechten om deze pagina te openen.
        </p>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/profiel">Naar profiel</Link>
          </Button>
          <Button asChild>
            <Link to="/berichten">Terug naar dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}