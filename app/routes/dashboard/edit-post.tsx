import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { toast } from "sonner"
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";

import { fetchPostById, updatePost } from "~/utils/data";
import PageLayout from "../pageLayout";
import type { Route } from "./+types/edit-post";
import PrivateRoute from "~/context/PrivateRoute";

export async function loader({ params }: Route.LoaderArgs) {
    const post = await fetchPostById(params.postId);
    return { post };
};

export function meta({ }: Route.MetaArgs) {
    return [{ title: "KSA Admin - Bericht Bewerken" }];
}

export default function ({ loaderData, }: Route.ComponentProps) {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { post } = loaderData;

    const [form, setForm] = useState({
        title: post.title,
        description: post.description,
        cover_img: post.cover_img,
        published: post.published,
    });

    useEffect(() => {
        setForm({
            title: post.title,
            description: post.description,
            cover_img: post.cover_img,
            published: post.published,
        });
    }, [post]);

    const handleSave = async () => {
        try {
            await updatePost(postId!, form);
            toast.success("Post is bewerkt.")
            navigate("/berichten", { viewTransition: true });
        } catch (err) {
            toast.error("Er is iets foutgelopen.")

        }
    };

    return (
        <PrivateRoute>
            <PageLayout>
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">Bewerk Bericht</h2>

                    <Input
                        placeholder="Titel"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />

                    <Textarea
                        placeholder="Beschrijving"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />

                    <Input
                        placeholder="Cover image URL"
                        value={form.cover_img}
                        onChange={(e) => setForm({ ...form, cover_img: e.target.value })}
                    />

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="published"
                            checked={form.published}
                            onCheckedChange={(value) => setForm({ ...form, published: value })}
                        />
                        <Label htmlFor="published">Gepubliceerd</Label>
                    </div>

                    <Button onClick={handleSave}>Opslaan</Button>
                </div>
            </PageLayout>
        </PrivateRoute>
    );
}