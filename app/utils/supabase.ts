import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Singleton pattern to prevent multiple client instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
    if (!supabaseInstance) {
        supabaseInstance = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: true,
                detectSessionInUrl: false,
                storageKey: 'ksa-auth',
            },
            global: {
                headers: {
                    'x-client-info': 'ksa-petegem-admin',
                },
            },
        });
    }
    return supabaseInstance;
};

const supabase = getSupabaseClient();

export default supabase;