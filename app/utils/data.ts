import type { Post } from "~/types";
import { createClient } from "@supabase/supabase-js";

import { type Group } from "~/types";

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
  // 1) Fetch the current record to get foto_url
  const { data: leiding, error: fetchError } = await supabase
    .from("leiding")
    .select("id, foto_url")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // 2) Best-effort: delete the profile image if we have a URL
  if (leiding?.foto_url) {
    try {
      await deleteFromBucket("leiding-fotos", leiding.foto_url);
    } catch (e) {
      // Don't block the row deletion if storage delete fails
      console.warn("Kon profielfoto niet verwijderen, ga verder met verwijderen van record.", e);
    }
  }

  // 3) Delete the DB row
  const { error: deleteError } = await supabase.from("leiding").delete().eq("id", id);
  if (deleteError) throw deleteError;
};

export const createLeiding = async (newLeiding: {
  voornaam: string;
  familienaam: string;
  leidingsploeg: number;
  actief: boolean;
}) => {
  const { data, error } = await supabase
    .from("leiding")
    .insert([{
      ...newLeiding,
      actief: true,
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

export const fetchAllGroups = async (): Promise<Group[]> => {
  const { data, error } = await supabase
    .from("groepen")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const fetchGroupById = async (id: number | string): Promise<Group> => {
  const { data, error } = await supabase
    .from("groepen")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Group;
};

// LET OP: laat icon_url en brief_url ongemoeid
export const updateGroup = async (
  id: number | string,
 updates: Partial<Omit<Group, "id" | "icon_url" | "brief_url" | "color">>
): Promise<Group> => {
  const { data, error } = await supabase
    .from("groepen")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Group;
};

export const createGroup = async (
  input: Omit<Group, "id" | "icon_url" | "brief_url" | "color">
): Promise<Group> => {
  const { data, error } = await supabase
    .from("groepen")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Group;
};

export const deleteGroup = async (id: number | string) => {
  const { error } = await supabase.from("groepen").delete().eq("id", id);
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

const getStoragePathFromPublicUrl = (publicUrl: string, bucket: string): string | null => {
  try {
    // Works with regular public URLs like:
    // https://<project>.supabase.co/storage/v1/object/public/leiding-fotos/<path/to/file>
    const u = new URL(publicUrl);
    // Strip any query params and look for `/storage/v1/object/public/<bucket>/...`
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return u.pathname.slice(idx + marker.length); // "<path/to/file>"
  } catch {
    // Fallback for cases where it's not a valid URL (shouldn't happen, but just in case)
    const regex = new RegExp(`${bucket}/(.+)$`);
    const match = publicUrl.match(regex);
    return match?.[1] ?? null;
  }
};

export const deleteFromBucket = async (bucket: string, publicUrl: string) => {
  try {
    const filePath = getStoragePathFromPublicUrl(publicUrl, bucket);
    if (!filePath) {
      throw new Error("Kon het opslagpad niet afleiden uit de public URL.");
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

interface MassUpdateLeidingData {
  leidingIds: number[];
  updateData: {
    leidingsploeg?: number | null;
    actief?: boolean;
  };
}

export const massUpdateLeiding = async ({ leidingIds, updateData }: MassUpdateLeidingData) => {
  if (leidingIds.length === 0) {
    console.warn("No leiding IDs provided for mass update.");
    return;
  }
  const { error } = await supabase
    .from("leiding")
    .update(updateData)
    .in("id", leidingIds);

  if (error) {
    console.error("Error during mass update:", error);
    throw error;
  }
};

const LETTER_BUCKET = "pdf-files";
const LETTER_FOLDER = "groep-brieven";

export const getGroupLetterPath = (groupId: number | string) =>
  `${LETTER_FOLDER}/brief-groep-${groupId}.pdf`;

/** Uploads & overwrites the group's monthly PDF letter. Returns the public URL. */
export async function uploadGroupLetter(file: File, groupId: number | string): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Bestand moet een PDF zijn.");
  }

  const path = getGroupLetterPath(groupId);

  const { error: upErr } = await supabase.storage
    .from(LETTER_BUCKET)
    .upload(path, file, {
      upsert: true, // ← replace previous month
      contentType: "application/pdf",
      cacheControl: "0",
    });

  if (upErr) throw upErr;

  // Public URL (bucket is public per your screenshot)
  const { data } = supabase.storage.from(LETTER_BUCKET).getPublicUrl(path);
  // cache-bust in UI if you embed the link in <object>/<iframe>
  return `${data.publicUrl}?v=${Date.now()}`;
}

/** Removes the letter file for a group. */
export async function deleteGroupLetter(groupId: number | string) {
  const path = getGroupLetterPath(groupId);
  const { error } = await supabase.storage.from(LETTER_BUCKET).remove([path]);
  if (error) throw error;
}

/** Updates only the brief_url field for a group. */
export async function updateGroupLetterUrl(
  groupId: number | string,
  briefUrl: string | null
): Promise<Group> {
  const { data, error } = await supabase
    .from("groepen")
    .update({ brief_url: briefUrl })
    .eq("id", groupId)
    .select()
    .single();
  if (error) throw error;
  return data as Group;
}