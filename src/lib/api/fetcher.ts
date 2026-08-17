import { supabase } from "@/lib/supabase/client";

/**
 * Attaches the current Supabase session's JWT to a backend API call.
 */
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    let token = "";
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      token = session?.access_token ?? "";
    } catch {
      // Supabase not configured or offline
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) errorMsg = errJson.detail;
      } catch {
        // use default error message
      }
      return { data: null, error: errorMsg, status: response.status };
    }

    if (response.status === 204) {
      return { data: null, error: null, status: 204 };
    }

    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (err: any) {
    return { data: null, error: err.message || "Network request failed", status: 500 };
  }
}
