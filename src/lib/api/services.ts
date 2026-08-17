import { API_CONFIG } from "./config";
import { apiFetch } from "./fetcher";
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
  SystemAlert,
  Notice,
  Lecturer,
} from "@/types";
import {
  MOCK_LECTURER,
  MOCK_COURSES,
  MOCK_OFFERINGS,
  MOCK_VENUES,
  MOCK_STUDENTS,
  MOCK_ACTIVE_SESSION,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_ATTEMPTS,
  MOCK_OFFERING_REPORT,
  MOCK_TRENDS,
  MOCK_ALERTS,
  MOCK_NOTICES,
} from "@/lib/mock/mockData";

// In-memory state for demo mode mutations
let activeMockSessions: LectureSession[] = [MOCK_ACTIVE_SESSION];
let mockAttendanceRecords: AttendanceRecord[] = [...MOCK_ATTENDANCE_RECORDS];
let mockAlerts: SystemAlert[] = [...MOCK_ALERTS];
let mockNotices: Notice[] = [...MOCK_NOTICES];

export const schedulingApi = {
  getLecturerProfile: async (): Promise<Lecturer> => {
    const res = await apiFetch<Lecturer>(`${API_CONFIG.scheduling}/users/lecturers/me`);
    if (res.data) return res.data;
    return MOCK_LECTURER;
  },

  getLecturerTimetable: async (): Promise<CourseOffering[]> => {
    const res = await apiFetch<CourseOffering[]>(`${API_CONFIG.scheduling}/timetables/lecturer/me`);
    if (res.data && res.data.length > 0) return res.data;
    return MOCK_OFFERINGS;
  },

  getAllOfferings: async (): Promise<CourseOffering[]> => {
    const res = await apiFetch<CourseOffering[]>(`${API_CONFIG.scheduling}/offerings`);
    if (res.data && res.data.length > 0) return res.data;
    return MOCK_OFFERINGS;
  },

  getOfferingById: async (id: string): Promise<CourseOffering | null> => {
    const res = await apiFetch<CourseOffering>(`${API_CONFIG.scheduling}/offerings/${id}`);
    if (res.data) return res.data;
    return MOCK_OFFERINGS.find((o) => o.id === id) || MOCK_OFFERINGS[0];
  },

  getOfferingStudents: async (offeringId: string): Promise<Student[]> => {
    const res = await apiFetch<Student[]>(`${API_CONFIG.scheduling}/offerings/${offeringId}/students`);
    if (res.data && res.data.length > 0) return res.data;
    return MOCK_STUDENTS;
  },

  getCourses: async (): Promise<Course[]> => {
    const res = await apiFetch<Course[]>(`${API_CONFIG.scheduling}/courses`);
    if (res.data && res.data.length > 0) return res.data;
    return MOCK_COURSES;
  },

  getVenues: async (): Promise<Venue[]> => {
    const res = await apiFetch<Venue[]>(`${API_CONFIG.scheduling}/venues`);
    if (res.data && res.data.length > 0) return res.data;
    return MOCK_VENUES;
  },
};

