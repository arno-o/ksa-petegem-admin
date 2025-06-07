import * as React from "react"

import { Link } from "react-router"

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

// This is sample data.
const data = {
  navMain: [
    {
      title: "Website Content",
      url: "#",
      items: [
        {
          title: "Berichten",
          url: "/",
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
          isActive: true,
        }
      ],
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex flex-row items-center justify-between gap-0.5 leading-none p-2">
          <span className="font-medium">KSA Petegem</span>
          <ModeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link to={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
