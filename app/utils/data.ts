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