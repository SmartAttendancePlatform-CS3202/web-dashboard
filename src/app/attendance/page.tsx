"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { OverrideModal } from "@/components/attendance/OverrideModal";
import { AttemptDrawer } from "@/components/attendance/AttemptDrawer";
import { attendanceApi, schedulingApi } from "@/lib/api/services";
import { CourseOffering, AttendanceRecord, LectureSession } from "@/types";
import {
  SearchIcon,
  DownloadIcon,
  EditIcon,
} from "@/components/ui/Icons";

export default function AttendanceHubPage() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get("session_id") || "sess-live-01";

  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [sessions, setSessions] = useState<LectureSession[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>("off-001");
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedRecordForOverride, setSelectedRecordForOverride] = useState<AttendanceRecord | null>(null);
  const [selectedRecordForDrawer, setSelectedRecordForDrawer] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [offs, sess] = await Promise.all([
          schedulingApi.getAllOfferings(),
          attendanceApi.getSessions(),
        ]);
        setOfferings(offs);
        setSessions(sess);

        const recs = await attendanceApi.getAttendanceRecords(selectedSessionId);
        setRecords(recs);
      } catch (err) {
        console.error("Failed to load attendance records:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [selectedSessionId]);

  const handleOverrideSuccess = (updatedRecord: AttendanceRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
  };

  const handleExportCSV = () => {
    const headers = ["Index No", "Full Name", "Status", "First Check-In", "Random AI Check", "Overridden", "Override Reason"];
    const rows = filteredRecords.map((r) => [
      r.student_index || "",
      r.student_name || "",
      r.status,
      r.first_check_in_at || "N/A",
      r.random_check_completed_at || "N/A",
      r.is_manually_overridden ? "YES" : "NO",
      r.override_reason || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_export_${selectedSessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      (r.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.student_index?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      title="Attendance Records & Overrides Hub"
      subtitle="Audit student verifications, review AI biometric checks, and log official manual overrides."
    >
      <div className="glass-card" style={{ padding: "24px" }}>
        {/* Filters Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Offering Selector */}
            <select
              className="input-control"
              style={{ width: "220px" }}
              value={selectedOfferingId}
              onChange={(e) => setSelectedOfferingId(e.target.value)}
            >
              {offerings.map((off) => (
                <option key={off.id} value={off.id} style={{ backgroundColor: "#111827" }}>
                  {off.course_code}: {off.course_name}
                </option>
              ))}
            </select>

            {/* Session Selector */}
            <select
              className="input-control"
              style={{ width: "200px" }}
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id} style={{ backgroundColor: "#111827" }}>
                  Session #{s.session_number} ({s.status.toUpperCase()})
                </option>
              ))}
            </select>

            {/* Status Filter Chips */}
            <div style={{ display: "flex", gap: "6px", backgroundColor: "rgba(255, 255, 255, 0.03)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              {["all", "present", "late", "flagged_proxy", "absent"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: statusFilter === st ? "rgba(99, 102, 241, 0.25)" : "transparent",
                    color: statusFilter === st ? "#818CF8" : "var(--text-secondary)",
                    fontWeight: statusFilter === st ? 700 : 500,
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Right Toolbar: Search & CSV Export */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ position: "relative", width: "220px" }}>
              <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                <SearchIcon size={14} />
              </div>
              <input
                type="text"
                className="input-control"
                placeholder="Filter index/name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "32px", fontSize: "0.8rem", padding: "8px 12px 8px 32px" }}
              />
            </div>

            <button type="button" className="btn-secondary" onClick={handleExportCSV} style={{ padding: "8px 12px", fontSize: "0.8rem" }}>
              <DownloadIcon size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Index No</th>
                <th>Status</th>
                <th>First Check-in</th>
                <th>Random AI Check</th>
                <th>Override Audit Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    Loading attendance records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const isFlagged = record.status === "flagged_proxy";
                  return (
                    <tr
                      key={record.id}
                      style={{
                        backgroundColor: isFlagged ? "rgba(236, 72, 153, 0.05)" : undefined,
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
                              backgroundColor: "#1E293B",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "#818CF8",
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
                          <div>
                            <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{record.student_name}</p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <code style={{ fontSize: "0.85rem", color: "#818CF8", fontWeight: 700 }}>
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

                      <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {record.random_check_completed_at
                          ? new Date(record.random_check_completed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </td>

                      <td>
                        {record.is_manually_overridden ? (
                          <div style={{ fontSize: "0.75rem", color: "#818CF8" }}>
                            <span style={{ fontWeight: 600 }}>🛡️ By {record.override_by_name || "Lecturer"}</span>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "2px" }}>
                              &quot;{record.override_reason}&quot;
                            </p>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Direct Mobile Check-in</span>
                        )}
                      </td>

                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecordForOverride(record);
                            }}
                          >
                            <EditIcon size={12} /> Override
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
