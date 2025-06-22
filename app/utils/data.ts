import type { Post } from "~/types";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const fetchLeiding = async () => {
  const { data, error } = await supabase.from("leiding").select("*");
  if (error) throw error;
  return data;
};

export const fetchLeidingById = async (id: string | number) => {
  const { data, error } = await supabase.from("leiding").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export const updateLeiding = async (id: string | number, updates: Partial<any>) => {
  const { error } = await supabase.from("leiding").update(updates).eq("id", id);
  if (error) throw error;
};

export const deleteLeiding = async (id: number) => {
  const { error } = await supabase.from("leiding").delete().eq("id", id);
  if (error) throw error;
}

export const createLeiding = async (newLeiding: {
  voornaam: string;
  familienaam: string;
  leidingsploeg: number;
}) => {
  const { data, error } = await supabase
    .from("leiding")
    .insert([{
      ...newLeiding,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating leiding:", error);
    throw error;
  }

  return data;
};

export const createPost = async (post: {
  title: string;
  description: string;
  user_id: string;
  published: boolean;
  cover_img: string;
}): Promise<Post[]> => { // Make return type explicitly allow null
  const { data, error } = await supabase.from("posts").insert([{
    ...post,
    created_at: new Date().toISOString(),
  }]).select(); // Make sure .select() is there to return the data

  if (error) {
    console.error("Supabase createPost error:", error);
    throw error; // Still throw on error, but 'data' could be null before this if no rows affected
  }
  return data as Post[]; // Explicitly cast and allow null
};

export const fetchPosts = async () => {
  const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const fetchPostById = async (id: string) => {
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

export const updatePost = async (id: string | number, updates: Partial<any>) => {
  if (updates.published === true) {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", Number(id))
    .select();

  console.log("🔁 Supabase update result:", data, error);
  if (error) throw error;
  return data;
};

export const deletePost = async (id: string | number) => {
  const { error } = await supabase.from("posts").delete().eq("id", Number(id));
  if (error) throw error;
};

export const fetchGroups = async () => {
  const { data, error } = await supabase.from("groepen").select("*");
  if (error) throw error;
  return data;
};

export const uploadLeidingPhoto = async (file: File, userId: string): Promise<string> => {
  const uniqueName = `${Date.now()}-${file.name}`;
  const filePath = `${userId}/${uniqueName}`;

  const { data, error } = await supabase.storage
    .from("leiding-fotos")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase
    .storage
    .from("leiding-fotos")
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Could not retrieve public URL after upload.");
  }

  return publicUrlData.publicUrl;
};