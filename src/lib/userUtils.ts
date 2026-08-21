import { User, Lecturer } from "@/types";

/**
 * Derives a clean display name for a logged-in user or profile.
 * Falls back gracefully to user metadata or formatted email prefix.
 */
export function getUserDisplayName(user: User | null, lecturerProfile: Lecturer | null): string {
  if (lecturerProfile?.display_name) return lecturerProfile.display_name;
  if (lecturerProfile?.full_name) return lecturerProfile.full_name;

  const metadata = user?.user_metadata;
  if (metadata?.display_name) return metadata.display_name;
  if (metadata?.full_name) return metadata.full_name;
  if (metadata?.name) return metadata.name;

  if (user?.email) {
    const username = user.email.split("@")[0];
    const nameParts = username.split(/[\._\-]/).filter(Boolean);
    if (nameParts.length > 0) {
      return nameParts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
    }
    return user.email;
  }

  return "User Account";
}

/**
 * Derives a subtitle (Employee ID or Email) for the user.
 */
export function getUserSubtitle(user: User | null, lecturerProfile: Lecturer | null): string {
  if (lecturerProfile?.employee_id) return lecturerProfile.employee_id;
  if (user?.email) return user.email;
  return "";
}

/**
 * Derives a single uppercase initial character for the avatar icon.
 */
export function getUserAvatarInitial(user: User | null, lecturerProfile: Lecturer | null): string {
  const name = getUserDisplayName(user, lecturerProfile);
  if (name && name !== "User Account") {
    // Filter out common title prefixes
    const parts = name.split(" ").filter((p) => !["Dr.", "Prof.", "Mr.", "Ms.", "Mrs."].includes(p));
    if (parts.length > 0 && parts[0].length > 0) {
      return parts[0].charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }
  if (user?.email) {
    return user.email.charAt(0).toUpperCase();
  }
  return "U";
}
