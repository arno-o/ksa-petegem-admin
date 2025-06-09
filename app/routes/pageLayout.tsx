import { CalendarFold } from "lucide-react"
import { UserAuth } from "~/context/AuthContext"

import { AppSidebar } from "~/components/app-sidebar"
import { Separator } from "~/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"

const getFormattedDate = (): string => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" };
  const [weekday, day, month] = date.toLocaleDateString("nl-NL", options).split(" ");
  return `${weekday.charAt(0) + weekday.slice(1)}, ${day} ${month}`;
}

interface PageProps {
  children: React.ReactNode;
}

export default function Page({ children }: PageProps) {
  const { session } = UserAuth();
  const dateToday = getFormattedDate();
  const firstName = session?.user?.user_metadata?.first_name;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <span className="pr-2">Hallo {firstName} 👋</span>
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <span className="flex gap-2 items-center"><CalendarFold size={16} /> Vandaag is {dateToday}</span>
        </header>
        <div className="p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}