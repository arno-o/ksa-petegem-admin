import { NavUser } from "~/components/nav-user"
import { Link, useLocation } from "react-router"

import KSALogo from "/assets/svg/KSALogo.svg";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar"

import { ModeToggle } from "~/components/mode-toggle"
import { Newspaper, CalendarFold, User, Puzzle } from 'lucide-react';

const data = {
  navMain: [
    {
      title: "Website Content",
      url: "#",
      items: [
        {
          title: "Berichten",
          url: "/berichten",
          icon: Newspaper,
        },
        {
          title: "Activiteiten",
          url: "/activiteiten",
          icon: CalendarFold,
        },
      ],
    },
    {
      title: "Achterliggende Info",
      url: "#",
      items: [
        {
          title: "Leiding",
          url: "/leiding",
          icon: User,
        },
        {
          title: "Groepen",
          url: "/groepen",
          icon: Puzzle,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex flex-row items-center justify-between gap-0.5 leading-none p-2">
          <div className="flex items-center gap-2">
            <img src={KSALogo} width={24} />
            <span className="font-medium">KSA Petegem</span>
          </div>
          <ModeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.url ||
                    location.pathname.startsWith(`${item.url}/`);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.url} viewTransition>
                          <item.icon className={isActive ? `text-sidebar-foreground/100` : `text-sidebar-foreground/70`} strokeWidth={isActive ? 2.5 : 2}/>
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
      <div className="p-2">
        <NavUser />
      </div>
    </Sidebar>
  )
}