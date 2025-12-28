import { useIsMobile } from "~/hooks/use-mobile";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, Link, useRouteError, isRouteErrorResponse } from "react-router";
import { ChevronLeft, Pencil, Trash, Save, Eye, Badge, BadgeCheck, LinkIcon } from "lucide-react";

import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import FullScreenLoader from "~/components/allround/full-screen-loader";

import FileUpload from "~/components/images/file-upload"
import { SimpleEditor } from "~/components/allround/editor"

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

import type { Post } from "~/types";
import PageLayout from "../../pageLayout";
import type { Route } from "../posts/+types/edit";
import { fetchPostById, updatePost, deletePost, deleteFromBucket } from "~/utils/data";


export function meta({ }: Route.MetaArgs) {
    return [{ title: "Post Bewerken" }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const id = params.postId;
  if (!id) throw new Response("Geen postID opgegeven", { status: 400 });

  try {
    const post = await fetchPostById(id);
    if (!post) throw new Response("Post niet gevonden", { status: 404 });
    return post;
  } catch (err) {
    throw new Response("Kon de data niet vinden", { status: 500 });
  }
}

export function HydrateFallback() {
  return (
    <PageLayout>
      <FullScreenLoader />
    </PageLayout>
  );
}

const EditPostPage = ({ loaderData, }: Route.ComponentProps) => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const fetchedPost = loaderData;

    const [post, setPost] = useState<Post | null>(fetchedPost); // Post state directly holds published status
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: fetchedPost.title,
        slug: fetchedPost.slug,
        description: fetchedPost.description ?? "",
        cover_img: fetchedPost.cover_img,
    });

    useEffect(() => {
        setPost(fetchedPost);
        setForm({
            title: fetchedPost.title,
            slug: fetchedPost.slug,
            description: fetchedPost.description ?? "",
            cover_img: fetchedPost.cover_img,
        });
    }, [fetchedPost]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                navigate("/berichten", { viewTransition: true });
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => { // Cleanup event listener
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate]);

    const slugify = (input: string) =>
        input
            .normalize("NFKD")               // split accents
            .replace(/[\u0300-\u036f]/g, "") // remove accents
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

    const computedSlug = useMemo(() => slugify(form.title || ""), [form.title]);

    const handleSave = async () => {
        setLoading(true);

        if (!postId) {
            toast.error("Geen Post ID gevonden om op te slaan.");
            return;
        }

        try {
            await updatePost(postId, {
                title: form.title,
                slug: computedSlug,
                description: form.description,
                cover_img: form.cover_img,
            });
            toast.success("Bericht succesvol bewerkt.");
            setLoading(false);
            navigate("/berichten", { viewTransition: true });
        } catch (err) {
            toast.error("Er is iets foutgelopen bij het opslaan.");
            console.error(err);
        }
    };

    const handleQuietSave = async () => {
        if (!postId) { return; }

        try {
            await updatePost(postId, {
                title: form.title,
                cover_img: form.cover_img,
                description: form.description,
            });
        } catch (err) {
            toast.error("Er is iets foutgelopen bij het opslaan.");
            console.error(err);
        }
    }

    const handlePublishToggle = async () => {
        if (!postId || !post) {
            toast.error("Geen Post ID of berichtgegevens gevonden.");
            return;
        }

        const newPublishedStatus = !post.published;
        const publishDate = newPublishedStatus ? new Date().toISOString() : null;

        try {
            // First, update the post in the database
            await updatePost(postId, {
                published: newPublishedStatus,
                published_at: publishDate,
            });

            // If the database update is successful, then update the local state
            setPost(prevPost => ({
                ...(prevPost as Post),
                published: newPublishedStatus,
                published_at: publishDate,
            }));

            // Then, show the user a success message
            if (newPublishedStatus) {
                toast.success("Gelukt!", {
                    description: "De post is gepubliceerd en is nu beschikbaar voor iedereen."
                });
            } else {
                toast.info("Publicatie ongedaan gemaakt", {
                    description: "De post is niet langer publiekelijk zichtbaar."
                });
            }
        } catch (err: any) {
            // If the database update fails, show an error and don't update local state
            toast.error("Error", {
                description: `Fout bij publiceren/depubliceren: ${err.message || err}`
            });
            console.error("Publish toggle failed:", err);
        }
    }

    const handleDelete = async () => {
        if (!postId) {
            toast.error("Geen Post ID gevonden om te verwijderen.", {
                richColors: true
            });
            return;
        }
        try {
            if (post?.cover_img) {
                try {
                    const deleteURL = post?.cover_img;
                    await deleteFromBucket("post-covers", deleteURL);
                } catch (bucketErr) {
                    console.error("Failed to delete image from bucket:", bucketErr);
                    toast.error(String(bucketErr));
                    return;
                }
            }
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
        <PageLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <Link to="/berichten" viewTransition>
                        <Button variant="outline" size="icon" className="">
                            <ChevronLeft className="h-5 w-5" />
                            <span className="sr-only">Terug naar berichten pagina</span>
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Bewerk bericht</h1>
                </div>
                <div className="flex flex-wrap flex-row w-full md:w-fit gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive" size={isMobile ? "lg" : "icon"}>
                                <Trash />
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

                    <Button variant="outline" size={isMobile ? "lg" : "default"} onClick={() => { handleQuietSave(); navigate(`/berichten/preview/${post.id}`); }}>
                        <Eye />
                        {isMobile ? "Preview" : "Preview"}
                    </Button>

                    <Button variant="outline" onClick={handleSave} disabled={loading} className="grow md:w-fit">
                        <Save />
                        {loading ? "Opslaan..." : "Opslaan"}
                    </Button>

                    <Button variant={post.published ? "default" : "outline"} onClick={handlePublishToggle} className="grow md:w-fit">
                        {!post.published ? <Badge /> : <BadgeCheck />}
                        {!post.published ? 'Publiceer' : 'Gepubliceerd'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex gap-3">
                        <div className="relative w-full">
                            <Pencil className="absolute left-0 top-0 m-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="title"
                                placeholder="Titel van het bericht"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="pl-9"
                            />
                        </div>

                        <div className="relative w-full">
                            <LinkIcon className="absolute left-0 top-0 m-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="slug"
                                placeholder="Link naar het bericht"
                                value={computedSlug}
                                className="pl-9"
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <SimpleEditor
                        content={form.description}
                        onChange={(html) => setForm({ ...form, description: html })}
                    />
                </div>

                <div className="space-y-4">
                    <div className="bg-background p-4 rounded-md border border-input space-y-8">
                        <div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cover_image_url" className="text-sm font-medium">Cover afbeelding</Label>
                                    <FileUpload
                                        bucket="post-covers"
                                        path={`post-${postId}`}
                                        initialUrl={form.cover_img ?? undefined}
                                        onChange={(url) => setForm({ ...form, cover_img: url ?? "" })}
                                    />
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <div className="flex items-center justify-between space-x-2">
                                <p className="text-sm font-medium">Status</p>
                                <p className={`text-sm font-semibold ${post.published ? 'text-green-600' : 'text-orange-500'}`}>
                                    {post.published ? 'Gepubliceerd' : 'Concept'}
                                </p>
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
    );
}

export default EditPostPage;

export function ErrorBoundary() {
  const error = useRouteError();

  let message = "Er is iets misgelopen.";
  let status: number | undefined = undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message =
      (typeof error.data === "string" && error.data) ||
      error.statusText ||
      message;
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  return (
    <PageLayout>
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-destructive">
          {status ? `Error ${status} – ${message}` : message}
        </p>
      </div>
    </PageLayout>
  );
}