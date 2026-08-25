/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_CONFIG } from "./config";
import { apiFetch, apiFetchText } from "./fetcher";
import { supabase } from "@/lib/supabase/client";
import {
  CourseOffering, Course, Venue, Student, LectureSession, AttendanceRecord,
  AttendanceVerificationAttempt, OfferingReport, TrendData, WeeklyTrendItem,
  SystemAlert, Notice, Lecturer, Department, AcademicYear, Enrollment,
  AdminDashboardStats, SystemAuditLog, MicroserviceStatus, UserWithProfile,
} from "@/types";

async function must<T>(promise: Promise<{data:T|null; error:string|null; status:number}>): Promise<T> {
  const res = await promise;
  if (res.error) throw new Error(res.error);
  return res.data as T;
}

async function hydrateOfferings(raw: any[]): Promise<CourseOffering[]> {
  const [courses, venues, lecturers] = await Promise.all([
    must(apiFetch<any[]>(`${API_CONFIG.scheduling}/courses`)),
    must(apiFetch<any[]>(`${API_CONFIG.scheduling}/venues`)),
    must(apiFetch<any[]>(`${API_CONFIG.scheduling}/users/lecturers`)),
  ]);
  const cm = new Map(courses.map((c:any)=>[c.id,c]));
  const vm = new Map(venues.map((v:any)=>[v.id,v]));
  const lm = new Map(lecturers.map((l:any)=>[l.id,l]));
  return (raw||[]).map((o:any)=>({
    ...o,
    course_code: cm.get(o.course_id)?.course_code,
    course_name: cm.get(o.course_id)?.name,
    credits: cm.get(o.course_id)?.credits,
    venue_name: vm.get(o.venue_id)?.name,
    lecturer_name: lm.get(o.lecturer_id)?.display_name || lm.get(o.lecturer_id)?.email,
  }));
}

async function hydrateStudents(raw:any[]): Promise<Student[]> {
  const departments = await must(apiFetch<any[]>(`${API_CONFIG.scheduling}/departments`)).catch(()=>[] as any[]);
  const dm = new Map(departments.map((d:any)=>[d.id,d]));
  return (raw||[]).map((s:any)=>({...s, department_name: dm.get(s.department_id)?.name}));
}

async function hydrateSessions(raw:any[]): Promise<LectureSession[]> {
  const offerings = await schedulingApi.getAllOfferings().catch(()=>[] as CourseOffering[]);
  const om = new Map(offerings.map((o:any)=>[o.id,o]));
  return (raw||[]).map((s:any)=>({
    ...s,
    course_code: om.get(s.course_offering_id)?.course_code,
    course_name: om.get(s.course_offering_id)?.course_name,
    venue_name: om.get(s.venue_id)?.venue_name,
    lecturer_id: om.get(s.course_offering_id)?.lecturer_id,
    lecturer_name: om.get(s.course_offering_id)?.lecturer_name,
  }));
}

