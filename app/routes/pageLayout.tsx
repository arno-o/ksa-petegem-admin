import { UserAuth } from "~/context/AuthContext"
import { Separator } from "~/components/ui/separator"
import { AppSidebar } from "~/components/sidebar/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import FullScreenLoader from "~/components/allround/full-screen-loader"

import { useNavigation } from "react-router"
import PrivateRoute from "~/context/PrivateRoute"

interface PageProps {
  children: React.ReactNode;
}

export default function Page({ children }: PageProps) {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  const { session } = UserAuth();
  const firstName = session?.user?.user_metadata?.first_name;

  return (
    <PrivateRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <span className="pr-2">Hallo {firstName} 👋</span>
          </header>

          <div className="p-4">
            {isNavigating ? <FullScreenLoader /> : children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PrivateRoute>
  )
}