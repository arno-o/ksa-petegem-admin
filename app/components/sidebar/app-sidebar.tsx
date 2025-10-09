import { NavUser } from "~/components/sidebar/nav-user"
import { Link, useLocation } from "react-router"
import React, { useEffect } from "react";

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

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "~/components/ui/collapsible";

import { cn } from "~/lib/utils";
import { UserAuth } from "~/context/AuthContext";
import { ModeToggle } from "~/components/sidebar/mode-toggle"
import { Newspaper, CalendarFold, User, IdCardLanyard, ChevronRight, Settings } from 'lucide-react';

// --- Type Definitions ---
interface NavItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items?: NavItem[];
  lvl?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  lvl?: number;
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
          lvl: 1
        },
        {
          title: "Activiteiten",
          url: "/activiteiten",
          icon: CalendarFold,
          lvl: 1
        },
        {
          title: "Instellingen",
          url: "/instellingen",
          icon: Settings,
          lvl: 1
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
              lvl: 2,
            },
            {
              title: "Inactieve leiding",
              url: "/leiding/inactief",
              lvl: 3
            }
          ],
          lvl: 2
        },
        {
          title: "Groepen",
          url: "/groepen",
          icon: IdCardLanyard,
          lvl: 2
        },
      ],
      lvl: 2,
    },
  ],
};

// --- AppSidebar Component ---
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { permission } = UserAuth();

  const isParentOrChildActive = (item: NavItem): boolean => {
    if (item.url) {
      return location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);
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
          <SidebarGroup key={group.title} hidden={group.lvl ? group.lvl > permission : false}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const itemIsActive = isParentOrChildActive(item);
                  if (item.items) {
                    return (
                      <Collapsible defaultOpen className="group/collapsible" key={item.title} disabled={item.lvl ? item.lvl > permission : false}>
                        <SidebarMenuItem key={item.title} hidden={item.lvl ? item.lvl > permission : false}>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              {item.icon && <item.icon className={cn(`text-sidebar-primray-foreground`)} />}
                              {item.title}
                              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((item) => (
                                <SidebarMenuSubItem key={item.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={
                                      !!(item.url && (location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url))))
                                    }
                                  >
                                    <Link to={item.url!} viewTransition>{item.title}</Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  } else {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild disabled={item.lvl ? item.lvl > permission : false} isActive={
                          !!(item.url && (location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url))))
                        }>
                          <Link to={item.url!} viewTransition className="flex items-center gap-2">
                            {item.icon && <item.icon />}
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