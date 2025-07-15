import { NavUser } from "~/components/nav-user"
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
  SidebarRail,
} from "~/components/ui/sidebar"

import { ModeToggle } from "~/components/mode-toggle"
import { Newspaper, CalendarFold, User, Puzzle, ChevronRight } from 'lucide-react';
import { cn } from "~/lib/utils";

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
          icon: Puzzle,
        },
      ],
    },
  ],
};

// --- AppSidebar Component ---
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const [openNestedGroups, setOpenNestedGroups] = useState<Record<string, boolean>>({});

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
    setOpenNestedGroups(initialOpenState);
  }, [location.pathname]);

  const handleToggleNestedGroup = (title: string) => {
    setOpenNestedGroups(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

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
                  const isNestedGroupOpen = openNestedGroups[item.title] || false;

                  if (item.items) {
                    return (
                      <div key={item.title}>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => handleToggleNestedGroup(item.title)}
                                isActive={itemIsActive}
                                className={cn(
                                    "flex items-center justify-between", // Ensure flexbox layout for content and chevron
                                    itemIsActive ? "bg-accent text-accent-foreground" : "text-sidebar-foreground", // Example active state background
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    {item.icon && <item.icon className={cn(itemIsActive ? `text-sidebar-foreground/100` : `text-sidebar-foreground/70`, `stroke-[${itemIsActive ? '2.5' : '2'}]`, `h-4 w-4`)} />}
                                    {item.title}
                                </span>
                                <ChevronRight className={cn(
                                    "h-4 w-4 shrink-0 transition-transform duration-200",
                                    isNestedGroupOpen ? "rotate-90" : "rotate-0"
                                )} />
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {isNestedGroupOpen && (
                            <SidebarMenu className="pl-6 mt-1"> {/* Increased indentation to pl-6 (24px) for clearer nesting */}
                                {item.items.map((subItem) => {
                                    const subItemIsActive = isParentOrChildActive(subItem);
                                    return (
                                        <SidebarMenuItem key={subItem.title}>
                                            <SidebarMenuButton asChild isActive={subItemIsActive} className="text-sm">
                                                <Link to={subItem.url!} viewTransition className="flex items-center gap-2">
                                                    <span>
                                                        {subItem.title}
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        )}
                      </div>
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