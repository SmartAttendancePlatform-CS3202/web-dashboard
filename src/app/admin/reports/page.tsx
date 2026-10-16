"use client";

import React, { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { adminApi, reportsApi, schedulingApi } from "@/lib/api/services";
import { Department, WeeklyTrendItem, AttendanceVerificationAttempt, CourseOffering, OfferingReport, Course, Student, Lecturer } from "@/types";
import {
  BarChartIcon,
  ShieldAlertIcon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/ui/Icons";

export default function AdminReportsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [trends, setTrends] = useState<WeeklyTrendItem[]>([]);
  const [attempts, setAttempts] = useState<AttendanceVerificationAttempt[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [offeringReports, setOfferingReports] = useState<OfferingReport[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);

  // Pagination states
  const [fraudPage, setFraudPage] = useState(1);
  const [atRiskPage, setAtRiskPage] = useState(1);
  const [geoPage, setGeoPage] = useState(1);
  const [coursePage, setCoursePage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    async function loadData() {
      try {
        const [depts, trs, atts, offs, crs, studs, lecs] = await Promise.all([
          adminApi.getDepartments(),
          reportsApi.getWeeklyTrends(),
          reportsApi.getRecentAttempts(),
          adminApi.getAllOfferings(),
          adminApi.getCourses(),
          schedulingApi.getStudents(),
          schedulingApi.getLecturers(),
        ]);
        const reportResults = await reportsApi.getAllOfferingReports().catch(() => []);
        setDepartments(depts);
        setTrends(trs);
        setAttempts(atts);
        setOfferings(offs);
        setOfferingReports(reportResults.filter(Boolean) as OfferingReport[]);
        setCourses(crs);
        setStudents(studs);
        setLecturers(lecs);
      } catch (err) {
        console.error("Error loading institutional reports:", err);
      }
    }
    loadData();
  }, []);

  const averageAttendance = offeringReports.length ? offeringReports.reduce((sum, r) => sum + r.attendance_percentage, 0) / offeringReports.length : 0;
  const confidenceAttempts = attempts.filter((a) => typeof a.face_match_confidence === "number");
  const averageFaceMatch = confidenceAttempts.length ? (confidenceAttempts.reduce((sum, a) => sum + Number(a.face_match_confidence || 0), 0) / confidenceAttempts.length) * 100 : 0;
  const locationAttempts = attempts.filter((a) => a.used_location_check);
  const geofenceCompliance = locationAttempts.length ? (locationAttempts.filter((a) => a.status === "success").length / locationAttempts.length) * 100 : 0;
  const flaggedCount = attempts.filter((a) => a.is_flagged || a.status === "failed").length;

  const departmentStats = departments.map((dept) => {
    const departmentCourseIds = new Set(courses.filter((c) => c.department_id === dept.id).map((c) => c.id));
    const deptOfferingIds = new Set(offerings.filter((o) => departmentCourseIds.has(o.course_id)).map((o) => o.id));
    const deptReports = offeringReports.filter((r) => deptOfferingIds.has(r.course_offering_id));
    const deptAttendance = deptReports.length ? deptReports.reduce((sum, r) => sum + r.attendance_percentage, 0) / deptReports.length : 0;
    return {
      ...dept,
      rate: deptAttendance,
      studentCount: students.filter((st) => st.department_id === dept.id).length,
      lecturerCount: lecturers.filter((l) => l.department_id === dept.id).length,
      courseCount: departmentCourseIds.size,
    };
  });

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Department,Code,Attendance Rate,Students,Lecturers,Courses"]
        .concat(
          departmentStats.map(
            (d) => `${d.name},${d.code},${d.rate.toFixed(2)}%,${d.studentCount},${d.lecturerCount},${d.courseCount}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `university_attendance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // flaggedAttempts removed

  // Calculate At-Risk Students
  const atRiskStudentsMap = new Map<string, {name: string, index: string, totalAbsences: number, courses: Set<string>}>();
  offeringReports.forEach(report => {
    report.absentee_list?.forEach(absentee => {
       if (!atRiskStudentsMap.has(absentee.student_id)) {
          atRiskStudentsMap.set(absentee.student_id, {
             name: absentee.student_name || 'Unknown',
             index: absentee.student_index || 'N/A',
             totalAbsences: 0,
             courses: new Set()
          });
       }
       const st = atRiskStudentsMap.get(absentee.student_id)!;
       st.totalAbsences += (absentee.consecutive_absences || 1);
       st.courses.add(report.course_code || report.course_offering_id);
    });
  });
  const atRiskStudentsFull = Array.from(atRiskStudentsMap.values())
    .sort((a, b) => b.totalAbsences - a.totalAbsences);
  
  const atRiskStudents = atRiskStudentsFull.slice((atRiskPage - 1) * PAGE_SIZE, atRiskPage * PAGE_SIZE);
  const totalAtRiskPages = Math.ceil(atRiskStudentsFull.length / PAGE_SIZE) || 1;

  // Calculate Location Issues
  const locationIssuesFull = attempts
    .filter((a) => a.used_location_check && a.status === "failed");
    
  const locationIssues = locationIssuesFull.slice((geoPage - 1) * PAGE_SIZE, geoPage * PAGE_SIZE);
  const totalGeoPages = Math.ceil(locationIssuesFull.length / PAGE_SIZE) || 1;

  const flaggedAttemptsFull = attempts.filter((a) => a.is_flagged || a.status === "failed");
  const flaggedAttemptsPaginated = flaggedAttemptsFull.slice((fraudPage - 1) * PAGE_SIZE, fraudPage * PAGE_SIZE);
  const totalFraudPages = Math.ceil(flaggedAttemptsFull.length / PAGE_SIZE) || 1;

  const offeringReportsPaginated = offeringReports.slice((coursePage - 1) * PAGE_SIZE, coursePage * PAGE_SIZE);
  const totalCoursePages = Math.ceil(offeringReports.length / PAGE_SIZE) || 1;

  const renderPagination = (current: number, total: number, setPage: (p: number) => void) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
      <button 
        onClick={() => setPage(Math.max(1, current - 1))} 
        disabled={current === 1}
        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon size={14} />
      </button>
      <span className="font-mono">{current} / {total}</span>
      <button 
        onClick={() => setPage(Math.min(total, current + 1))} 
        disabled={current === total}
        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRightIcon size={14} />
      </button>
    </div>
  );

  return (
    <AdminDashboardLayout
      title="Analytics & Reports"
      subtitle="Comprehensive view of university-wide attendance, metrics, and security."
      actions={
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleExportCSV} className="btn-secondary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
            <DownloadIcon size={14} />
            <span>Export CSV Dataset</span>
          </button>
          <button onClick={() => window.print()} className="btn-primary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
            <span>Print Executive Brief</span>
          </button>
        </div>
      }
    >
      {/* Top Level Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <div className="glass-card" style={{ padding: "20px" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>University Average Attendance</p>
          <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#34D399", marginTop: "4px" }}>{averageAttendance.toFixed(1)}%</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "6px" }}>
            Target benchmark: 80.0% statutory minimum
          </p>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Face Match Verification Avg</p>
          <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-blue)", marginTop: "4px" }}>{averageFaceMatch.toFixed(1)}%</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "6px" }}>
            AI Confidence threshold: &gt; 85%
          </p>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Geofence Compliance</p>
          <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#22D3EE", marginTop: "4px" }}>{geofenceCompliance.toFixed(1)}%</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "6px" }}>
            Within configured 35m perimeter
          </p>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Proxy Alerts</p>
          <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#F87171", marginTop: "4px" }}>{flaggedCount} Intercepted</h3>
          <p style={{ fontSize: "0.75rem", color: "#F87171", marginTop: "6px" }}>
            100% prevented from illicit sign-in
          </p>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>At-Risk Students</p>
          <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#F59E0B", marginTop: "4px" }}>{atRiskStudents.length} Flagged</h3>
          <p style={{ fontSize: "0.75rem", color: "#F59E0B", marginTop: "6px" }}>
            Require intervention / counseling
          </p>
        </div>
      </div>

      {/* Main Grid: Department Attendance Breakdown & Suspicious Proxy Incidents */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", marginBottom: "28px" }}>
        {/* Department Compliance Breakdown */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BarChartIcon size={18} className="text-cyan" />
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Department Compliance
              </h3>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current Semester</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {departmentStats.map((dept) => {
              const rate = dept.rate;
              return (
                <div key={dept.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                        {dept.name}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "8px" }}>
                        ({dept.code})
                      </span>
                    </div>
                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: rate >= 90 ? "#34D399" : "#FBBF24" }}>
                      {rate.toFixed(1)}%
                    </span>
                  </div>

                  <div
                    style={{
                      height: "8px",
                      borderRadius: "999px",
                      backgroundColor: "var(--bg-surface)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${rate}%`,
                        borderRadius: "999px",
                        background:
                          rate >= 90
                            ? "linear-gradient(90deg, #10B981 0%, #34D399 100%)"
                            : "linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suspicious Proxy & Geofence Incident Feed */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldAlertIcon size={18} className="text-red" />
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                AI Fraud Detection Intercepts
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <span style={{ fontSize: "0.72rem", color: "#F87171", fontWeight: 700 }}>Live Feed</span>
              {renderPagination(fraudPage, totalFraudPages, setFraudPage)}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {flaggedAttemptsFull.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                No fraudulent attempts recorded today
              </div>
            ) : (
              flaggedAttemptsPaginated.map((attempt) => (
                <div
                  key={attempt.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(239, 68, 68, 0.06)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                          color: "#F87171",
                        }}
                      >
                        {attempt.failure_reason?.includes("face") ? "Face Mismatch" : "Geofence Violation"}
                      </span>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {attempt.student_name}
                      </h4>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {attempt.failure_reason || "Attempted verification failed security checks"}
                    </p>
                    <div style={{ display: "flex", gap: "12px", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      <span>Match Confidence: <strong>{attempt.face_match_confidence ?? 0}%</strong></span>
                      <span>Distance: <strong>{attempt.distance_from_venue_meters ?? attempt.distance_from_venue_m ?? 0}m</strong></span>
                    </div>
                  </div>

                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", flexShrink: 0 }}>
                    {new Date(attempt.attempted_at || attempt.attempt_timestamp || new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Weekly Trend Rollup */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Campus-wide 5-Week Attendance Trend
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          {trends.map((t) => (
            <div
              key={t.week}
              style={{
                padding: "16px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                {t.week}
              </span>
              <h4 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#22D3EE", margin: "6px 0" }}>
                {t.attendance_rate}%
              </h4>
              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                {t.total_students} verifications
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "28px" }}>
        {/* At-Risk Students Report */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
              At-Risk Students (High Absenteeism)
            </h3>
            {renderPagination(atRiskPage, totalAtRiskPages, setAtRiskPage)}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "10px 4px", fontWeight: 600 }}>Student</th>
                  <th style={{ padding: "10px 4px", fontWeight: 600 }}>Index</th>
                  <th style={{ padding: "10px 4px", fontWeight: 600 }}>Missed Sessions</th>
                  <th style={{ padding: "10px 4px", fontWeight: 600 }}>Flagged Courses</th>
                </tr>
              </thead>
              <tbody>
                {atRiskStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                      No students currently flagged as at-risk.
                    </td>
                  </tr>
                ) : atRiskStudents.map((st, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "10px 4px", fontWeight: 600, color: "var(--text-primary)" }}>{st.name}</td>
                    <td style={{ padding: "10px 4px", fontFamily: "monospace", color: "var(--text-secondary)" }}>{st.index}</td>
                    <td style={{ padding: "10px 4px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#F87171", fontWeight: 700 }}>
                        {st.totalAbsences} missed
                      </span>
                    </td>
                    <td style={{ padding: "10px 4px", color: "var(--text-secondary)" }}>
                      {Array.from(st.courses).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Location & Geofence Diagnostics */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Geofence Verification Diagnostics
            </h3>
            <div className="flex items-center gap-4">
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Recent Failures</span>
              {renderPagination(geoPage, totalGeoPages, setGeoPage)}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "10px 4px", fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: "10px 4px", fontWeight: 600 }}>Student ID</th>
                  <th style={{ padding: "10px 4px", fontWeight: 600 }}>Recorded Distance</th>
                  <th style={{ padding: "10px 4px", fontWeight: 600 }}>Diagnostic</th>
                </tr>
              </thead>
              <tbody>
                {locationIssues.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                      No recent geofence failures detected.
                    </td>
                  </tr>
                ) : locationIssues.map((issue) => (
                  <tr key={issue.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "10px 4px", color: "var(--text-secondary)" }}>
                      {new Date(issue.attempted_at || issue.attempt_timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: "10px 4px", color: "var(--text-primary)", fontWeight: 500 }}>
                      {issue.student_index || "Unknown"}
                    </td>
                    <td style={{ padding: "10px 4px", fontFamily: "monospace", color: "#FBBF24" }}>
                      {issue.distance_from_venue_meters ?? issue.distance_from_venue_m ?? "N/A"}m away
                    </td>
                    <td style={{ padding: "10px 4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Out of bounds
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Course Attendance Reports */}
      <div className="glass-card" style={{ padding: "24px", marginTop: "28px" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Course & Venue Attendance Analytics
          </h3>
          {renderPagination(coursePage, totalCoursePages, setCoursePage)}
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                <th style={{ padding: "12px", fontWeight: 600 }}>Course / Module</th>
                <th style={{ padding: "12px", fontWeight: 600 }}>Lecturer</th>
                <th style={{ padding: "12px", fontWeight: 600 }}>Venue</th>
                <th style={{ padding: "12px", fontWeight: 600 }}>Sessions</th>
                <th style={{ padding: "12px", fontWeight: 600 }}>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              {offeringReports.length === 0 ? (
                 <tr>
                   <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                     No course reports available
                   </td>
                 </tr>
              ) : offeringReportsPaginated.map((report) => (
                <tr key={report.course_offering_id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {report.course_code || report.course_offering_id}
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                    {offerings.find(o => o.id === report.course_offering_id)?.lecturer_name || "N/A"}
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                    {offerings.find(o => o.id === report.course_offering_id)?.venue_name || "N/A"}
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-primary)" }}>
                    {report.total_sessions}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ fontWeight: 700, color: report.attendance_percentage >= 80 ? "#34D399" : report.attendance_percentage >= 60 ? "#FBBF24" : "#F87171" }}>
                      {report.attendance_percentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
