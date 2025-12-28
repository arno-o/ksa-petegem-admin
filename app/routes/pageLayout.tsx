import { UserAuth } from "~/context/AuthContext"
import { Separator } from "~/components/ui/separator"
import { AppSidebar } from "~/components/sidebar/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { Spinner } from "~/components/ui/spinner"

import { Outlet, useNavigation } from "react-router"
import PrivateRoute from "~/context/PrivateRoute"

interface PageProps {
  children: React.ReactNode;
  permission?: number;
}

export default function Page({ children, permission = 1 }: PageProps) {
  const navigation = useNavigation();

  const { session } = UserAuth();
  const firstName = session?.user?.user_metadata?.first_name;

  return (
    <PrivateRoute permissionLvl={permission}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <span className="pr-2">Hallo {firstName} 👋</span>
            {navigation.state === "loading" ? (
              <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                Laden…
              </span>
            ) : null}
          </header>

          <div className={`p-4 ${navigation.state === "loading" ? "opacity-50 transition-opacity" : ""}`}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PrivateRoute>
  )
}