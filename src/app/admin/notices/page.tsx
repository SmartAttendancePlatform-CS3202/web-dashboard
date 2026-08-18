"use client";

import React, { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { noticesApi, adminApi } from "@/lib/api/services";
import { Notice, CourseOffering } from "@/types";
import {
  BellIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@/components/ui/Icons";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [targetScope, setTargetScope] = useState("all_university");
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [noticesData, offs] = await Promise.all([
          noticesApi.getNotices(),
          adminApi.getAllOfferings(),
        ]);
        setNotices(noticesData);
        setOfferings(offs);
        if (offs.length > 0) setSelectedOfferingId(offs[0].id);
      } catch (err) {
        console.error("Error loading notices:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const targetOffering = targetScope === "specific_offering" ? selectedOfferingId : undefined;
      const targetRoles =
        targetScope === "all_students"
          ? ["student"]
          : targetScope === "all_lecturers"
          ? ["lecturer"]
          : ["student", "lecturer", "admin"];

      const newNotice = await noticesApi.broadcastNotice({
        title,
        body,
        urgency,
        course_offering_id: targetOffering,
        target_roles: targetRoles,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      setNotices((prev) => [newNotice, ...prev]);
      setShowModal(false);
      setTitle("");
      setBody("");
      setUrgency("normal");
      setToastMessage("Institutional broadcast successfully transmitted across web & mobile devices.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Failed to broadcast notice:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminDashboardLayout
      title="Campus Announcements & Broadcasts"
      subtitle="Issue real-time push alerts and emergency notifications to students, lecturers, and academic departments"
      actions={
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
          <PlusIcon size={14} />
          <span>New Campus Broadcast</span>
        </button>
      }
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            color: "#34D399",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          <CheckCircleIcon size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Broadcasts List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Active Broadcast Announcements ({notices.length})
        </h3>

        {loading ? (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading broadcast archive...
          </div>
        ) : notices.length === 0 ? (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No active notices currently published.
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="glass-card"
              style={{
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                borderLeft: `4px solid ${
                  notice.urgency === "urgent"
                    ? "#EF4444"
                    : notice.urgency === "high"
                    ? "#F59E0B"
                    : "#22D3EE"
                }`,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor:
                          notice.urgency === "urgent"
                            ? "rgba(239, 68, 68, 0.15)"
                            : notice.urgency === "high"
                            ? "rgba(245, 158, 11, 0.15)"
                            : "rgba(6, 182, 212, 0.15)",
                        color:
                          notice.urgency === "urgent"
                            ? "#F87171"
                            : notice.urgency === "high"
                            ? "#FBBF24"
                            : "#22D3EE",
                      }}
                    >
                      {notice.urgency} PRIORITY
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      Target: {notice.course_code || "ALL UNIVERSITY"}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {notice.title}
                  </h4>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {new Date(notice.created_at).toLocaleDateString()} at{" "}
                    {new Date(notice.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {notice.body}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--border-subtle)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                <span>Issued by: <strong>{notice.creator_name || "Office of Administration"}</strong></span>
                <span>{notice.read_count || 0} mobile acknowledgments</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div className="glass-card" style={{ width: "100%", maxWidth: "560px", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <BellIcon size={20} className="text-cyan" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Dispatch Campus Broadcast
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Announcement Title
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Campus Network Maintenance & Geofence Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Urgency Level
                  </label>
                  <select
                    className="input-control"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Audience Scope
                  </label>
                  <select
                    className="input-control"
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value)}
                  >
                    <option value="all_university">All University Members</option>
                    <option value="all_students">All Students</option>
                    <option value="all_lecturers">Faculty & Lecturers Only</option>
                    <option value="specific_offering">Specific Course Offering</option>
                  </select>
                </div>
              </div>

              {targetScope === "specific_offering" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Select Target Course Offering
                  </label>
                  <select
                    className="input-control"
                    value={selectedOfferingId}
                    onChange={(e) => setSelectedOfferingId(e.target.value)}
                  >
                    {offerings.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.course_code} - {off.course_name} ({off.lecturer_name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Notice Content / Instructions
                </label>
                <textarea
                  className="input-control"
                  rows={4}
                  placeholder="Detailed announcement text to be broadcasted to mobile devices and web banners..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={isSending}
                >
                  {isSending ? "Transmitting..." : "Send Broadcast"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
