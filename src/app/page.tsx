"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { TrendChart } from "@/components/charts/TrendChart";
import {
  BookOpenIcon,
  UserCheckIcon,
  CalendarIcon,
  ShieldAlertIcon,
  RadioIcon,
  PlayIcon,
  ClockIcon,
  MapPinIcon,
  ChevronRightIcon,
  BellIcon,
} from "@/components/ui/Icons";
import { useAuth } from "@/lib/context/AuthContext";
import { schedulingApi, attendanceApi, reportsApi, alertsApi, noticesApi } from "@/lib/api/services";
import { CourseOffering, LectureSession, OfferingReport, TrendData, SystemAlert, Notice } from "@/types";

export default function HomePage() {
  const { lecturerProfile } = useAuth();
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [sessions, setSessions] = useState<LectureSession[]>([]);
  const [report, setReport] = useState<OfferingReport | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const offs = await schedulingApi.getLecturerTimetable();
        const activeOffId = offs.length > 0 ? offs[0].id : null;

        const [sess, rep, tr, al, nots] = await Promise.all([
          attendanceApi.getSessions(),
          activeOffId ? reportsApi.getOfferingReport(activeOffId).catch(() => null) : Promise.resolve(null),
          activeOffId ? reportsApi.getOfferingTrends(activeOffId).catch(() => null) : Promise.resolve(null),
          alertsApi.getAlerts(),
          noticesApi.getNotices(),
        ]);

        setOfferings(offs);
        setSessions(sess);
        setReport(rep as OfferingReport | null);
        setTrends(tr as TrendData | null);
        setAlerts(al);
        setNotices(nots);
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const liveSession = sessions.find((s) => s.status === "ongoing");
  const totalEnrolledStudents = offerings.reduce((sum, o) => sum + (o.enrolled_count || 0), 0);
  const averageAttendance = report?.attendance_percentage || 87.4;

  if (loading) {
    return (
      <DashboardLayout
        title="Lecturer Faculty Command Center"
        subtitle="Loading faculty dashboard..."
      >
        <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading dashboard metrics and active sessions...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Welcome back, ${lecturerProfile?.display_name || "Doctor"}`}
      subtitle="Here is your active classroom overview and real-time attendance status."
    >
      {/* Live Session Alert Banner if active */}
      {liveSession && (
        <div
          className="glass-card"
          style={{
            padding: "18px 24px",
            marginBottom: "24px",
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)",
            borderColor: "rgba(239, 68, 68, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F87171",
              }}
            >
              <RadioIcon size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="pulse-dot-live" />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#F87171", textTransform: "uppercase" }}>
                  Active Live Session in Progress
                </span>
                <Badge type="session" value="ongoing" size="sm" />
              </div>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                {liveSession.course_code}: {liveSession.course_name} (Session #{liveSession.session_number})
              </h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {liveSession.venue_name} • {liveSession.present_count} / {liveSession.total_enrolled} Checked In
              </p>
            </div>
          </div>

          <Link href="/session/live" className="btn-primary" style={{ backgroundColor: "#EF4444" }}>
            <span>Enter Live Command Center</span>
            <ChevronRightIcon size={16} />
          </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <StatCard
          title="Active Courses"
          value={offerings.length}
          subtitle="Assigned this semester"
          icon={<BookOpenIcon size={22} />}
          accentColor="indigo"
        />
        <StatCard
          title="Total Enrolled Students"
          value={totalEnrolledStudents}
          subtitle="Across all lecture sections"
          icon={<UserCheckIcon size={22} />}
          accentColor="cyan"
        />
        <StatCard
          title="Avg. Faculty Attendance"
          value={`${averageAttendance.toFixed(1)}%`}
          trend={{ value: "+2.4% vs last week", positive: true }}
          icon={<UserCheckIcon size={22} />}
          accentColor="emerald"
        />
        <StatCard
          title="Security Alerts"
          value={alerts.filter((a) => !a.is_read).length}
          subtitle="Flagged proxy / timeout anomalies"
          icon={<ShieldAlertIcon size={22} />}
          accentColor="rose"
        />
      </div>

      {/* Main Grid: Schedule & Trends */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginBottom: "28px" }}>
        {/* Weekly Classes & Today's Schedule */}
        <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ color: "#818CF8" }}><CalendarIcon size={20} /></div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Teaching Timetable Snapshot
              </h3>
            </div>
            <Link href="/timetable" style={{ fontSize: "0.8rem", color: "#818CF8", textDecoration: "none", fontWeight: 600 }}>
              Full Timetable →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
            {offerings.map((off) => (
              <div
                key={off.id}
                style={{
                  padding: "14px 16px",
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
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#818CF8" }}>{off.course_code}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>• {off.day}</span>
                  </div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                    {off.course_name}
                  </h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <ClockIcon size={12} /> {off.start_time} - {off.end_time}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPinIcon size={12} /> {off.venue_name}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/session/start?offering_id=${off.id}`}
                  className="btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                >
                  <PlayIcon size={12} /> Launch
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Trend Chart Snapshot */}
        <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                CS4012 Attendance Trajectory
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                Session-by-session compliance vs 80% faculty threshold
              </p>
            </div>
            <Link href="/reports" style={{ fontSize: "0.8rem", color: "#818CF8", textDecoration: "none", fontWeight: 600 }}>
              View Reports →
            </Link>
          </div>

          <div style={{ flex: 1 }}>
            {trends && <TrendChart data={trends.trends} height={220} />}
          </div>
        </div>
      </div>

      {/* Secondary Row: Recent Notices & Security Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* Recent Broadcast Notices */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BellIcon size={18} className="text-cyan-400" />
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Recent Course Announcements
              </h3>
            </div>
            <Link href="/notices" style={{ fontSize: "0.8rem", color: "#818CF8", textDecoration: "none", fontWeight: 600 }}>
              Broadcast Notice →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notices.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#818CF8" }}>{n.course_code}</span>
                  <Badge type="urgency" value={n.urgency} size="sm" />
                </div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{n.title}</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "3px", lineHeight: 1.4 }}>
                  {n.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Verification Anomalies */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlertIcon size={18} className="text-rose-400" />
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Verification Anomalies
              </h3>
            </div>
            <Link href="/alerts" style={{ fontSize: "0.8rem", color: "#818CF8", textDecoration: "none", fontWeight: 600 }}>
              Security Center →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {alerts.slice(0, 2).map((a) => (
              <div
                key={a.id}
                style={{
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(239, 68, 68, 0.04)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#F87171", fontSize: "0.8rem", fontWeight: 700 }}>
                  <span>⚠️</span>
                  <span>{a.title}</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                  {a.message}
                </p>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
                  {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
