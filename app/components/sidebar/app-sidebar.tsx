import { NavUser } from "~/components/sidebar/nav-user"
import { Link, useLocation } from "react-router"
import React, { useState, useEffect } from "react";

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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "~/components/ui/sidebar"

import { cn } from "~/lib/utils";
import { ModeToggle } from "~/components/sidebar/mode-toggle"
import { Newspaper, CalendarFold, User, IdCardLanyard, ChevronRight, Settings } from 'lucide-react';

// --- Type Definitions ---
interface NavItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items?: NavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// --- Navigation Data ---
const data: { navMain: NavGroup[] } = {
  navMain: [
    {
      title: "Website Content",
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
        {
          title: "Instellingen",
          url: "/instellingen",
          icon: Settings,
        },
      ],
    },
    {
      title: "Achterliggende Info",
      items: [
        {
          title: "Leiding",
          icon: User,
          items: [
            {
              title: "Actieve leiding",
              url: "/leiding/actief",
            },
            {
              title: "Inactieve leiding",
              url: "/leiding/inactief",
            }
          ]
        },
        {
          title: "Groepen",
          url: "/groepen",
          icon: IdCardLanyard,
          
        },
      ],
    },
  ],
};

// --- AppSidebar Component ---
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  const isParentOrChildActive = (item: NavItem): boolean => {
    if (item.url) {
      return location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);
    }
    if (item.items) {
      return item.items.some(subItem =>
        location.pathname === subItem.url || location.pathname.startsWith(`${subItem.url}/`)
      );
    }
    return false;
  };

  useEffect(() => {
    const initialOpenState: Record<string, boolean> = {};
    data.navMain.forEach(group => {
      group.items.forEach(item => {
        if (item.items) {
          if (isParentOrChildActive(item)) {
            initialOpenState[item.title] = true;
          }
        }
      });
    });
  }, [location.pathname]);

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
                  const itemIsActive = isParentOrChildActive(item);
                  if (item.items) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton isActive={itemIsActive}>
                          {item.icon && <item.icon className={cn(itemIsActive ? `text-sidebar-foreground/100` : `text-sidebar-foreground/70`, `stroke-[${itemIsActive ? '2.5' : '2'}]`)} />}
                          {item.title}
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {item.items.map((item) => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={item.url}>{item.title}</a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </SidebarMenuItem>
                    );
                  } else {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={itemIsActive}>
                          <Link to={item.url!} viewTransition className="flex items-center gap-2">
                            {item.icon && <item.icon className={cn(itemIsActive ? `text-sidebar-foreground/100` : `text-sidebar-foreground/70`, `stroke-[${itemIsActive ? '2.5' : '2'}]`)} />}
                            {item.title}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
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
  );
}