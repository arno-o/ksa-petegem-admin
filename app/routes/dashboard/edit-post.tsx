// edit-post.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { ChevronLeft, Pencil, Trash, Save } from "lucide-react";

import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import FullScreenLoader from "~/components/full-screen-loader";

import FileUpload from "~/components/FileUpload"
import { SimpleEditor } from "~/components/editor"

import {
    Dialog,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "~/components/ui/dialog";

import { fetchPostById, updatePost, deletePost } from "~/utils/data";
import PageLayout from "../pageLayout";
import PrivateRoute from "~/context/PrivateRoute";

interface Post {
    id: string;
    title: string;
    description: string;
    cover_img: string;
    published: boolean;
    created_at: Date;
    published_at: Date | null;
}

export default function EditPostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        cover_img: "",
        published: false,
    });

    useEffect(() => {
        const getPost = async () => {
            if (!postId) {
                setError("Post ID is missing.");
                setLoading(false);
                return;
            }
            try {
                const fetchedPost = await fetchPostById(postId);
                setPost(fetchedPost);
                setForm({
                    title: fetchedPost.title,
                    description: fetchedPost.description ?? "",
                    cover_img: fetchedPost.cover_img,
                    published: fetchedPost.published,
                });
            } catch (err) {
                console.error("Failed to fetch post:", err);
                setError("Failed to load post data.");
                toast.error("Fout bij het laden van het bericht.");
            } finally {
                setLoading(false);
            }
        };
        getPost();
    }, [postId]);

    const handleSave = async () => {
        if (!postId) {
            toast.error("Geen Post ID gevonden om op te slaan.");
            return;
        }
        try {
            await updatePost(postId, form);
            toast.success("Bericht succesvol bewerkt.");
            navigate("/berichten", { viewTransition: true });
        } catch (err) {
            toast.error("Er is iets foutgelopen bij het opslaan.");
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!postId) {
            toast.error("Geen Post ID gevonden om te verwijderen.");
            return;
        }
        try {
            await deletePost(postId);
            toast.success("Bericht succesvol verwijderd.");
            navigate("/berichten", { viewTransition: true });
        } catch (err) {
            toast.error("Er is iets foutgelopen bij het verwijderen.");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <PageLayout>
                <FullScreenLoader />
            </PageLayout>
        );
    }

    if (error || !post) {
        return (
            <PageLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <p className="text-destructive">{error || "Bericht niet gevonden."}</p>
                </div>
            </PageLayout>
        );
    }

    return (
        <PrivateRoute>
            <PageLayout>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-2">
                        <Link to="/berichten" viewTransition>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronLeft className="h-5 w-5" />
                                <span className="sr-only">Terug naar berichten pagina</span>
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">Bewerk bericht</h1>
                    </div>
                    <div className="flex gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Trash />
                                    Verwijder
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Bericht verwijderen?</DialogTitle>
                                    <DialogDescription>
                                        Deze actie kan niet worden teruggedraaid. Dit bericht wordt permanent verwijderd.
                                    </DialogDescription>
                                </DialogHeader>
                                <p className="text-sm text-muted-foreground mt-4">
                                    Echt nooit nooit meer! Zelfs niet een beetje...
                                </p>
                                <DialogFooter className="pt-4">
                                    <DialogClose asChild>
                                        <Button variant="outline">Annuleer</Button>
                                    </DialogClose>
                                    <Button variant="destructive" onClick={handleDelete}>
                                        Verwijder
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button onClick={handleSave}>
                            <Save />
                            Opslaan
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Column (Editor & Title) */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Title Input */}
                        <div className="relative">
                            <Label htmlFor="title" className="sr-only">Titel</Label>
                            <Input
                                id="title"
                                placeholder="Titel van het bericht"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                            <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* SimpleEditor component */}
                        <SimpleEditor
                            content={form.description}
                            onChange={(html) => setForm({ ...form, description: html })}
                        />
                    </div>

                    {/* Sidebar Metadata Column */}
                    <div className="space-y-4">
                        {/* Berichtdetails section */}
                        <div className="bg-background p-4 rounded-md border border-input shadow-sm space-y-8">
                            <div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cover_image_url" className="text-sm font-medium">Cover afbeelding URL</Label>
                                        <FileUpload />
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="published" className="text-sm font-medium cursor-pointer">Gepubliceerd</Label>
                                    <Switch
                                        id="published"
                                        checked={form.published}
                                        onCheckedChange={(value) => setForm({ ...form, published: value })}
                                    />
                                </div>
                                {post?.published && post.published_at && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Gepubliceerd op: {new Date(post.published_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        </PrivateRoute>
    );
}