import { API_CONFIG } from "./config";
import { apiFetch } from "./fetcher";
import {
  CourseOffering,
  Course,
  Venue,
  Student,
  LectureSession,
  AttendanceRecord,
  AttendanceStatus,
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
  MOCK_DEPARTMENTS,
  MOCK_ACADEMIC_YEARS,
  MOCK_USERS_DIRECTORY,
  MOCK_ENROLLMENTS,
  MOCK_ADMIN_STATS,
  MOCK_AUDIT_LOGS,
  MOCK_MICROSERVICES,
} from "@/lib/mock/mockData";

// In-memory state for demo mode mutations
const activeMockSessions: LectureSession[] = [MOCK_ACTIVE_SESSION];
const mockAttendanceRecords: AttendanceRecord[] = [...MOCK_ATTENDANCE_RECORDS];
const mockAlerts: SystemAlert[] = [...MOCK_ALERTS];
const mockNotices: Notice[] = [...MOCK_NOTICES];
const mockDepartments: Department[] = [...MOCK_DEPARTMENTS];
const mockAcademicYears: AcademicYear[] = [...MOCK_ACADEMIC_YEARS];
const mockCourses: Course[] = [...MOCK_COURSES];
const mockOfferings: CourseOffering[] = [...MOCK_OFFERINGS];
const mockVenues: Venue[] = [...MOCK_VENUES];
const mockUsersDirectory: UserWithProfile[] = [...MOCK_USERS_DIRECTORY];
const mockEnrollments: Record<string, Enrollment[]> = { ...MOCK_ENROLLMENTS };
const mockAuditLogs: SystemAuditLog[] = [...MOCK_AUDIT_LOGS];


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

  getAttendanceRecords: async (sessionId?: string): Promise<AttendanceRecord[]> => {
    // Backend endpoint or filter mock records
    if (sessionId) {
      return mockAttendanceRecords.filter((r) => r.lecture_session_id === sessionId || true);
    }
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
      record.status = overrideData.status as AttendanceStatus;
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

  getActiveSessions: async (): Promise<LectureSession[]> => {
    const res = await apiFetch<LectureSession[]>(`${API_CONFIG.attendance}/sessions`);
    if (res.data && res.data.length > 0) return res.data.filter((s) => s.status === "ongoing");
    return activeMockSessions.filter((s) => s.status === "ongoing");
  },
};

