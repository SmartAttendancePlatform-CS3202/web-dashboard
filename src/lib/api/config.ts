// Base URLs for backend services
export const API_CONFIG = {
  scheduling: process.env.NEXT_PUBLIC_SCHEDULING_SERVICE_URL || "http://localhost:8001",
  attendance: process.env.NEXT_PUBLIC_ATTENDANCE_SERVICE_URL || "http://localhost:8002",
  vision: process.env.NEXT_PUBLIC_VISION_SERVICE_URL || "http://localhost:8003",
  isMockFallbackEnabled: true,
};