export const schedulingApi = {
  getCurrentUser: async (): Promise<any> => must(apiFetch(`${API_CONFIG.scheduling}/users/me`)),
  getLecturerProfile: async (): Promise<Lecturer> => {
    const p:any = await must(apiFetch(`${API_CONFIG.scheduling}/users/lecturers/me`));
    return {...p, employee_id: p.lecturer_code || p.employee_id, created_at:p.created_at};
  },
  getStudentProfile: async (): Promise<Student> => must(apiFetch<Student>(`${API_CONFIG.scheduling}/users/students/me`)),
  getLecturerTimetable: async (): Promise<CourseOffering[]> => hydrateOfferings(await must(apiFetch<any[]>(`${API_CONFIG.scheduling}/timetables/lecturer/me`))),
  getStudentTimetable: async (): Promise<CourseOffering[]> => hydrateOfferings(await must(apiFetch<any[]>(`${API_CONFIG.scheduling}/timetables/me`))),
  getAllOfferings: async (): Promise<CourseOffering[]> => hydrateOfferings(await must(apiFetch<any[]>(`${API_CONFIG.scheduling}/offerings`))),
  getOfferingById: async (id:string): Promise<CourseOffering|null> => {
    const raw:any = await must(apiFetch(`${API_CONFIG.scheduling}/offerings/${id}`));
    const list = await hydrateOfferings([raw]);
    return list[0] || null;
  },
  getOfferingStudents: async (offeringId:string): Promise<Student[]> => hydrateStudents(await must(apiFetch<any[]>(`${API_CONFIG.scheduling}/offerings/${offeringId}/students`))),
  getCourses: async (): Promise<Course[]> => must(apiFetch<Course[]>(`${API_CONFIG.scheduling}/courses`)),
  getVenues: async (): Promise<Venue[]> => must(apiFetch<Venue[]>(`${API_CONFIG.scheduling}/venues`)),
  getDepartments: async (): Promise<Department[]> => must(apiFetch<Department[]>(`${API_CONFIG.scheduling}/departments`)),
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    const raw:any[] = await must(apiFetch<any[]>(`${API_CONFIG.scheduling}/academic-years`));
    return raw.map(y=>({...y, year_code: y.year_code || String(y.year_level), semester: y.semester || "", is_active: y.is_active ?? true}));
  },
  getLecturers: async (): Promise<Lecturer[]> => (await must(apiFetch<any[]>(`${API_CONFIG.scheduling}/users/lecturers`))).map((x:any)=>({...x,employee_id:x.lecturer_code||x.employee_id})),
  getStudents: async (): Promise<Student[]> => hydrateStudents(await must(apiFetch<any[]>(`${API_CONFIG.scheduling}/users/students`))),
  getUsers: async (role?:string,status?:string): Promise<UserWithProfile[]> => {
    const p = new URLSearchParams(); if(role && role!=="all") p.set("role",role); if(status && status!=="all") p.set("status",status);
    const raw:any[] = await must(apiFetch<any[]>(`${API_CONFIG.scheduling}/users${p.toString()?`?${p}`:""}`));
    const [students, lecturers, departments] = await Promise.all([schedulingApi.getStudents(), schedulingApi.getLecturers(), schedulingApi.getDepartments()]);
    const sm=new Map(students.map(s=>[s.id,s])); const lm=new Map(lecturers.map(l=>[l.id,l])); const dm=new Map(departments.map(d=>[d.id,d]));
    return raw.map(u=>{
      const s=sm.get(u.id), l=lm.get(u.id); const p=s||l;
      return {...u, email:u.username, display_name:(p as any)?.display_name, full_name:(p as any)?.full_name, identifier:s?.student_index_no || l?.employee_id, department_id:(p as any)?.department_id, department_name:dm.get((p as any)?.department_id || "")?.name, has_face_enrolled:undefined};
    });
  },
  getPendingUsers: async (): Promise<UserWithProfile[]> => schedulingApi.getUsers(undefined,"pending_approval"),
  approveUser: async (id:string) => must(apiFetch(`${API_CONFIG.scheduling}/users/${id}/approve`,{method:"POST"})),
  rejectUser: async (id:string) => must(apiFetch(`${API_CONFIG.scheduling}/users/${id}/reject`,{method:"POST"})),
};

export const attendanceApi = {
  getSessions: async (offeringId?:string): Promise<LectureSession[]> => {
    const p = new URLSearchParams(); if(offeringId)p.set("offering_id",offeringId);
    return hydrateSessions(await must(apiFetch<any[]>(`${API_CONFIG.attendance}/sessions${p.toString()?`?${p}`:""}`)));
  },
  getSessionById: async (id:string) => {
    const raw:any = await must(apiFetch(`${API_CONFIG.attendance}/sessions/${id}`));
    return (await hydrateSessions([raw]))[0] || null;
  },
  startSession: async (data:{course_offering_id:string;venue_id?:string;verification_method_override?:string;scheduled_at:string;duration_mins:number;notes?:string;session_number?:number}) => {
    const raw:any = await must(apiFetch(`${API_CONFIG.attendance}/sessions`,{method:"POST",body:JSON.stringify(data)}));
    return (await hydrateSessions([raw]))[0];
  },
  endSession: async (id:string) => {
    const raw:any = await must(apiFetch(`${API_CONFIG.attendance}/sessions/${id}/end`,{method:"POST"}));
    return (await hydrateSessions([raw]))[0] || null;
  },
  getSessionWindows: async (id:string) => must(apiFetch(`${API_CONFIG.attendance}/sessions/${id}/windows`)),
  getSessionLiveStatus: async (id:string) => must(apiFetch(`${API_CONFIG.attendance}/sessions/${id}/live`)),
  getAttendanceRecords: async (sessionId?:string, studentId?:string): Promise<AttendanceRecord[]> => {
    const p=new URLSearchParams(); if(sessionId)p.set("session_id",sessionId); if(studentId)p.set("student_id",studentId);
    const records:any[] = await must(apiFetch<any[]>(`${API_CONFIG.attendance}/attendance/records${p.toString()?`?${p}`:""}`));
    if(!records.length) return [];
    const students=await schedulingApi.getStudents().catch(()=>[] as Student[]); const sm=new Map(students.map(s=>[s.id,s]));
    return records.map(r=>({...r,student_name:sm.get(r.student_id)?.display_name||sm.get(r.student_id)?.full_name,student_index:sm.get(r.student_id)?.student_index_no,student_photo:sm.get(r.student_id)?.photo_url}));
  },
  getRecordById: async (id:string) => must(apiFetch<AttendanceRecord>(`${API_CONFIG.attendance}/attendance/records/${id}`)),
  overrideRecord: async (recordId:string, data:{status:string;override_reason:string}) => must(apiFetch<AttendanceRecord>(`${API_CONFIG.attendance}/attendance/records/${recordId}/override`,{method:"PATCH",body:JSON.stringify(data)})),
  getAttempts: async (recordId:string): Promise<AttendanceVerificationAttempt[]> => must(apiFetch<AttendanceVerificationAttempt[]>(`${API_CONFIG.attendance}/attendance/records/${recordId}/attempts`)),
  getActiveSessions: async () => hydrateSessions(await must(apiFetch<any[]>(`${API_CONFIG.attendance}/sessions?status=ongoing`))),
};
export const sessionsApi=attendanceApi;