export const sessionsApi = attendanceApi;

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

  getWeeklyTrends: async (): Promise<WeeklyTrendItem[]> => {
    const res = await apiFetch<WeeklyTrendItem[]>(`${API_CONFIG.attendance}/reports/trends/weekly`);
    if (res.data && res.data.length > 0) return res.data;
    return [
      { week: "Week 1", attendance_rate: 94.2, total_students: 1012 },
      { week: "Week 2", attendance_rate: 92.8, total_students: 998 },
      { week: "Week 3", attendance_rate: 89.5, total_students: 975 },
      { week: "Week 4", attendance_rate: 91.0, total_students: 988 },
      { week: "Week 5 (Current)", attendance_rate: 91.8, total_students: 1004 },
    ];
  },

  getRecentAttempts: async (offeringId?: string): Promise<AttendanceVerificationAttempt[]> => {
    if (offeringId && MOCK_ATTEMPTS[offeringId]) {
      return MOCK_ATTEMPTS[offeringId];
    }
    const attempts = Object.values(MOCK_ATTEMPTS).flat();
    return attempts;
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
      urgency: (noticeData.urgency as Notice["urgency"]) || "normal",
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

export const adminApi = {
  getStats: async (): Promise<AdminDashboardStats> => {
    // Return live stats synthesized from services or mock
    return {
      ...MOCK_ADMIN_STATS,
      total_courses: mockCourses.length,
      total_offerings: mockOfferings.length,
      total_venues: mockVenues.length,
      total_students: mockUsersDirectory.filter((u) => u.role === "student").length * 170,
      total_lecturers: mockUsersDirectory.filter((u) => u.role === "lecturer").length * 15,
      active_sessions_count: activeMockSessions.filter((s) => s.status === "ongoing").length,
    };
  },

  getUsers: async (role?: string, status?: string): Promise<UserWithProfile[]> => {
    const params = new URLSearchParams();
    if (role && role !== "all") params.append("role", role);
    if (status && status !== "all") params.append("status", status);
    const queryString = params.toString() ? `?${params.toString()}` : "";

    const res = await apiFetch<UserWithProfile[]>(`${API_CONFIG.scheduling}/users${queryString}`);
    if (res.data && res.data.length > 0) return res.data;

    let users = [...mockUsersDirectory];
    if (role && role !== "all") {
      users = users.filter((u) => u.role === role);
    }
    if (status && status !== "all") {
      users = users.filter((u) => u.status === status);
    }
    return users;
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
    if (res.data) return res.data;

    const userIndex = mockUsersDirectory.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      mockUsersDirectory[userIndex] = {
        ...mockUsersDirectory[userIndex],
        ...(updateData.role && { role: updateData.role as UserWithProfile["role"] }),
        ...(updateData.status && { status: updateData.status as UserWithProfile["status"] }),
        ...(updateData.display_name && { display_name: updateData.display_name }),
        ...(updateData.department_id && { department_id: updateData.department_id }),
        ...(updateData.identifier && { identifier: updateData.identifier }),
      };

      // Add audit log
      mockAuditLogs.unshift({
        id: `aud-${Date.now()}`,
        action: `User ${mockUsersDirectory[userIndex].email} Updated`,
        category: "user",
        performed_by_name: "University Admin",
        performed_by_role: "admin",
        details: `Role: ${mockUsersDirectory[userIndex].role}, Status: ${mockUsersDirectory[userIndex].status}`,
        timestamp: new Date().toISOString(),
        severity: "info",
      });

      return mockUsersDirectory[userIndex];
    }
    return null;
  },

  getDepartments: async (): Promise<Department[]> => {
    const res = await apiFetch<Department[]>(`${API_CONFIG.scheduling}/departments`);
    if (res.data && res.data.length > 0) return res.data;
    return mockDepartments;
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
    if (res.data) return res.data;

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: data.name,
      code: data.code.toUpperCase(),
      faculty_head: data.faculty_head || "TBD",
      description: data.description || "",
      course_count: 0,
      lecturer_count: 1,
      student_count: 0,
      created_at: new Date().toISOString(),
    };
    mockDepartments.push(newDept);
    return newDept;
  },

  getAcademicYears: async (): Promise<AcademicYear[]> => {
    const res = await apiFetch<AcademicYear[]>(`${API_CONFIG.scheduling}/academic-years`);
    if (res.data && res.data.length > 0) return res.data;
    return mockAcademicYears;
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
    if (res.data) return res.data;

    const newYear: AcademicYear = {
      id: `ay-${Date.now()}`,
      name: data.name,
      year_code: data.year_code,
      semester: data.semester,
      is_active: data.is_active,
      created_at: new Date().toISOString(),
    };
    mockAcademicYears.unshift(newYear);
    return newYear;
  },

  getCourses: async (): Promise<Course[]> => {
    const res = await apiFetch<Course[]>(`${API_CONFIG.scheduling}/courses`);
    if (res.data && res.data.length > 0) return res.data;
    return mockCourses;
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
    if (res.data) return res.data;

    const dept = mockDepartments.find((d) => d.id === data.department_id);
    const newCourse: Course = {
      id: `crs-${Date.now()}`,
      course_code: data.code.toUpperCase(),
      code: data.code.toUpperCase(),
      name: data.name,
      credits: data.credits,
      department_id: data.department_id,
      department_name: dept?.name || "Computing",
      description: data.description,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    mockCourses.push(newCourse);
    return newCourse;
  },

  getAllOfferings: async (): Promise<CourseOffering[]> => {
    const res = await apiFetch<CourseOffering[]>(`${API_CONFIG.scheduling}/offerings`);
    if (res.data && res.data.length > 0) return res.data;
    return mockOfferings;
  },

  createOffering: async (offeringData: Partial<CourseOffering>): Promise<CourseOffering> => {
    const res = await apiFetch<CourseOffering>(`${API_CONFIG.scheduling}/offerings`, {
      method: "POST",
      body: JSON.stringify(offeringData),
    });
    if (res.data) return res.data;

    const course = mockCourses.find((c) => c.id === offeringData.course_id);
    const venue = mockVenues.find((v) => v.id === offeringData.venue_id);

    const newOffering: CourseOffering = {
      id: `off-${Date.now()}`,
      course_id: offeringData.course_id || "crs-001",
      course_code: course?.code || offeringData.course_code || "CS4099",
      course_name: course?.name || offeringData.course_name || "Special Topics in Computing",
      credits: course?.credits || 3,
      lecturer_id: offeringData.lecturer_id || MOCK_LECTURER.id,
      lecturer_name: offeringData.lecturer_name || MOCK_LECTURER.display_name,
      academic_year_id: offeringData.academic_year_id || "ay-4",
      academic_year_name: offeringData.academic_year_name || "2025/2026 Year 4",
      venue_id: offeringData.venue_id || "ven-001",
      venue_name: venue?.name || offeringData.venue_name || "Auditorium Hall A",
      day: offeringData.day || "Monday",
      start_time: offeringData.start_time || "09:00",
      end_time: offeringData.end_time || "11:00",
      late_threshold_minutes: offeringData.late_threshold_minutes || 15,
      random_check_enabled: offeringData.random_check_enabled ?? true,
      random_check_window_minutes: offeringData.random_check_window_minutes || 10,
      enrolled_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    mockOfferings.push(newOffering);
    return newOffering;
  },

  getVenues: async (): Promise<Venue[]> => {
    const res = await apiFetch<Venue[]>(`${API_CONFIG.scheduling}/venues`);
    if (res.data && res.data.length > 0) return res.data;
    return mockVenues;
  },

  createVenue: async (venueData: Partial<Venue>): Promise<Venue> => {
    const res = await apiFetch<Venue>(`${API_CONFIG.scheduling}/venues`, {
      method: "POST",
      body: JSON.stringify(venueData),
    });
    if (res.data) return res.data;

    const newVenue: Venue = {
      id: `ven-${Date.now()}`,
      name: venueData.name || "New Lecture Hall",
      building: venueData.building || "Engineering Complex",
      floor: venueData.floor || "Level 2",
      shape_type: venueData.shape_type || "circle",
      boundary_data: venueData.boundary_data || {
        latitude: 6.9022,
        longitude: 79.8608,
        radius_meters: 35,
      },
      wifi_ssid: venueData.wifi_ssid || "UOC-SECURE-WIFI",
      wifi_bssid: venueData.wifi_bssid || "00:14:22:01:23:45",
      default_verification_method: venueData.default_verification_method || "gps_geofence",
      capacity: venueData.capacity || 100,
      is_active: true,
    };
    mockVenues.push(newVenue);
    return newVenue;
  },

  updateVenue: async (id: string, venueData: Partial<Venue>): Promise<Venue | null> => {
    const res = await apiFetch<Venue>(`${API_CONFIG.scheduling}/venues/${id}`, {
      method: "PATCH",
      body: JSON.stringify(venueData),
    });
    if (res.data) return res.data;

    const idx = mockVenues.findIndex((v) => v.id === id);
    if (idx !== -1) {
      mockVenues[idx] = { ...mockVenues[idx], ...venueData };
      return mockVenues[idx];
    }
    return null;
  },

  getEnrollments: async (offeringId: string): Promise<Enrollment[]> => {
    const res = await apiFetch<Enrollment[]>(`${API_CONFIG.scheduling}/offerings/${offeringId}/students`);
    if (res.data && res.data.length > 0) return res.data;
    return mockEnrollments[offeringId] || [];
  },

  enrollStudent: async (studentId: string, offeringId: string): Promise<Enrollment> => {
    const res = await apiFetch<Enrollment>(`${API_CONFIG.scheduling}/enrollments`, {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, course_offering_id: offeringId }),
    });
    if (res.data) return res.data;

    const student = mockUsersDirectory.find((u) => u.id === studentId) || MOCK_STUDENTS[0];
    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      student_id: studentId,
      course_offering_id: offeringId,
      student_name: student.display_name,
      student_index: (student as UserWithProfile).identifier || (student as Student).student_index_no || "EC/2022/999",
      department_name: student.department_name,
      created_at: new Date().toISOString(),
    };

    if (!mockEnrollments[offeringId]) {
      mockEnrollments[offeringId] = [];
    }
    mockEnrollments[offeringId].push(newEnrollment);

    // Update offering enrolled_count
    const off = mockOfferings.find((o) => o.id === offeringId);
    if (off) off.enrolled_count = (off.enrolled_count || 0) + 1;

    return newEnrollment;
  },

  removeEnrollment: async (offeringId: string, enrollmentId: string): Promise<boolean> => {
    const res = await apiFetch<{ status: string }>(`${API_CONFIG.scheduling}/enrollments/${enrollmentId}`, {
      method: "DELETE",
    });
    if (res.data) return true;

    if (mockEnrollments[offeringId]) {
      mockEnrollments[offeringId] = mockEnrollments[offeringId].filter((e) => e.id !== enrollmentId);
      const off = mockOfferings.find((o) => o.id === offeringId);
      if (off && (off.enrolled_count || 0) > 0) off.enrolled_count = (off.enrolled_count || 0) - 1;
    }
    return true;
  },

  getAuditLogs: async (): Promise<SystemAuditLog[]> => {
    return mockAuditLogs;
  },

  getMicroservicesHealth: async (): Promise<MicroserviceStatus[]> => {
    return MOCK_MICROSERVICES;
  },
};

