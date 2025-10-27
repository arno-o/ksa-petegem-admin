"use client"

import FullScreenLoader from "~/components/allround/full-screen-loader";
import { UserAuth } from "~/context/AuthContext";
import { fetchProfiles } from "~/utils/data";
import PageLayout from "../pageLayout";
import type { Profile } from "~/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Mail, Shield, User, Calendar } from "lucide-react";

export async function clientLoader() {
  const profiles = await fetchProfiles();
  return { profiles };
}

export function HydrateFallback() {
    return (
        <PageLayout>
            <FullScreenLoader />
        </PageLayout>
    );
}

const permissionLevels: Record<number, { title: string, variant: "default" | "secondary" | "destructive" | "outline", color: string }> = {
    0: { title: 'No Access', variant: 'outline', color: 'text-gray-500' },
    1: { title: 'Social Media Team', variant: 'secondary', color: 'text-blue-600' }, 
    2: { title: 'Webmaster', variant: 'default', color: 'text-purple-600' },
    3: { title: 'Admin', variant: 'destructive', color: 'text-red-600' },
}

export default function ProfilePage({ loaderData }: { loaderData: { profiles: Profile[] } }) {
    const { session, permission } = UserAuth();
    const uid = session?.user?.id;
    const email = session?.user?.email;

    const { profiles } = loaderData;
    const user = profiles.find(profile => profile.id === uid);

    const permissionInfo = permissionLevels[permission] || permissionLevels[0];
    const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : 'U';
    const fullName = user ? `${user.first_name} ${user.last_name}` : 'Unknown User';

    // Format creation date if available
    const createdAt = session?.user?.created_at 
        ? new Date(session.user.created_at).toLocaleDateString('nl-BE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : null;

    return (
        <PageLayout>
            <div className="flex flex-col gap-4 max-w-3xl mx-auto p-4">
                {/* Header */}
                <div className="mb-1">
                    <h1 className="text-2xl font-medium tracking-tight">Profiel</h1>
                    <p className="text-sm text-muted-foreground">
                        Bekijk jouw account informatie.
                    </p>
                </div>

                {/* Main Profile Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user?.first_name}?scale=50`} />
                                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="">
                                <CardTitle className="text-xl truncate">{fullName}</CardTitle>
                                <CardDescription className="flex items-center gap-1.5 mt-1 text-xs truncate">
                                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                    {email}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Account Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Account Details</CardTitle>
                        <CardDescription className="text-xs">
                            Jouw account informatie en toegangsniveau
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-0">
                            {/* User ID */}
                            <div className="flex items-center justify-between py-2.5">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium">User ID</span>
                                </div>
                                <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    {uid?.slice(0, 8)}...
                                </code>
                            </div>
                            
                            <Separator />

                            {/* Email */}
                            <div className="flex items-center justify-between py-2.5">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium">Email Address</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{email}</span>
                            </div>

                            <Separator />

                            {/* Permission Level */}
                            <div className="flex items-center justify-between py-2.5">
                                <div className="flex items-center gap-2 text-sm">
                                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium">Rechten Level</span>
                                </div>
                                <span className={`text-xs font-medium ${permissionInfo.color}`}>
                                    {permissionInfo.title}
                                </span>
                            </div>

                            {createdAt && (
                                <>
                                    <Separator />
                                    {/* Account Created */}
                                    <div className="flex items-center justify-between py-2.5">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="font-medium">Account sinds</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{createdAt}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Jouw rechten</CardTitle>
                        <CardDescription className="text-xs">
                            Wat jij kan doen met jouw rechten niveau
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2.5">
                            {permission >= 1 && (
                                <div className="flex items-start gap-2.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">Social Media</p>
                                        <p className="text-xs text-muted-foreground">
                                            Maak, bewerk en beheer posts op de site.
                                        </p>
                                    </div>
                                </div>
                            )}
                            {permission >= 2 && (
                                <div className="flex items-start gap-2.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">Website Administration</p>
                                        <p className="text-xs text-muted-foreground">
                                            Beheer activiteiten, groepen en content.
                                        </p>
                                    </div>
                                </div>
                            )}
                            {permission >= 3 && (
                                <div className="flex items-start gap-2.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">Vol Administrative Access</p>
                                        <p className="text-xs text-muted-foreground">
                                            Volledige toegang tot iedereen en alles.
                                        </p>
                                    </div>
                                </div>
                            )}
                            {permission === 0 && (
                                <div className="flex items-start gap-2.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">Gelimiteerd toegang</p>
                                        <p className="text-xs text-muted-foreground">
                                            Je hebt geen grote rechten. Contacteer een websitebeheerder.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    )
}