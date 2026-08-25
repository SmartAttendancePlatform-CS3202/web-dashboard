import { supabase } from "@/lib/supabase/client";

export const clientLogger = {
  info: (message: string, context?: Record<string, unknown>) => logToServer("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => logToServer("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => logToServer("error", message, context),
  debug: (message: string, context?: Record<string, unknown>) => logToServer("debug", message, context),
};

type LogLevel = "info" | "warn" | "error" | "debug";

function logToServer(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    // In local dev, also print to browser console
    const logFn = console[level] ?? console.log;
    logFn(`[CLIENT ${level.toUpperCase()}]`, message, context || "");
  }

  // Fire and forget to server
  supabase.auth.getSession().then(({ data: { session } }) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    fetch("/api/logs", {
      method: "POST",
      headers,
      body: JSON.stringify({ level, message, context }),
    }).catch(() => {
      // Silently fail if we can't reach the log server to prevent infinite loops
    });
  }).catch(() => {
    // Silently fail if session retrieval fails
  });
}
