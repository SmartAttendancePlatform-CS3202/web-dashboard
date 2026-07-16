// Base URLs for the backend services (see the sibling `backend` repo)
export const API = {
  scheduling: process.env.NEXT_PUBLIC_SCHEDULING_SERVICE_URL!,
  attendance: process.env.NEXT_PUBLIC_ATTENDANCE_SERVICE_URL!,
};
