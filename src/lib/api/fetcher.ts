/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase as browserSupabase } from "@/lib/supabase/client";

async function getAccessToken(): Promise<string | undefined> {
  if (typeof window !== "undefined") {
    const { data: { session } } = await browserSupabase.auth.getSession();
    return session?.access_token;
  }
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const { createServerClient } = await import("@supabase/ssr");
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
    
    const supabaseServer = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {}
      }
    });
    const { data: { session } } = await supabaseServer.auth.getSession();
    return session?.access_token;
  } catch (e) {
    return undefined;
  }
}

async function refreshAccessToken(): Promise<string | undefined> {
  if (typeof window !== "undefined") {
    const refreshed = await browserSupabase.auth.refreshSession();
    return refreshed.data.session?.access_token;
  }
  return undefined;
}

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
  retryOn401 = true,
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const token = await getAccessToken();
    const headers = new Headers(options.headers || {});
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("X-Request-ID", crypto.randomUUID());
    if (token) headers.set("Authorization", `Bearer ${token}`);

    let response = await fetch(url, { ...options, headers, cache: "no-store" });

    if (response.status === 401 && retryOn401) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        headers.set("Authorization", `Bearer ${refreshedToken}`);
        response = await fetch(url, { ...options, headers, cache: "no-store" });
      }
    }

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const body = await response.json();
        if (typeof body?.detail === "string") errorMsg = body.detail;
        else if (Array.isArray(body?.detail)) errorMsg = body.detail.map((e: any) => e?.msg || "Validation error").join(", ");
        else if (typeof body?.message === "string") errorMsg = body.message;
      } catch {}
      return { data: null, error: errorMsg, status: response.status };
    }

    if (response.status === 204) return { data: null, error: null, status: 204 };
    const text = await response.text();
    let parsed: unknown = null;
    if (text) {
      try { parsed = JSON.parse(text); }
      catch { parsed = text; }
    }
    return { data: parsed as T | null, error: null, status: response.status };
  } catch (err: unknown) {
    return { data: null, error: err instanceof Error ? err.message : "Network request failed", status: 0 };
  }
}

export async function apiFetchText(
  url: string,
  options: RequestInit = {},
  retryOn401 = true,
): Promise<{ data: string | null; error: string | null; status: number }> {
  try {
    const token = await getAccessToken();
    const headers = new Headers(options.headers || {});
    if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("X-Request-ID", crypto.randomUUID());
    if (token) headers.set("Authorization", `Bearer ${token}`);

    let response = await fetch(url, { ...options, headers, cache: "no-store" });
    if (response.status === 401 && retryOn401) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        headers.set("Authorization", `Bearer ${refreshedToken}`);
        response = await fetch(url, { ...options, headers, cache: "no-store" });
      }
    }
    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const body = await response.json();
        if (typeof body?.detail === "string") errorMsg = body.detail;
        else if (Array.isArray(body?.detail)) errorMsg = body.detail.map((e: any) => e?.msg || "Validation error").join(", ");
        else if (typeof body?.message === "string") errorMsg = body.message;
      } catch {}
      return { data: null, error: errorMsg, status: response.status };
    }
    return { data: await response.text(), error: null, status: response.status };
  } catch (err: unknown) {
    return { data: null, error: err instanceof Error ? err.message : "Network request failed", status: 0 };
  }
}
