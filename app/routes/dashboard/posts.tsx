import { Plus } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";

import { createPost, fetchPosts } from "~/utils/data";
import { UserAuth } from "~/context/AuthContext";

import PageLayout from "../pageLayout";
import type { Route } from "./+types/posts";
import PrivateRoute from "~/context/PrivateRoute";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "KSA Admin - Berichten" }];
}

export default function Posts() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", cover_img: "" });
  const [posts, setPosts] = useState<any[]>([]);
  const { session } = UserAuth();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    loadPosts();
  }, []);

  const handleCreate = async () => {
    try {
      await createPost({
        ...form,
        published: false,
        user_id: session?.user.id,
      });
      setForm({ title: "", description: "", cover_img: "" });
      setOpen(false);

      // Re-fetch posts
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  return (
    <PrivateRoute>
      <PageLayout>
        <header className="flex justify-between items-center mb-6">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Berichten</h3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2" />Nieuw bericht</Button>
            </DialogTrigger>
            <DialogContent className="space-y-4">
              <h4 className="text-lg font-medium">Nieuw bericht</h4>
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
              <Button onClick={handleCreate}>Opslaan</Button>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Link to={`/berichten/${post.id}`} key={post.id} viewTransition>
              <div className="rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition">
                {post.cover_img && (
                  <img src={post.cover_img} alt={post.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4 space-y-2">
                  <h4 className="text-lg font-semibold">{post.title}</h4>
                  <p className="text-sm text-muted-foreground">{post.description}</p>
                  <Badge variant={post.published ? "default" : "secondary"}>
                    {post.published ? "Gepubliceerd" : "Concept"}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </PageLayout>
    </PrivateRoute>
  );
}