
import { supabase } from "@/lib/supabase/client";

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
  retryOn401 = true,
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = new Headers(options.headers || {});
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("X-Request-ID", crypto.randomUUID());
    if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`);

    let response = await fetch(url, { ...options, headers, cache: "no-store" });

    if (response.status === 401 && retryOn401) {
      const refreshed = await supabase.auth.refreshSession();
      if (refreshed.data.session?.access_token) {
        headers.set("Authorization", `Bearer ${refreshed.data.session.access_token}`);
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
    const { data: { session } } = await supabase.auth.getSession();
    const headers = new Headers(options.headers || {});
    if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("X-Request-ID", crypto.randomUUID());
    if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`);
    let response = await fetch(url, { ...options, headers, cache: "no-store" });
    if (response.status === 401 && retryOn401) {
      const refreshed = await supabase.auth.refreshSession();
      if (refreshed.data.session?.access_token) {
        headers.set("Authorization", `Bearer ${refreshed.data.session.access_token}`);
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
