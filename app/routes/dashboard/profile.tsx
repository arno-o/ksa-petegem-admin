"use client"

import FullScreenLoader from "~/components/allround/full-screen-loader";
import { UserAuth } from "~/context/AuthContext";

import { fetchProfiles, fetchPermissionLevel } from "~/utils/data";

import PageLayout from "../pageLayout";
import type { Profile } from "~/types";
import type { Route } from "./+types/profile";

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

interface Permission {
    id: number,
    title: string,
}

export default function ProfilePage({ loaderData }: { loaderData: { profiles: Profile[] } }) {
    const { session, permission } = UserAuth();
    const uid = session?.user?.id;

    const { profiles } = loaderData;
    const user = profiles.find(profile => profile.id === uid);

    const permissionLevel: Permission[] = [
        { id: 1, title: 'Social media team' }, 
        { id: 2, title: 'Webmaster' },
        { id: 3, title: 'Admin' },
    ]

    return (
        <PageLayout>
            Permission level = {permission}
        </PageLayout>
    )
}