export const reportsApi = {
  getOfferingReport: async (id:string): Promise<OfferingReport> => must(apiFetch(`${API_CONFIG.attendance}/reports/offerings/${id}`)),
  getOfferingTrends: async (id:string): Promise<TrendData> => must(apiFetch(`${API_CONFIG.attendance}/reports/offerings/${id}/trends`)),
  getWeeklyTrends: async (): Promise<WeeklyTrendItem[]> => must(apiFetch(`${API_CONFIG.attendance}/reports/trends/weekly`)),
  getRecentAttempts: async (offeringId?:string) => {const p=offeringId?`?offering_id=${encodeURIComponent(offeringId)}`:""; return must(apiFetch<AttendanceVerificationAttempt[]>(`${API_CONFIG.attendance}/attendance/attempts${p}`));},
  getStudentSummary: async (id:string) => must(apiFetch(`${API_CONFIG.attendance}/reports/students/${id}/summary`)),
  exportOffering: async (id:string) => {
    const {data,error,status}=await apiFetchText(`${API_CONFIG.attendance}/reports/offerings/${id}/export`);
    if(error) throw new Error(error);
    return {csv: data || "", status};
  },
};

export const alertsApi = {
  getAlerts: async ():Promise<SystemAlert[]> => must(apiFetch<SystemAlert[]>(`${API_CONFIG.attendance}/alerts`)),
  markAlertRead: async (id:string) => must(apiFetch<SystemAlert>(`${API_CONFIG.attendance}/alerts/${id}/read`,{method:"PATCH"})),
};

export const noticesApi = {
  getNotices: async ():Promise<Notice[]> => must(apiFetch<Notice[]>(`${API_CONFIG.attendance}/notifications/me`)),
  broadcastNotice: async (data:any):Promise<Notice> => must(apiFetch<Notice>(`${API_CONFIG.attendance}/notifications/broadcast`,{method:"POST",body:JSON.stringify(data)})),
  markRead: async (id:string) => must(apiFetch<Notice>(`${API_CONFIG.attendance}/notifications/${id}/read`,{method:"PATCH"})),
};

