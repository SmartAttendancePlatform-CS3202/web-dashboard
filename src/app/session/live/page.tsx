"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { OverrideModal } from "@/components/attendance/OverrideModal";
import { AttemptDrawer } from "@/components/attendance/AttemptDrawer";
import { attendanceApi } from "@/lib/api/services";
import { LectureSession, AttendanceRecord } from "@/types";
import {
  RadioIcon,
  StopCircleIcon,
  RefreshCwIcon,
  ClockIcon,
  MapPinIcon,
  ScanFaceIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from "@/components/ui/Icons";

function LiveSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "sess-live-01";

  const [session, setSession] = useState<LectureSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isStreamPaused, setIsStreamPaused] = useState<boolean>(false);
  const [selectedRecordForOverride, setSelectedRecordForOverride] = useState<AttendanceRecord | null>(null);
  const [selectedRecordForDrawer, setSelectedRecordForDrawer] = useState<AttendanceRecord | null>(null);
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Poll for real-time live session updates every 3 seconds
  useEffect(() => {
    async function fetchLiveData() {
      try {
        const [sess, recs] = await Promise.all([
          attendanceApi.getSessionById(sessionId),
          attendanceApi.getAttendanceRecords(sessionId),
        ]);
        if (sess) setSession(sess);
        if (recs) setRecords(recs);
      } catch (err) {
        console.error("Live polling error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveData();

    if (!isStreamPaused) {
      const interval = setInterval(fetchLiveData, 3000);
      return () => clearInterval(interval);
    }
  }, [sessionId, isStreamPaused]);

  const handleEndSession = async () => {
    if (!confirm("Are you sure you want to end this live attendance session? Windows will close permanently.")) {
      return;
    }
    setIsEnding(true);
    try {
      await attendanceApi.endSession(sessionId);
      router.push(`/attendance?session_id=${sessionId}`);
    } catch (err) {
      console.error("Failed to end session:", err);
      setIsEnding(false);
    }
  };

  const handleOverrideSuccess = (updatedRecord: AttendanceRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
  };

  const totalEnrolled = session?.total_enrolled || 58;
  const presentCount = records.filter((r) => r.status === "present").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const flaggedCount = records.filter((r) => r.status === "flagged_proxy").length;
  const absentCount = totalEnrolled - (presentCount + lateCount + flaggedCount);
  const attendanceRate = totalEnrolled > 0 ? ((presentCount + lateCount) / totalEnrolled) * 100 : 0;

  return (
    <DashboardLayout
      title={session ? `Live Session: ${session.course_code} - ${session.course_name}` : "Live Command Center"}
      subtitle="Real-time check-in stream, active verification windows, and AI biometric matching feed."
    >
      {/* Top Command Bar */}
      <div
        className="glass-card"
        style={{
          padding: "20px 24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          borderColor: "rgba(225, 29, 72, 0.25)",
          background: "linear-gradient(135deg, rgba(225, 29, 72, 0.04) 0%, #FFFFFF 100%)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "rgba(225, 29, 72, 0.08)",
              border: "1px solid rgba(225, 29, 72, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#E11D48",
            }}
          >
            <RadioIcon size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="pulse-dot-live" />
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#E11D48", letterSpacing: "0.02em" }}>
                LIVE ATTENDANCE STREAM ACTIVE
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                • Polling every 3s
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Venue: <strong style={{ color: "var(--text-primary)" }}>{session?.venue_name || "Auditorium Hall A"}</strong> • Session #{session?.session_number || 7}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsStreamPaused(!isStreamPaused)}
            style={{
              borderColor: isStreamPaused ? "rgba(217, 119, 6, 0.4)" : "var(--border-subtle)",
              color: isStreamPaused ? "#D97706" : "var(--text-primary)",
              backgroundColor: isStreamPaused ? "rgba(217, 119, 6, 0.06)" : "#FFFFFF",
            }}
          >
            {isStreamPaused ? "▶ Resume Stream" : "⏸ Pause Stream"}
          </button>

          <button
            type="button"
            className="btn-danger"
            onClick={handleEndSession}
            disabled={isEnding}
          >
            <StopCircleIcon size={16} />
            <span>{isEnding ? "Ending..." : "End Session"}</span>
          </button>
        </div>
      </div>

      {/* Verification Windows & Live Gauges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        {/* First Check-In Window Card */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPinIcon size={18} style={{ color: "var(--accent-cyan)" }} />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Window 1: GPS Geofence Check-in
              </h4>
            </div>
            <span
              style={{
                fontSize: "0.72rem",
                color: "#059669",
                fontWeight: 700,
                backgroundColor: "rgba(5, 150, 105, 0.08)",
                border: "1px solid rgba(5, 150, 105, 0.2)",
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
              }}
            >
              COMPLETED
            </span>
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <p>Window: 09:00 - 09:15 AM (15 mins)</p>
            <p>Verification Method: <strong style={{ color: "var(--text-primary)" }}>GPS Geofence (35m radius)</strong></p>
            <p style={{ color: "#059669", fontWeight: 600 }}>53 / 58 Students checked in during window</p>
          </div>
        </div>

        {/* Random AI Face Verification Window Card */}
        <div
          className="glass-card"
          style={{
            padding: "20px",
            borderColor: "rgba(79, 70, 229, 0.3)",
            background: "linear-gradient(135deg, rgba(79, 70, 229, 0.04) 0%, #FFFFFF 100%)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ScanFaceIcon size={18} style={{ color: "var(--accent-primary)" }} />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Window 2: AI Face Biometric Check
              </h4>
            </div>
            <span
              style={{
                fontSize: "0.72rem",
                color: "#D97706",
                fontWeight: 700,
                backgroundColor: "rgba(217, 119, 6, 0.08)",
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(217, 119, 6, 0.25)",
              }}
            >
              ACTIVE NOW
            </span>
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <p>Prompting random face match on mobile devices</p>
            <p>Required Match Confidence: <strong style={{ color: "var(--text-primary)" }}>85.0%</strong></p>
            <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-primary)", fontWeight: 600 }}>
              <ClockIcon size={14} />
              <span>Closes in approx. 6 minutes</span>
            </div>
          </div>
        </div>

        {/* Live Attendance Rate Meter */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Live Attendance Rate
              </h4>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: attendanceRate >= 80 ? "#059669" : "#E11D48" }}>
                {attendanceRate.toFixed(1)}%
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div style={{ width: "100%", height: "8px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden", display: "flex", margin: "8px 0" }}>
              <div style={{ width: `${(presentCount / totalEnrolled) * 100}%`, backgroundColor: "#059669" }} title="Present" />
              <div style={{ width: `${(lateCount / totalEnrolled) * 100}%`, backgroundColor: "#D97706" }} title="Late" />
              <div style={{ width: `${(flaggedCount / totalEnrolled) * 100}%`, backgroundColor: "#BE185D" }} title="Flagged" />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span style={{ color: "#059669", fontWeight: 600 }}>● Present: {presentCount}</span>
            <span style={{ color: "#D97706", fontWeight: 600 }}>● Late: {lateCount}</span>
            <span style={{ color: "#BE185D", fontWeight: 600 }}>● Flagged: {flaggedCount}</span>
            <span style={{ color: "#64748B", fontWeight: 600 }}>● Absent: {absentCount}</span>
          </div>
        </div>
      </div>

      {/* Live Stream Table */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Live Student Check-In Stream ({records.length} Records)
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Click any student row to view forensic GPS distance, WiFi SSID match, and AI Face confidence scores.
            </p>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => attendanceApi.getAttendanceRecords(sessionId).then(setRecords)}
            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
          >
            <RefreshCwIcon size={14} /> Refresh
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Index No</th>
                <th>Status</th>
                <th>Check-In Time</th>
                <th>AI Biometric / Proxy Diagnostics</th>
                <th>Override History</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    Connecting to live classroom stream...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No check-in records recorded for this session yet.
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const isFlagged = record.status === "flagged_proxy";
                  return (
                    <tr
                      key={record.id}
                      style={{
                        backgroundColor: isFlagged ? "rgba(190, 24, 93, 0.05)" : undefined,
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedRecordForDrawer(record)}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(79, 70, 229, 0.08)",
                              border: "1px solid rgba(79, 70, 229, 0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "var(--accent-primary)",
                              overflow: "hidden",
                            }}
                          >
                            {record.student_photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={record.student_photo} alt={record.student_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              record.student_name?.charAt(0) || "S"
                            )}
                          </div>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {record.student_name}
                        </span>
                      </div>
                    </td>

                    <td>
                      <code style={{ fontSize: "0.85rem", color: "var(--accent-primary)", fontWeight: 700 }}>
                        {record.student_index}
                      </code>
                    </td>

                    <td>
                      <Badge type="attendance" value={record.status} size="sm" />
                    </td>

                    <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {record.first_check_in_at
                        ? new Date(record.first_check_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>

                    <td>
                      {isFlagged ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#BE185D", fontSize: "0.75rem", fontWeight: 600 }}>
                          <AlertTriangleIcon size={14} />
                          <span>AI Face & GPS Discrepancy Flagged</span>
                        </div>
                      ) : record.status === "present" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontSize: "0.75rem" }}>
                          <CheckCircleIcon size={14} />
                          <span>Verified (Geofence + Biometric)</span>
                        </div>
                      ) : record.status === "late" ? (
                        <span style={{ color: "#D97706", fontSize: "0.75rem" }}>Checked in after 10m threshold</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Not checked in yet</span>
                      )}
                    </td>

                    <td>
                      {record.is_manually_overridden ? (
                        <div style={{ fontSize: "0.75rem", color: "var(--accent-primary)" }}>
                          <span>🛡️ {record.override_by_name || "Lecturer"}</span>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>{record.override_reason}</p>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>System Verified</span>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecordForOverride(record);
                        }}
                      >
                        Override
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Diagnostics Drawer */}
      <AttemptDrawer
        record={selectedRecordForDrawer}
        isOpen={!!selectedRecordForDrawer}
        onClose={() => setSelectedRecordForDrawer(null)}
        onOpenOverride={(rec) => setSelectedRecordForOverride(rec)}
      />

      {/* Manual Override Modal */}
      <OverrideModal
        record={selectedRecordForOverride}
        isOpen={!!selectedRecordForOverride}
        onClose={() => setSelectedRecordForOverride(null)}
        onSuccess={handleOverrideSuccess}
      />
    </DashboardLayout>
  );
}

export default function LiveSessionPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: "40px", color: "var(--text-muted)", textAlign: "center" }}>Connecting to live session stream...</div>}>
      <LiveSessionContent />
    </React.Suspense>
  );
}
