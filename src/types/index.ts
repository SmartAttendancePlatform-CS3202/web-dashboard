export type UserRole = "student" | "lecturer" | "admin";
export type UserStatus = "pending_approval" | "active" | "suspended" | "inactive";
export type GenderType = "male" | "female" | "other";
export type SessionStatus = "scheduled" | "ongoing" | "completed" | "cancelled";
export type VerificationMethod = "gps_geofence" | "wifi_ap";
export type GeofenceShape = "circle" | "polygon";
export type WindowType = "first_check_in" | "random_check";
export type AttemptStatus = "success" | "failed";
export type AttendanceStatus = "present" | "late" | "absent" | "flagged_proxy";
export type NoticeUrgency = "low" | "normal" | "high" | "urgent";
export type AlertType = "proxy_flagged" | "verification_failure_spike" | "system" | "other";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Lecturer {
  id: string;
  employee_id: string;
  full_name: string;
  name_with_initials: string;
  display_name: string;
  department_id?: string;
  department_name?: string;
  contact_number?: string;
  email?: string;
  photo_url?: string;
  created_at: string;
}

export interface Student {
  id: string;
  student_index_no: string;
  full_name: string;
  name_with_initials: string;
  display_name: string;
  department_id?: string;
  department_name?: string;
  academic_year_id?: string;
  academic_year_name?: string;
  date_of_birth?: string;
  gender?: string;
  nic?: string;
  contact_number?: string;
  photo_url?: string;
  attendance_rate?: number;
}

export interface Venue {
  id: string;
  name: string;
  building?: string;
  floor?: string;
  shape_type: GeofenceShape;
  boundary_data: {
    latitude?: number;
    longitude?: number;
    radius_meters?: number;
    polygon?: Array<[number, number]>;
  };
  wifi_ssid?: string;
  wifi_bssid?: string;
  default_verification_method: VerificationMethod;
  capacity?: number;
  is_active: boolean;
}

export interface Course {
  id: string;
  course_code: string;
  name: string;
  department_id?: string;
  department_name?: string;
  credits?: number;
  created_at: string;
}

export interface CourseOffering {
  id: string;
  offering_code?: string;
  course_id: string;
  course_code?: string;
  course_name?: string;
  academic_year_id: string;
  academic_year_name?: string;
  lecturer_id: string;
  lecturer_name?: string;
  semester?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  venue_id?: string;
  venue_name?: string;
  max_students?: number;
  enrolled_count?: number;
  late_threshold_minutes: number;
  random_check_enabled: boolean;
  random_check_window_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface VerificationWindow {
  id: string;
  lecture_session_id: string;
  window_type: WindowType;
  scheduled_open_at: string;
  scheduled_close_at: string;
  actual_opened_at?: string;
  actual_closed_at?: string;
  is_active: boolean;
}

export interface LectureSession {
  id: string;
  course_offering_id: string;
  course_code?: string;
  course_name?: string;
  venue_id?: string;
  venue_name?: string;
  verification_method_override?: VerificationMethod;
  scheduled_at: string;
  duration_mins: number;
  status: SessionStatus;
  held_at?: string;
  notes?: string;
  session_number: number;
  created_at: string;
  first_check_in_window?: VerificationWindow;
  random_check_window?: VerificationWindow;
  present_count?: number;
  late_count?: number;
  absent_count?: number;
  flagged_count?: number;
  total_enrolled?: number;
}

export interface AttendanceRecord {
  id: string;
  lecture_session_id: string;
  student_id: string;
  student_name?: string;
  student_index?: string;
  student_photo?: string;
  status: AttendanceStatus;
  first_check_in_at?: string;
  random_check_completed_at?: string;
  flag_reason?: string;
  is_manually_overridden: boolean;
  override_by?: string;
  override_by_name?: string;
  override_reason?: string;
  overridden_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceVerificationAttempt {
  id: string;
  verification_window_id: string;
  student_id: string;
  student_name?: string;
  student_index?: string;
  attempt_number: number;
  used_face_verification: boolean;
  used_location_check: boolean;
  location_method?: VerificationMethod;
  latitude?: number;
  longitude?: number;
  distance_from_venue_meters?: number;
  wifi_ssid_detected?: string;
  face_match_confidence?: number;
  status: AttemptStatus;
  failure_reason?: string;
  device_info?: {
    platform?: string;
    model?: string;
    os_version?: string;
    ip?: string;
  };
  attempted_at: string;
}

export interface StudentAttendanceDetail {
  student_id: string;
  student_name?: string;
  student_index?: string;
  status: AttendanceStatus;
  first_check_in_at?: string;
  random_check_completed_at?: string;
  flag_reason?: string;
  consecutive_absences?: number;
}

export interface OfferingReport {
  course_offering_id: string;
  course_code?: string;
  course_name?: string;
  attendance_percentage: number;
  total_sessions?: number;
  total_students?: number;
  absentee_list: StudentAttendanceDetail[];
  late_arrival_list: StudentAttendanceDetail[];
}

export interface TrendDataPoint {
  date: string;
  session_number?: number;
  attendance_percentage: number;
  present_count?: number;
  total_enrolled?: number;
}

export interface TrendData {
  course_offering_id: string;
  trends: TrendDataPoint[];
}

export interface StudentSummary {
  student_id: string;
  student_name?: string;
  student_index?: string;
  overall_attendance_percentage: number;
  course_breakdown: Record<string, number>;
}

export interface Notice {
  id: string;
  course_offering_id?: string;
  course_code?: string;
  title: string;
  body: string;
  urgency: NoticeUrgency;
  created_by: string;
  creator_name?: string;
  created_at: string;
  expires_at?: string;
  target_roles?: UserRole[];
  target_user_ids?: string[];
  read_count?: number;
}

export interface SystemAlert {
  id: string;
  title?: string;
  type: AlertType;
  message: string;
  details?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}