export const adminApi = {
  getStats: async ():Promise<AdminDashboardStats> => {
    const [base, sessions, alerts] = await Promise.all([
      must(apiFetch<any>(`${API_CONFIG.scheduling}/admin/stats`)),
      attendanceApi.getActiveSessions(),
      alertsApi.getAlerts(),
    ]);
    const health=await adminApi.getMicroservicesHealth().catch(()=>[] as MicroserviceStatus[]);
    const healthy=health.filter(h=>h.status==="healthy").length;
    return {...base, active_sessions_count:sessions.length, today_attendance_rate:0, flagged_proxies_today:alerts.filter(a=>!a.is_read).length, system_health_score:health.length?Math.round(healthy/health.length*100):0};
  },
  getUsers: schedulingApi.getUsers,
  getPendingUsers: schedulingApi.getPendingUsers,
  approveUser: schedulingApi.approveUser,
  rejectUser: schedulingApi.rejectUser,
  updateUserRole: async (id:string,data:any) => {
    await must(apiFetch(`${API_CONFIG.scheduling}/users/${id}/role`,{method:"PATCH",body:JSON.stringify(data)}));
    const fresh=await schedulingApi.getUsers();
    return fresh.find(u=>u.id===id)||null;
  },
  getDepartments: schedulingApi.getDepartments,
  createDepartment: async (data:any) => must(apiFetch<Department>(`${API_CONFIG.scheduling}/departments`,{method:"POST",body:JSON.stringify(data)})),
  getAcademicYears: schedulingApi.getAcademicYears,
  createAcademicYear: async (data:any) => {
    const level = Number(data.year_level ?? (String(data.year_code||data.name).match(/\d+/)?.[0] || 1));
    const raw:any = await must(apiFetch(`${API_CONFIG.scheduling}/academic-years`,{method:"POST",body:JSON.stringify({year_level:level,name:data.name})}));
    return {...raw,year_code:data.year_code||String(level),semester:data.semester||"",is_active:data.is_active??true};
  },
  getCourses: schedulingApi.getCourses,
  createCourse: async (data:any) => must(apiFetch<Course>(`${API_CONFIG.scheduling}/courses`,{method:"POST",body:JSON.stringify({course_code:data.course_code||data.code,name:data.name,credits:data.credits,department_id:data.department_id})})),
  getAllOfferings: schedulingApi.getAllOfferings,
  createOffering: async (data:any) => schedulingApi.getOfferingById((await must(apiFetch<any>(`${API_CONFIG.scheduling}/offerings`,{method:"POST",body:JSON.stringify({offering_code:data.offering_code,course_id:data.course_id,academic_year_id:data.academic_year_id,lecturer_id:data.lecturer_id,semester:data.semester,day:data.day,start_time:data.start_time,end_time:data.end_time,venue_id:data.venue_id,max_students:data.max_students,late_threshold_minutes:data.late_threshold_minutes,random_check_enabled:data.random_check_enabled,random_check_window_minutes:data.random_check_window_minutes??10})}))).id),
  getVenues: schedulingApi.getVenues,
  createVenue: async (data:any) => {
    const payload={...data,shape_type:data.shape_type === "square" ? "square" : (data.shape_type||"circle")};
    return must(apiFetch<Venue>(`${API_CONFIG.scheduling}/venues`,{method:"POST",body:JSON.stringify(payload)}));
  },
  updateVenue: async (id:string,data:any) => must(apiFetch<Venue>(`${API_CONFIG.scheduling}/venues/${id}`,{method:"PATCH",body:JSON.stringify(data)})),
  getEnrollments: async (offeringId:string):Promise<Enrollment[]> => {
    const [raw, students] = await Promise.all([must(apiFetch<any[]>(`${API_CONFIG.scheduling}/enrollments/offering/${offeringId}`)),schedulingApi.getStudents()]);
    const sm=new Map(students.map(s=>[s.id,s]));
    return (raw||[]).map((e:any)=>({...e,created_at:e.enrolled_at,student_name:sm.get(e.student_id)?.display_name||sm.get(e.student_id)?.full_name,student_index:sm.get(e.student_id)?.student_index_no,student_photo:sm.get(e.student_id)?.photo_url}));
  },
  enrollStudent: async (studentId:string,offeringId:string) => must(apiFetch<Enrollment>(`${API_CONFIG.scheduling}/enrollments`,{method:"POST",body:JSON.stringify({student_id:studentId,course_offering_id:offeringId})})),
  removeEnrollment: async (_offeringId:string,enrollmentId:string) => { if(enrollmentId.includes(":")){enrollmentId=enrollmentId.split(":").pop()!;} await must(apiFetch(`${API_CONFIG.scheduling}/enrollments/${enrollmentId}`,{method:"DELETE"})); return true;},
  getAuditLogs: async ():Promise<SystemAuditLog[]> => must(apiFetch<SystemAuditLog[]>(`${API_CONFIG.scheduling}/admin/audit-logs`)),
  getMicroservicesHealth: async ():Promise<MicroserviceStatus[]> => {
    const out:MicroserviceStatus[]=[];
    for (const [name,url,port] of [["Scheduling Service",API_CONFIG.scheduling,8001],["Attendance Service",API_CONFIG.attendance,8002]] as const) {
      const started=performance.now(); const r=await apiFetch<any>(`${url}/admin/health`); const latency=Math.round(performance.now()-started);
      out.push({name,port,status:r.error?"down":(r.data?.status||"healthy"),latency_ms:latency,endpoint:"/admin/health",version:"2.0.0"});
    }
    return out;
  },
  testSupabaseEdgeConnection: async () => { const start=performance.now(); const {error}=await supabase.auth.getSession(); return {status:error?"offline":"online",latency_ms:error?0:Math.round(performance.now()-start)} as any; },
};
