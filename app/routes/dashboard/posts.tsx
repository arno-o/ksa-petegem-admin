import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router"; // Use react-router-dom for v7 if not already

import type { Post } from "~/types";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea"; // Keep Textarea for description
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader, // Add DialogHeader
  DialogTitle,  // Add DialogTitle
  DialogDescription, // Add DialogDescription
  DialogFooter, // Add DialogFooter
  DialogClose // Add DialogClose for cancel button
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns"; // For date formatting
import { nl } from "date-fns/locale"; // For Dutch locale if needed

import { createPost, fetchPosts } from "~/utils/data"; // Assuming fetchUsers for later if needed
import { UserAuth } from "~/context/AuthContext";

import PageLayout from "../pageLayout";
import type { Route } from "./+types/posts"; // Adjust if your types are elsewhere
import PrivateRoute from "~/context/PrivateRoute";


export function meta({ }: Route.MetaArgs) {
  return [{ title: "KSA Admin - Berichten" }];
}

const stripHtmlAndTruncate = (html: string, maxLength: number = 150) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = doc.body.textContent || "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export default function Posts() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", cover_img: "" });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const { session } = UserAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const loadPosts = async () => {
      setLoadingPosts(true);
      try {
        const data = await fetchPosts();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      console.error("Title cannot be empty.");
      return;
    }
    try {
      const postData = {
        ...form,
        description: form.description || "",
        published: false,
        user_id: session?.user.id,
      };

      const newPostResponse = await createPost(postData);
      const newPost = newPostResponse[0];

      const enrichedNewPost: Post = {
        ...newPost,
        author_first_name: session?.user?.user_metadata?.first_name || null,
        author_last_name: session?.user?.user_metadata?.last_name || null,
      };

      setForm({ title: "", description: "", cover_img: "" });
      setOpen(false);

      setPosts((prevPosts) => [enrichedNewPost, ...prevPosts]);
      navigate(`/berichten/${newPost.id}`, { viewTransition: true });
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  return (
    <PrivateRoute>
      <PageLayout>
        <header className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold tracking-tight">Berichten</h3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" />Nieuw bericht</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nieuw bericht aanmaken</DialogTitle>
                <DialogDescription>
                  Vul de details in om een nieuw bericht te starten.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title" className="text-right">
                    Titel
                  </Label>
                  <Input
                    id="title"
                    placeholder="Titel van het bericht"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description" className="text-right">
                    Beschrijving
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Korte samenvatting (optioneel)"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Annuleer
                  </Button>
                </DialogClose>
                <Button type="submit" onClick={handleCreate}>Post beginnen</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        {loadingPosts ? (
            <div className="text-center py-10">Laden van berichten...</div>
        ) : (
            posts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    Er zijn nog geen berichten aangemaakt. Klik op "Nieuw bericht" om te beginnen.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => {

                        return (
                            <Link to={`/berichten/edit/${post.id}`} key={post.id} className="block group">
                                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-200 ease-in-out">
                                    {post.cover_img ? (
                                    <div className="w-full h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                                        <img src={post.cover_img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out" />
                                    </div>
                                    ) : (
                                    <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground text-sm border-b">
                                        Geen coverafbeelding
                                    </div>
                                    )}
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h4 className="text-xl font-bold mb-2 leading-tight group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mb-3 flex-grow line-clamp-3">
                                            {stripHtmlAndTruncate(post.description, 120)}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                                            <Badge variant={post.published ? "default" : "secondary"} className="py-1 px-3 text-xs font-semibold rounded-full">
                                                {post.published ? "Gepubliceerd" : "Concept"}
                                            </Badge>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>
                                                    {post.published && post.published_at
                                                        ? `Pub.: ${format(new Date(post.published_at), 'dd MMM yyyy', { locale: nl })}` // Added yyyy
                                                        : `Aang.: ${format(new Date(post.created_at), 'dd MMM yyyy', { locale: nl })}` // Added yyyy
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )
        )}
      </PageLayout>
    </PrivateRoute>
  );
}