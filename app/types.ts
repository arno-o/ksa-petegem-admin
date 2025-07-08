export type Leiding = {
  id: number;
  voornaam: string;
  familienaam: string;
  werk: string | null;
  studies: string | null;
  ksa_betekenis: string | null;
  ksa_ervaring: string | null;
  leiding_sinds: Date | null;
  geboortedatum: Date | null;
  hoofdleiding: boolean;
  werkgroepen: string | null;
  foto_url: string | null;
  leidingsploeg: number;
  trekker: boolean;
};

export interface Post {
    id: string; // Assuming Supabase generates UUIDs, or adjust if it's number
    title: string;
    description: string;
    cover_img: string | null;
    published: boolean;
    created_at: string; // Supabase returns ISO string
    published_at: string | null; // Supabase returns ISO string or null
    user_id: string;
    // These will be populated from the `auth_users` join in fetchPosts
    author_first_name?: string | null;
    author_last_name?: string | null;
    // Supabase join structure for user_metadata (optional, but good for context)
    auth_users?: {
        user_metadata: {
            first_name: string | null;
            last_name: string | null;
            [key: string]: any; // Allow other properties if they exist
        } | null;
    } | null;
}

export interface Group {
    id: number;
    naam: string;
    omschrijving: string;
    active: boolean;
    color: string;
}

export interface Event {
    id: number;
    title: string;
    description: string;
    location: string;
    published: boolean;
    date_start: Date | null;
    date_end: Date | null;
}