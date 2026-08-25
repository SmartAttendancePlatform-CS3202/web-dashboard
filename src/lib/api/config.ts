
const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

export const API_CONFIG = {
  base: baseUrl,
  scheduling: `${baseUrl}/scheduling`,
  attendance: `${baseUrl}/attendance`,
  // AI Vision is intentionally not exposed through the browser/API gateway.
};
