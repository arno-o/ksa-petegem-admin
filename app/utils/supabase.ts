import { createBrowserClient } from '@supabase/ssr';

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

const getSupabaseClient = () => {
    if (!supabaseInstance) {
        supabaseInstance = createBrowserClient(
            import.meta.env.VITE_SUPABASE_URL!,
            import.meta.env.VITE_SUPABASE_ANON_KEY!
        );
    }
    return supabaseInstance;
};

const supabase = getSupabaseClient();

export default supabase;