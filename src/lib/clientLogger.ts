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
  fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, message, context }),
  }).catch(() => {
    // Silently fail if we can't reach the log server to prevent infinite loops
  });
}
