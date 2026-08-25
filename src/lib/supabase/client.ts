import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This automatically uses document.cookie instead of localStorage
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
