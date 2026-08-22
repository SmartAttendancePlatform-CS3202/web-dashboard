# Frontend Integration Notes

## Connected areas

- Supabase login/logout/session refresh
- Backend user/role/status validation
- Department and academic-year administration
- Course and offering administration
- Lecturer/student roster views
- Venue creation/editing with circle/square geofence data
- Session start/end and live attendance polling
- Attendance records, attempt history, and manual override
- Offering reports, trends, weekly trends, and CSV export
- Alerts
- Notices/broadcast/read state
- Admin statistics, audit log, and service health

## Gateway

The browser uses only `NEXT_PUBLIC_API_BASE_URL`. With the supplied Docker setup this points at Kong. There is no browser-side AI Vision URL.

## Authentication flow

1. `supabase.auth.signInWithPassword()` authenticates the user.
2. The access token is attached to every API request as `Authorization: Bearer ...`.
3. A 401 causes one Supabase session refresh + retry.
4. `/scheduling/users/me` is called to resolve backend role and active status.
5. If the backend rejects the account, the Supabase session is signed out.

## No image persistence

The frontend dashboard does not upload or persist student face images. Face enrollment is a mobile/app concern. The AI service receives the transient base64 image when used for enrollment/verification, extracts the embedding, and stores only the embedding plus the requested fake reference URL.