export const attendanceApi = {
  getSessions: async (offeringId?: string): Promise<LectureSession[]> => {
    const url = offeringId
      ? `${API_CONFIG.attendance}/sessions?offering_id=${offeringId}`
      : `${API_CONFIG.attendance}/sessions`;
    const res = await apiFetch<LectureSession[]>(url);
    if (res.data && res.data.length > 0) return res.data;
    if (offeringId) {
      return activeMockSessions.filter((s) => s.course_offering_id === offeringId);
    }
    return activeMockSessions;
  },

  getSessionById: async (id: string): Promise<LectureSession | null> => {
    const res = await apiFetch<LectureSession>(`${API_CONFIG.attendance}/sessions/${id}`);
    if (res.data) return res.data;
    return activeMockSessions.find((s) => s.id === id) || activeMockSessions[0] || null;
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
      body: JSON.stringify({
        ...data,
        session_number: data.session_number || 8,
      }),
    });
    if (res.data) return res.data;

    const offering = MOCK_OFFERINGS.find((o) => o.id === data.course_offering_id) || MOCK_OFFERINGS[0];
    const venue = MOCK_VENUES.find((v) => v.id === data.venue_id) || MOCK_VENUES[0];

    const newSession: LectureSession = {
      id: `sess-${Date.now()}`,
      course_offering_id: data.course_offering_id,
      course_code: offering.course_code,
      course_name: offering.course_name,
      venue_id: data.venue_id || venue.id,
      venue_name: venue.name,
      scheduled_at: data.scheduled_at,
      duration_mins: data.duration_mins,
      status: "ongoing",
      held_at: new Date().toISOString(),
      notes: data.notes,
      session_number: (activeMockSessions.length || 0) + 1,
      created_at: new Date().toISOString(),
      first_check_in_window: {
        id: `win-${Date.now()}-1`,
        lecture_session_id: `sess-${Date.now()}`,
        window_type: "first_check_in",
        scheduled_open_at: new Date().toISOString(),
        scheduled_close_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        actual_opened_at: new Date().toISOString(),
        is_active: true,
      },
      random_check_window: offering.random_check_enabled
        ? {
            id: `win-${Date.now()}-2`,
            lecture_session_id: `sess-${Date.now()}`,
            window_type: "random_check",
            scheduled_open_at: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
            scheduled_close_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            is_active: false,
          }
        : undefined,
      present_count: 1,
      late_count: 0,
      flagged_count: 0,
      absent_count: (offering.enrolled_count || 50) - 1,
      total_enrolled: offering.enrolled_count || 50,
    };

    activeMockSessions.unshift(newSession);
    return newSession;
  },

  endSession: async (id: string): Promise<LectureSession | null> => {
    const res = await apiFetch<LectureSession>(`${API_CONFIG.attendance}/sessions/${id}/end`, {
      method: "POST",
    });
    if (res.data) return res.data;

    const session = activeMockSessions.find((s) => s.id === id);
    if (session) {
      session.status = "completed";
      if (session.first_check_in_window) session.first_check_in_window.is_active = false;
      if (session.random_check_window) session.random_check_window.is_active = false;
    }
    return session || null;
  },

  getSessionLiveStatus: async (id: string) => {
    const res = await apiFetch(`${API_CONFIG.attendance}/sessions/${id}/live`);
    if (res.data) return res.data;
    const session = activeMockSessions.find((s) => s.id === id) || MOCK_ACTIVE_SESSION;
    return {
      first_check_in_window: session.first_check_in_window,
      random_check_window: session.random_check_window,
    };
  },

  getAttendanceRecords: async (sessionId: string): Promise<AttendanceRecord[]> => {
    // Backend endpoint or filter mock records
    return mockAttendanceRecords;
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
    if (res.data) return res.data;

    const record = mockAttendanceRecords.find((r) => r.id === recordId);
    if (record) {
      record.status = overrideData.status as any;
      record.is_manually_overridden = true;
      record.override_reason = overrideData.override_reason;
      record.override_by_name = MOCK_LECTURER.display_name;
      record.overridden_at = new Date().toISOString();
      record.updated_at = new Date().toISOString();
      if (overrideData.status === "present" && !record.first_check_in_at) {
        record.first_check_in_at = new Date().toISOString();
      }
    }
    return record || null;
  },

  getAttempts: async (recordId: string): Promise<AttendanceVerificationAttempt[]> => {
    const res = await apiFetch<AttendanceVerificationAttempt[]>(
      `${API_CONFIG.attendance}/attendance/records/${recordId}/attempts`
    );
    if (res.data && res.data.length > 0) return res.data;
    return MOCK_ATTEMPTS[recordId] || MOCK_ATTEMPTS["rec-001"] || [];
  },
};

export const reportsApi = {
  getOfferingReport: async (offeringId: string): Promise<OfferingReport> => {
    const res = await apiFetch<OfferingReport>(`${API_CONFIG.attendance}/reports/offerings/${offeringId}`);
    if (res.data) return res.data;
    return MOCK_OFFERING_REPORT;
  },

  getOfferingTrends: async (offeringId: string): Promise<TrendData> => {
    const res = await apiFetch<TrendData>(`${API_CONFIG.attendance}/reports/offerings/${offeringId}/trends`);
    if (res.data) return res.data;
    return MOCK_TRENDS;
  },

  getStudentSummary: async (studentId: string) => {
    const res = await apiFetch(`${API_CONFIG.attendance}/reports/students/${studentId}/summary`);
    if (res.data) return res.data;
    return {
      student_id: studentId,
      overall_attendance_percentage: 89.2,
      course_breakdown: {
        CS4012: 94.0,
        CS3024: 87.5,
        SE2090: 86.0,
      },
    };
  },
};

export const alertsApi = {
  getAlerts: async (): Promise<SystemAlert[]> => {
    const res = await apiFetch<SystemAlert[]>(`${API_CONFIG.attendance}/alerts`);
    if (res.data && res.data.length > 0) return res.data;
    return mockAlerts;
  },

  markAlertRead: async (id: string): Promise<SystemAlert | null> => {
    const res = await apiFetch<SystemAlert>(`${API_CONFIG.attendance}/alerts/${id}/read`, {
      method: "PATCH",
    });
    if (res.data) return res.data;

    const alert = mockAlerts.find((a) => a.id === id);
    if (alert) alert.is_read = true;
    return alert || null;
  },
};

export const noticesApi = {
  getNotices: async (): Promise<Notice[]> => {
    const res = await apiFetch<Notice[]>(`${API_CONFIG.attendance}/notifications/me`);
    if (res.data && res.data.length > 0) return res.data;
    return mockNotices;
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
    if (res.data) return res.data;

    const offering = MOCK_OFFERINGS.find((o) => o.id === noticeData.course_offering_id);

    const newNotice: Notice = {
      id: `not-${Date.now()}`,
      course_offering_id: noticeData.course_offering_id,
      course_code: offering?.course_code || "ALL COURSES",
      title: noticeData.title,
      body: noticeData.body,
      urgency: (noticeData.urgency as any) || "normal",
      created_by: MOCK_LECTURER.id,
      creator_name: MOCK_LECTURER.display_name,
      created_at: new Date().toISOString(),
      expires_at: noticeData.expires_at,
      read_count: 0,
    };

    mockNotices.unshift(newNotice);
    return newNotice;
  },
};
