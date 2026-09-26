"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { adminApi, sessionsApi } from "@/lib/api/services";
import { AdminDashboardStats, MicroserviceStatus, SystemAuditLog, LectureSession } from "@/types";
import {
  UserCheckIcon,
  MapPinIcon,
  ShieldAlertIcon,
  BellIcon,
  ServerIcon,
  DownloadIcon,
  ClockIcon,
} from "@/components/ui/Icons";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [services, setServices] = useState<MicroserviceStatus[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [activeSessions, setActiveSessions] = useState<LectureSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, servicesData, auditData, activeSessionsData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getMicroservicesHealth(),
          adminApi.getAuditLogs(),
          sessionsApi.getActiveSessions(),
        ]);
        setStats(statsData);
        setServices(servicesData);
        setAuditLogs(auditData);
        setActiveSessions(activeSessionsData);
      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportLedger = async () => {
    try {
      const records = await sessionsApi.getAttendanceRecords();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const headers = "SessionID,StudentRegNo,TimestampUTC,Status\n";
      
      const rows = records.map(r => {
        return `${r.lecture_session_id},${r.student_index || r.student_id},${r.first_check_in_at || 'N/A'},${r.status}\n`;
      });
  
      const blob = new Blob([headers + rows.join("")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_export_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to export ledger", e);
    }
  };

  return (
    <AdminDashboardLayout
      title="Admin Dashboard"
      subtitle="Overview of university attendance and system status."
      actions={
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleExportLedger} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            <DownloadIcon size={16} />
            <span>Export Data</span>
          </button>
          <Link href="/admin/notices" className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            <BellIcon size={16} />
            <span>Broadcast Notice</span>
          </Link>
        </div>
      }
    >
      {loading ? (
        <div className="glass-card" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading dashboard data...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* 1. Key Metrics Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            
            <div className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ backgroundColor: "rgba(79, 70, 229, 0.1)", padding: "12px", borderRadius: "12px", color: "var(--accent-blue)" }}>
                <UserCheckIcon size={24} />
              </div>
              <div>
                <p className="micro-label">Total Students</p>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                  {stats?.total_students || 0}
                </h3>
              </div>
            </div>

            <div className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "12px", borderRadius: "12px", color: "#059669" }}>
                <MapPinIcon size={24} />
              </div>
              <div>
                <p className="micro-label">Active Lecturers</p>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                  {stats?.total_lecturers || 0}
                </h3>
              </div>
            </div>

            <div className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ backgroundColor: "rgba(217, 119, 6, 0.1)", padding: "12px", borderRadius: "12px", color: "#D97706" }}>
                <ServerIcon size={24} />
              </div>
              <div>
                <p className="micro-label">Total Courses</p>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                  {stats?.total_courses || 0}
                </h3>
              </div>
            </div>

            <div className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ backgroundColor: "rgba(225, 29, 72, 0.1)", padding: "12px", borderRadius: "12px", color: "#E11D48" }}>
                <ShieldAlertIcon size={24} />
              </div>
              <div>
                <p className="micro-label">Flagged Proxies</p>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                  {stats?.flagged_proxies_today || 0}
                </h3>
              </div>
            </div>
            
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
            
            {/* 2. Live Sessions List */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>Active Classes</h3>
              </div>
              <div style={{ padding: "24px", flex: 1 }}>
                {activeSessions.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
                    No classes are currently active.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {activeSessions.slice(0, 5).map((session) => (
                      <div key={session.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid var(--border-subtle)" }}>
                        <div>
                          <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>{session.course_code}: {session.course_name}</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>{session.venue_name} • {session.lecturer_name}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#059669", padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700 }}>
                          <span className="pulse-dot-emerald" style={{ width: "6px", height: "6px" }}></span> Active
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. System Status List */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>System Services</h3>
              </div>
              <div style={{ padding: "24px", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {services.map((svc, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <ServerIcon size={18} className="text-muted" />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{svc.name}</p>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{svc.endpoint}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: svc.status === "healthy" ? "#059669" : "#E11D48", backgroundColor: svc.status === "healthy" ? "rgba(5, 150, 105, 0.1)" : "rgba(225, 29, 72, 0.1)", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>
                          {svc.status}
                        </span>
                        {svc.latency_ms !== undefined && (
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{svc.latency_ms}ms</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
          </div>

          {/* 4. Recent Logs */}
          <div className="glass-card">
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>Recent Activity Logs</h3>
              <Link href="/admin/reports" style={{ fontSize: "0.85rem", color: "var(--accent-blue)", fontWeight: 600, textDecoration: "none" }}>
                View All Logs &rarr;
              </Link>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Timestamp</th>
                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>User</th>
                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Action</th>
                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <ClockIcon size={14} />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", fontWeight: 500, color: "var(--text-primary)" }}>
                        {log.performed_by_name || log.performed_by_id || "System"}
                      </td>
                      <td style={{ padding: "16px 24px", color: "var(--text-primary)" }}>
                        {log.action}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "4px 8px",
                            borderRadius: "4px",
                            textTransform: "uppercase",
                            backgroundColor: log.severity === "critical" ? "rgba(225, 29, 72, 0.1)" : log.severity === "warning" ? "rgba(217, 119, 6, 0.1)" : "rgba(79, 70, 229, 0.1)",
                            color: log.severity === "critical" ? "#E11D48" : log.severity === "warning" ? "#D97706" : "var(--accent-blue)",
                          }}
                        >
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                        No recent activity logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}
    </AdminDashboardLayout>
  );
}
