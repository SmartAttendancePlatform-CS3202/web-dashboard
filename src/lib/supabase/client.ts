import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This automatically uses document.cookie instead of localStorage
export const supabase = (!supabaseUrl || !supabaseAnonKey)
  ? (new Proxy({}, {
      get() {
        throw new Error("Missing Supabase environment variables. Please check your .env file.");
      }
    }) as ReturnType<typeof createBrowserClient>)
  : createBrowserClient(supabaseUrl, supabaseAnonKey);
