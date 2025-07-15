import { IconDotsVertical, IconLogout } from "@tabler/icons-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "~/components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "~/components/ui/sidebar"

import { useNavigate } from "react-router"
import { UserAuth } from "~/context/AuthContext"

export function NavUser() {
    const { isMobile } = useSidebar()

    const { session, signOut } = UserAuth();

    let navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate("/")
        } catch (err) {
            console.error(err);
        }
    }

    const firstName = session?.user?.user_metadata?.first_name;
    const firstLetterOfName = firstName ? firstName.charAt(0).toUpperCase() : '';

    const avatarAPI = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${firstName}?scale=50`;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={avatarAPI} />
                                <AvatarFallback className="rounded-lg">{firstLetterOfName}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{session?.user?.user_metadata?.first_name}</span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {session?.user?.email}
                                </span>
                            </div>
                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={avatarAPI} />
                                    <AvatarFallback className="rounded-lg">{firstLetterOfName}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{session?.user?.user_metadata?.first_name}</span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {session?.user?.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <IconLogout />
                            Afmelden
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
