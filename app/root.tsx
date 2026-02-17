import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "./app.css";
import type { Route } from "./+types/root";

import { Toaster } from "~/components/ui/sonner"
import { ThemeProvider } from "./components/sidebar/theme-provider"
import { AuthContextProvider } from "~/context/AuthContext"
import { TooltipProvider } from "~/components/ui/tooltip"
import { createSupabaseServerClient } from "~/utils/supabase.server"

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  let permission = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("permission")
      .eq("id", user.id)
      .single();
    permission = profile?.permission ?? 0;
  }

  return data({ user, permission }, { headers });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="apple-icon-180.png" />
        <link rel="shortcut icon" href="favicon.svg" type="image/x-icon" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            {children}
            <ScrollRestoration />
            <Scripts />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { user, permission } = loaderData ?? {};
  return (
    <AuthContextProvider initialUser={user ?? null} initialPermission={permission ?? 0}>
      <Outlet />
    </AuthContextProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
