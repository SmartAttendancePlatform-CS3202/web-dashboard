import { API_CONFIG } from "./config";
import { apiFetch } from "./fetcher";
import { supabase } from "@/lib/supabase/client";
import {
  CourseOffering,
  Course,
  Venue,
  Student,
  LectureSession,
  AttendanceRecord,
  AttendanceVerificationAttempt,
  OfferingReport,
  TrendData,
  WeeklyTrendItem,
  SystemAlert,
  Notice,
  Lecturer,
  Department,
  AcademicYear,
  Enrollment,
  AdminDashboardStats,
  SystemAuditLog,
  MicroserviceStatus,
  UserWithProfile,
} from "@/types";

export const schedulingApi = {
  getLecturerProfile: async (): Promise<Lecturer> => {
    const res = await apiFetch<Lecturer>(`${API_CONFIG.scheduling}/users/lecturers/me`);
    if (res.error) throw new Error(res.error);
    return res.data as Lecturer;
  },

  getLecturerTimetable: async (): Promise<CourseOffering[]> => {
    const res = await apiFetch<CourseOffering[]>(`${API_CONFIG.scheduling}/timetables/lecturer/me`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getAllOfferings: async (): Promise<CourseOffering[]> => {
    const res = await apiFetch<CourseOffering[]>(`${API_CONFIG.scheduling}/offerings`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getOfferingById: async (id: string): Promise<CourseOffering | null> => {
    const res = await apiFetch<CourseOffering>(`${API_CONFIG.scheduling}/offerings/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  getOfferingStudents: async (offeringId: string): Promise<Student[]> => {
    const res = await apiFetch<Student[]>(`${API_CONFIG.scheduling}/offerings/${offeringId}/students`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getCourses: async (): Promise<Course[]> => {
    const res = await apiFetch<Course[]>(`${API_CONFIG.scheduling}/courses`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getVenues: async (): Promise<Venue[]> => {
    const res = await apiFetch<Venue[]>(`${API_CONFIG.scheduling}/venues`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },
};

export const attendanceApi = {
  getSessions: async (offeringId?: string): Promise<LectureSession[]> => {
    const url = offeringId
      ? `${API_CONFIG.attendance}/sessions?offering_id=${offeringId}`
      : `${API_CONFIG.attendance}/sessions`;
    const res = await apiFetch<LectureSession[]>(url);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getSessionById: async (id: string): Promise<LectureSession | null> => {
    const res = await apiFetch<LectureSession>(`${API_CONFIG.attendance}/sessions/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  startSession: async (data: {
    course_offering_id: string;
    venue_id?: string;
    verification_method_override?: string;
    scheduled_at: string;
    duration_mins: number;
    notes?: string;
    session_number?: number;
  }): Promise<LectureSession> => {
    const res = await apiFetch<LectureSession>(`${API_CONFIG.attendance}/sessions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.error) throw new Error(res.error);
    return res.data as LectureSession;
  },

  endSession: async (id: string): Promise<LectureSession | null> => {
    const res = await apiFetch<LectureSession>(`${API_CONFIG.attendance}/sessions/${id}/end`, {
      method: "POST",
    });
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  getSessionLiveStatus: async (id: string) => {
    const res = await apiFetch(`${API_CONFIG.attendance}/sessions/${id}/live`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  getAttendanceRecords: async (sessionId?: string): Promise<AttendanceRecord[]> => {
    const url = sessionId
      ? `${API_CONFIG.attendance}/attendance/records?session_id=${sessionId}`
      : `${API_CONFIG.attendance}/attendance/records`;
    const res = await apiFetch<AttendanceRecord[]>(url);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  overrideRecord: async (
    recordId: string,
    overrideData: {
      status: string;
      override_reason: string;
    }
  ): Promise<AttendanceRecord | null> => {
    const res = await apiFetch<AttendanceRecord>(`${API_CONFIG.attendance}/attendance/records/${recordId}/override`, {
      method: "PATCH",
      body: JSON.stringify(overrideData),
    });
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  getAttempts: async (recordId: string): Promise<AttendanceVerificationAttempt[]> => {
    const res = await apiFetch<AttendanceVerificationAttempt[]>(
      `${API_CONFIG.attendance}/attendance/records/${recordId}/attempts`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getActiveSessions: async (): Promise<LectureSession[]> => {
    const res = await apiFetch<LectureSession[]>(`${API_CONFIG.attendance}/sessions?status=ongoing`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },
};

export const sessionsApi = attendanceApi;

export const reportsApi = {
  getOfferingReport: async (offeringId: string): Promise<OfferingReport> => {
    const res = await apiFetch<OfferingReport>(`${API_CONFIG.attendance}/reports/offerings/${offeringId}`);
    if (res.error) throw new Error(res.error);
    return res.data as OfferingReport;
  },

  getOfferingTrends: async (offeringId: string): Promise<TrendData> => {
    const res = await apiFetch<TrendData>(`${API_CONFIG.attendance}/reports/offerings/${offeringId}/trends`);
    if (res.error) throw new Error(res.error);
    return res.data as TrendData;
  },

  getWeeklyTrends: async (): Promise<WeeklyTrendItem[]> => {
    const res = await apiFetch<WeeklyTrendItem[]>(`${API_CONFIG.attendance}/reports/trends/weekly`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getRecentAttempts: async (offeringId?: string): Promise<AttendanceVerificationAttempt[]> => {
    const url = offeringId
      ? `${API_CONFIG.attendance}/attendance/attempts?offering_id=${offeringId}`
      : `${API_CONFIG.attendance}/attendance/attempts`;
    const res = await apiFetch<AttendanceVerificationAttempt[]>(url);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getStudentSummary: async (studentId: string) => {
    const res = await apiFetch(`${API_CONFIG.attendance}/reports/students/${studentId}/summary`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },
};

export const alertsApi = {
  getAlerts: async (): Promise<SystemAlert[]> => {
    const res = await apiFetch<SystemAlert[]>(`${API_CONFIG.attendance}/alerts`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  markAlertRead: async (id: string): Promise<SystemAlert | null> => {
    const res = await apiFetch<SystemAlert>(`${API_CONFIG.attendance}/alerts/${id}/read`, {
      method: "PATCH",
    });
    if (res.error) throw new Error(res.error);
    return res.data;
  },
};

export const noticesApi = {
  getNotices: async (): Promise<Notice[]> => {
    const res = await apiFetch<Notice[]>(`${API_CONFIG.attendance}/notifications/me`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  broadcastNotice: async (noticeData: {
    course_offering_id?: string;
    title: string;
    body: string;
    urgency: string;
    expires_at?: string;
    target_roles?: string[];
  }): Promise<Notice> => {
    const res = await apiFetch<Notice>(`${API_CONFIG.attendance}/notifications/broadcast`, {
      method: "POST",
      body: JSON.stringify(noticeData),
    });
    if (res.error) throw new Error(res.error);
    return res.data as Notice;
  },
};

export const adminApi = {
  getStats: async (): Promise<AdminDashboardStats> => {
    const res = await apiFetch<AdminDashboardStats>(`${API_CONFIG.scheduling}/admin/stats`);
    if (res.error) throw new Error(res.error);
    return res.data as AdminDashboardStats;
  },

  getUsers: async (role?: string, status?: string): Promise<UserWithProfile[]> => {
    const params = new URLSearchParams();
    if (role && role !== "all") params.append("role", role);
    if (status && status !== "all") params.append("status", status);
    const queryString = params.toString() ? `?${params.toString()}` : "";

    const res = await apiFetch<UserWithProfile[]>(`${API_CONFIG.scheduling}/users${queryString}`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  updateUserRole: async (
    userId: string,
    updateData: {
      role?: string;
      status?: string;
      display_name?: string;
      department_id?: string;
      identifier?: string;
    }
  ): Promise<UserWithProfile | null> => {
    const res = await apiFetch<UserWithProfile>(`${API_CONFIG.scheduling}/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  getDepartments: async (): Promise<Department[]> => {
    const res = await apiFetch<Department[]>(`${API_CONFIG.scheduling}/departments`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  createDepartment: async (data: {
    name: string;
    code: string;
    faculty_head?: string;
    description?: string;
  }): Promise<Department> => {
    const res = await apiFetch<Department>(`${API_CONFIG.scheduling}/departments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.error) throw new Error(res.error);
    return res.data as Department;
  },

  getAcademicYears: async (): Promise<AcademicYear[]> => {
    const res = await apiFetch<AcademicYear[]>(`${API_CONFIG.scheduling}/academic-years`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  createAcademicYear: async (data: {
    name: string;
    year_code: string;
    semester: string;
    is_active: boolean;
  }): Promise<AcademicYear> => {
    const res = await apiFetch<AcademicYear>(`${API_CONFIG.scheduling}/academic-years`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.error) throw new Error(res.error);
    return res.data as AcademicYear;
  },

  getCourses: async (): Promise<Course[]> => {
    const res = await apiFetch<Course[]>(`${API_CONFIG.scheduling}/courses`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  createCourse: async (data: {
    code: string;
    name: string;
    credits: number;
    department_id: string;
    description?: string;
  }): Promise<Course> => {
    const res = await apiFetch<Course>(`${API_CONFIG.scheduling}/courses`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.error) throw new Error(res.error);
    return res.data as Course;
  },

  getAllOfferings: async (): Promise<CourseOffering[]> => {
    const res = await apiFetch<CourseOffering[]>(`${API_CONFIG.scheduling}/offerings`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  createOffering: async (offeringData: Partial<CourseOffering>): Promise<CourseOffering> => {
    const res = await apiFetch<CourseOffering>(`${API_CONFIG.scheduling}/offerings`, {
      method: "POST",
      body: JSON.stringify(offeringData),
    });
    if (res.error) throw new Error(res.error);
    return res.data as CourseOffering;
  },

  getVenues: async (): Promise<Venue[]> => {
    const res = await apiFetch<Venue[]>(`${API_CONFIG.scheduling}/venues`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  createVenue: async (venueData: Partial<Venue>): Promise<Venue> => {
    const res = await apiFetch<Venue>(`${API_CONFIG.scheduling}/venues`, {
      method: "POST",
      body: JSON.stringify(venueData),
    });
    if (res.error) throw new Error(res.error);
    return res.data as Venue;
  },

  updateVenue: async (id: string, venueData: Partial<Venue>): Promise<Venue | null> => {
    const res = await apiFetch<Venue>(`${API_CONFIG.scheduling}/venues/${id}`, {
      method: "PATCH",
      body: JSON.stringify(venueData),
    });
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  getEnrollments: async (offeringId: string): Promise<Enrollment[]> => {
    const res = await apiFetch<Enrollment[]>(`${API_CONFIG.scheduling}/offerings/${offeringId}/students`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  enrollStudent: async (studentId: string, offeringId: string): Promise<Enrollment> => {
    const res = await apiFetch<Enrollment>(`${API_CONFIG.scheduling}/enrollments`, {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, course_offering_id: offeringId }),
    });
    if (res.error) throw new Error(res.error);
    return res.data as Enrollment;
  },

  removeEnrollment: async (offeringId: string, enrollmentId: string): Promise<boolean> => {
    const res = await apiFetch<{ status: string }>(`${API_CONFIG.scheduling}/enrollments/${enrollmentId}`, {
      method: "DELETE",
    });
    if (res.error) throw new Error(res.error);
    return true;
  },

  getAuditLogs: async (): Promise<SystemAuditLog[]> => {
    const res = await apiFetch<SystemAuditLog[]>(`${API_CONFIG.scheduling}/admin/audit-logs`);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getMicroservicesHealth: async (): Promise<MicroserviceStatus[]> => {
    const statuses: MicroserviceStatus[] = [];
    
    // Fetch Scheduling Service Health
    try {
      const schedRes = await apiFetch<MicroserviceStatus>(`${API_CONFIG.scheduling}/admin/health`);
      if (!schedRes.error && schedRes.data) {
        statuses.push(schedRes.data);
      } else {
        statuses.push({ name: "Scheduling Service", port: 8001, status: "down", latency_ms: 0, endpoint: "/admin/health", version: "1.0.0" });
      }
    } catch {
      statuses.push({ name: "Scheduling Service", port: 8001, status: "down", latency_ms: 0, endpoint: "/admin/health", version: "1.0.0" });
    }

    // Fetch Attendance Service Health
    try {
      const attRes = await apiFetch<MicroserviceStatus>(`${API_CONFIG.attendance}/admin/health`);
      if (!attRes.error && attRes.data) {
        statuses.push(attRes.data);
      } else {
        statuses.push({ name: "Attendance Service", port: 8002, status: "down", latency_ms: 0, endpoint: "/admin/health", version: "1.0.0" });
      }
    } catch {
      statuses.push({ name: "Attendance Service", port: 8002, status: "down", latency_ms: 0, endpoint: "/admin/health", version: "1.0.0" });
    }

    return statuses;
  },

  testSupabaseEdgeConnection: async (): Promise<{ status: "online" | "offline"; latency_ms: number }> => {
    const start = performance.now();
    try {
      const { error } = await supabase.auth.getSession();
      const latency_ms = Math.round(performance.now() - start);
      if (error) {
        return { status: "offline", latency_ms: 0 };
      }
      return { status: "online", latency_ms };
    } catch {
      return { status: "offline", latency_ms: 0 };
    }
  },
};
