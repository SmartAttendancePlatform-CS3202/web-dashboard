"use client";

import React, { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { adminApi, reportsApi } from "@/lib/api/services";
import { Department, WeeklyTrendItem, AttendanceVerificationAttempt, CourseOffering, OfferingReport, Course, Student, Lecturer } from "@/types";
import {
  BarChartIcon,
  ShieldAlertIcon,
  DownloadIcon,
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

  useEffect(() => {
    async function loadData() {
      try {
        const [depts, trs, atts, offs, crs, studs, lecs] = await Promise.all([
          adminApi.getDepartments(),
          reportsApi.getWeeklyTrends(),
          reportsApi.getRecentAttempts(),
          adminApi.getAllOfferings(),
          adminApi.getCourses(),
          adminApi.getStudents(),
          adminApi.getLecturers(),
        ]);
        const reportResults = await Promise.all(offs.map((o) => reportsApi.getOfferingReport(o.id).catch(() => null)));
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

  const flaggedAttempts = attempts.filter((a) => a.is_flagged || a.status === "failed");

  return (
    <AdminDashboardLayout
      title="Institutional Analytics & Fraud Auditing"
      subtitle="Cross-faculty attendance compliance, biometric threshold analytics, and AI spoofing detection logs"
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
          <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#818CF8", marginTop: "4px" }}>{averageFaceMatch.toFixed(1)}%</h3>
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
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Flagged Proxy Anomalies</p>
          <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#F87171", marginTop: "4px" }}>{flaggedCount} Intercepted</h3>
          <p style={{ fontSize: "0.75rem", color: "#F87171", marginTop: "6px" }}>
            100% prevented from illicit sign-in
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
                Faculty Department Compliance
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
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
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
            <span style={{ fontSize: "0.72rem", color: "#F87171", fontWeight: 700 }}>Live Feed</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {flaggedAttempts.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                No fraudulent attempts recorded today
              </div>
            ) : (
              flaggedAttempts.map((attempt) => (
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
                backgroundColor: "rgba(255, 255, 255, 0.02)",
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
    </AdminDashboardLayout>
  );
}
