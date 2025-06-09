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

export const fetchLeidingById = async (id: number) => {
  const { data, error } = await supabase.from("leiding").select("*").eq("id", id);
  if (error) throw error;
  return data;
}

export const updateLeiding = async (id: number, updates: Partial<any>) => {
  const { error } = await supabase.from("leiding").update(updates).eq("id", id);
  if (error) throw error;
};

export const deleteLeiding = async (id: number) => {
  const { error } = await supabase.from("leiding").delete().eq("id", id);
  if (error) throw error;
}

export const createPost = async (post: {
  title: string;
  description: string;
  user_id: string;
  published: boolean;
}) => {
  const { data, error } = await supabase.from("posts").insert([{
    ...post,
    created_at: new Date().toISOString(),
  }]);

  if (error) throw error;
  return data;
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
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", Number(id)) // ✅ ensure numeric match
    .select(); // 👈 for debugging

  console.log("🔁 Supabase update result:", data, error);
  if (error) throw error;
  return data;
};