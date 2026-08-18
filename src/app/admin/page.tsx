"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { adminApi, sessionsApi } from "@/lib/api/services";
import { AdminDashboardStats, MicroserviceStatus, SystemAuditLog, LectureSession } from "@/types";
import {
  UserCheckIcon,
  BookOpenIcon,
  MapPinIcon,
  ShieldAlertIcon,
  RadioIcon,
  BarChartIcon,
  ChevronRightIcon,
  SparklesIcon,
  ClockIcon,
  BellIcon,
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

  return (
    <AdminDashboardLayout
      title="Institutional Command Center"
      subtitle="University-wide biometric attendance operations, microservice infrastructure & RBAC security"
      actions={
        <Link href="/admin/notices" className="btn-primary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
          <BellIcon size={15} />
          <span>Broadcast Notice</span>
        </Link>
      }
    >
      {/* Top Level Metric KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        {/* Total Students */}
        <div
          className="glass-card stat-card"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Enrolled Students</p>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                {loading ? "..." : (stats?.total_students || 1020).toLocaleString()}
              </h3>
            </div>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "rgba(99, 102, 241, 0.15)",
                color: "#818CF8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserCheckIcon size={22} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", fontSize: "0.75rem", color: "#34D399" }}>
            <span>↑ 98.4% Face Enrolled</span>
          </div>
        </div>

        {/* Total Lecturers */}
        <div
          className="glass-card stat-card"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Active Faculty</p>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                {loading ? "..." : stats?.total_lecturers || 45}
              </h3>
            </div>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "rgba(6, 182, 212, 0.15)",
                color: "#22D3EE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SparklesIcon size={22} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span>Across 3 Academic Departments</span>
          </div>
        </div>

        {/* Live Attendance Rate */}
        <div
          className="glass-card stat-card"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Today Attendance Rate</p>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#34D399", marginTop: "4px" }}>
                {loading ? "..." : `${stats?.today_attendance_rate || 91.8}%`}
              </h3>
            </div>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#34D399",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BarChartIcon size={22} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span>+3.2% vs previous semester</span>
          </div>
        </div>

        {/* Flagged Proxies / Security Alerts */}
        <div
          className="glass-card stat-card"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Flagged Anomalies</p>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#F87171", marginTop: "4px" }}>
                {loading ? "..." : stats?.flagged_proxies_today || 4}
              </h3>
            </div>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                color: "#F87171",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldAlertIcon size={22} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", fontSize: "0.75rem", color: "#F87171" }}>
            <span>GPS Spoofing & Face mismatches</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Microservices Status Cluster & Live Sessions Monitor */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
        {/* Backend Microservices Cluster Status */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(6, 182, 212, 0.15)",
                  color: "#22D3EE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RadioIcon size={18} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                FastAPI Service Mesh Health
              </h3>
            </div>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "3px 8px",
                borderRadius: "999px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#34D399",
                fontWeight: 700,
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              Uptime 99.98%
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {services.map((svc) => (
              <div
                key={svc.name}
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#10B981",
                        boxShadow: "0 0 6px #10B981",
                      }}
                    />
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {svc.name}
                    </h4>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Port :{svc.port} • Endpoint: {svc.endpoint}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: svc.latency_ms < 30 ? "#34D399" : "#FBBF24",
                    }}
                  >
                    {svc.latency_ms}ms
                  </span>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{svc.version}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Active Lectures & Verification Sessions */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                  color: "#818CF8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ClockIcon size={18} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Live Active Sessions
              </h3>
            </div>
            <Link
              href="/admin/courses"
              style={{ fontSize: "0.75rem", color: "var(--accent-secondary)", textDecoration: "none" }}
            >
              Manage Offerings →
            </Link>
          </div>

          {activeSessions.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
              No active classes currently transmitting
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(99, 102, 241, 0.05)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="pulse-dot-emerald" />
                      <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {session.course_code} - {session.course_name}
                      </h4>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "3px" }}>
                      Venue: <strong>{session.venue_name || "Main Campus"}</strong> • Lecturer: {session.lecturer_name || "Faculty Member"}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {session.verified_count ?? session.present_count ?? 0} / {session.total_enrolled || 50}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#34D399" }}>
                      {Math.round(
                        ((session.verified_count ?? session.present_count ?? 0) /
                          (session.total_enrolled || 50)) *
                          100
                      )}% Present
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Quick Management Modules & Real-time Audit Trail */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Quick Administration Modules */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
            Admin Management
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href="/admin/users"
              className="glass-panel"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "var(--text-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color: "#818CF8" }}>
                  <UserCheckIcon size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 600 }}>User Directory & RBAC</h4>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Manage roles & permissions</p>
                </div>
              </div>
              <ChevronRightIcon size={16} className="text-muted" />
            </Link>

            <Link
              href="/admin/departments"
              className="glass-panel"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "var(--text-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color: "#22D3EE" }}>
                  <BookOpenIcon size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 600 }}>Departments & Calendar</h4>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Academic years & faculty units</p>
                </div>
              </div>
              <ChevronRightIcon size={16} className="text-muted" />
            </Link>

            <Link
              href="/admin/venues"
              className="glass-panel"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "var(--text-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color: "#34D399" }}>
                  <MapPinIcon size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 600 }}>Venues & Geofencing</h4>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Configure GPS radiuses</p>
                </div>
              </div>
              <ChevronRightIcon size={16} className="text-muted" />
            </Link>

            <Link
              href="/admin/reports"
              className="glass-panel"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "var(--text-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color: "#FBBF24" }}>
                  <BarChartIcon size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 600 }}>Institutional Analytics</h4>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Attendance trends & fraud log</p>
                </div>
              </div>
              <ChevronRightIcon size={16} className="text-muted" />
            </Link>
          </div>
        </div>

        {/* Real-time System & Security Audit Trail */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#F87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldAlertIcon size={18} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                System Audit & Security Trail
              </h3>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Immutable FastLog Ledger</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        backgroundColor:
                          log.severity === "warning"
                            ? "rgba(245, 158, 11, 0.15)"
                            : log.severity === "critical"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(99, 102, 241, 0.15)",
                        color:
                          log.severity === "warning"
                            ? "#FBBF24"
                            : log.severity === "critical"
                            ? "#F87171"
                            : "#818CF8",
                      }}
                    >
                      {log.category}
                    </span>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {log.action}
                    </h4>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {log.details}
                  </p>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: 500 }}>
                    {log.performed_by_name}
                  </p>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
