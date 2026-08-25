import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createClient() {
  const headerList = await headers();
  const authHeader = headerList.get("authorization");
  const token = authHeader?.replace("Bearer ", "") || "";

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}
