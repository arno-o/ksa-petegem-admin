import * as React from "react"
import { Link, useLocation } from "react-router"
import { NavUser } from "~/components/nav-user"

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
import { Button } from "~/components/ui/button"

import { ModeToggle } from "~/components/mode-toggle"

const data = {
  navMain: [
    {
      title: "Website Content",
      url: "#",
      items: [
        {
          title: "Berichten",
          url: "/berichten",
        },
        {
          title: "Activiteiten",
          url: "/activiteiten",
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
        },
        {
          title: "Groepen",
          url: "/groepen",
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
          <span className="font-medium">KSA Petegem</span>
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
                  const isActive = location.pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.url} viewTransition>{item.title}</Link>
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