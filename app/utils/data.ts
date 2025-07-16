import type { Post } from "~/types";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const fetchInactiveLeiding = async () => {
  const { data, error } = await supabase.from("leiding").select("*").eq("actief", false);
  if (error) throw error;
  return data;
};

export const fetchLeidingById = async (id: string | number) => {
  const { data, error } = await supabase.from("leiding").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export const fetchActiveLeiding = async () => {
  const { data, error } = await supabase.from("leiding").select("*").eq("actief", true);
  if (error) throw error;
  return data;
}

export const updateLeiding = async (id: string | number, updates: Partial<any>) => {
  const { error } = await supabase.from("leiding").update(updates).eq("id", id);
  if (error) throw error;
};

export const disableLeiding = async (id: number) => {
  const { error } = await supabase.from("leiding").update({ actief: false }).eq("id", id);
  if (error) throw error;
};

export const restoreLeiding = async (id: number) => {
  const { error } = await supabase.from("leiding").update({ actief: true }).eq("id", id);
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
      actief: true, // New leiding are active by default
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

export const fetchActiveGroups = async () => {
  const { data, error } = await supabase.from("groepen").select("*").eq("active", true).order('id', { ascending: true });
  if (error) throw error;
  return data;
};

export const fetchAllGroups = async () => {
  const { data, error } = await supabase.from("groepen").select("*").order('id', { ascending: true });
  if (error) throw error;
  return data;
};

export const updateGroup = async (id: string | number, updates: Partial<any>) => {
  const { error } = await supabase.from("groepen").update(updates).eq("id", id);
  if (error) throw error;
};

export const fetchEvents = async () => {
  const { data, error } = await supabase.from("events").select("*");
  if (error) throw error;
  return data;
}

export const updateEvent = async (id: string | number, updates: Partial<any>) => {
  const { error } = await supabase.from("events").update(updates).eq("id", id);
  if (error) throw error;
}

export const deleteEvent = async (id: string | number) => {
  const { error } = await supabase.from("events").delete().eq("id", Number(id));
  if (error) throw error;
};

export const createEvent = async (newEvent: {
  title: string;
  description: string;
  location: string;
  target_groups: number[]; // json field
}) => {
  const { data, error } = await supabase
    .from("events")
    .insert([newEvent])
    .select()
    .single();

  if (error) {
    console.error("Error creating event:", error);
    throw error;
  }

  return data;
};

export const fetchGroupsByEventID = async (eventId: number): Promise<any> => {
  // Step 1: Get the target_groups array from the event
  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("target_groups")
    .eq("id", eventId)
    .single();

  if (eventError) {
    console.error("Error fetching event:", eventError);
    throw eventError;
  }

  const groupIds: number[] = eventData?.target_groups || [];

  if (groupIds.length === 0) return [];

  // Step 2: Fetch the corresponding groepen
  const { data: groepen, error: groepenError } = await supabase
    .from("groepen")
    .select("*")
    .in("id", groupIds);

  if (groepenError) {
    console.error("Error fetching groepen:", groepenError);
    throw groepenError;
  }

  return groepen;
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

export const uploadPostCover = async (file: File, postId: string): Promise<string> => {
  const filePath = `${postId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from("post-covers").upload(filePath, file, {
    upsert: true,
  });

  if (error) throw new Error("Upload mislukt: " + error.message);

  const { data: urlData } = supabase.storage
    .from("post-covers")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

export const deleteFromBucket = async (bucket: string, publicUrl: string) => {
  try {
    // Extract only the path after the bucket name
    const match = publicUrl.match(new RegExp(`${bucket}/(.+)$`));
    const filePath = match?.[1];

    if (!filePath) {
      throw new Error("Kon pad van afbeelding niet bepalen.");
    }

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.warn("Fout bij verwijderen van afbeelding:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("deleteFromBucket error:", err);
    throw err;
  }
};