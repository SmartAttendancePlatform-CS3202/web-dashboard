"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { noticesApi, schedulingApi } from "@/lib/api/services";
import { Notice, CourseOffering, NoticeUrgency } from "@/types";
import { BellIcon, SendIcon, UsersIcon, ClockIcon } from "@/components/ui/Icons";

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [urgency, setUrgency] = useState<NoticeUrgency>("normal");
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [nots, offs] = await Promise.all([
          noticesApi.getNotices(),
          schedulingApi.getAllOfferings(),
        ]);
        setNotices(nots);
        setOfferings(offs);
      } catch (err) {
        console.error("Failed to load notices:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setSuccessMsg(null);

    try {
      const newNotice = await noticesApi.broadcastNotice({
        course_offering_id: selectedOfferingId || undefined,
        title,
        body,
        urgency,
        target_roles: ["student"],
      });

      setNotices((prev) => [newNotice, ...prev]);
      setTitle("");
      setBody("");
      setSuccessMsg("Announcement broadcast successfully to enrolled students!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Failed to broadcast notice:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <DashboardLayout
      title="Notice Broadcast Studio"
      subtitle="Publish urgent announcements, lecture updates, and syllabus notices directly to student mobile apps."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "24px" }}>
        {/* Notice Composer */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <div style={{ color: "#818CF8" }}><SendIcon size={20} /></div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Broadcast New Announcement
            </h3>
          </div>

          <form onSubmit={handleBroadcast} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Target Offering */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Target Course / Audience
              </label>
              <select
                className="input-control"
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
              >
                <option value="" style={{ backgroundColor: "#111827" }}>
                  All Assigned Courses & Enrolled Students
                </option>
                {offerings.map((off) => (
                  <option key={off.id} value={off.id} style={{ backgroundColor: "#111827" }}>
                    {off.course_code}: {off.course_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Level */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Urgency Level
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {(["low", "normal", "high", "urgent"] as NoticeUrgency[]).map((urg) => (
                  <button
                    key={urg}
                    type="button"
                    onClick={() => setUrgency(urg)}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "6px",
                      border: urgency === urg ? "2px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                      backgroundColor: urgency === urg ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)",
                      color: urgency === urg ? "#FFFFFF" : "var(--text-secondary)",
                      fontSize: "0.75rem",
                      fontWeight: urgency === urg ? 700 : 500,
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    {urg}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Notice Title <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g., Midterm Exam Venue Reallocation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Body */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Message Body <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <textarea
                className="input-control"
                rows={4}
                placeholder="Type the full announcement to be pushed to student devices..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>

            {successMsg && (
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", color: "#34D399", fontSize: "0.8rem" }}>
                ✓ {successMsg}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isPublishing} style={{ marginTop: "4px" }}>
              <SendIcon size={14} />
              <span>{isPublishing ? "Broadcasting to Push Queue..." : "Send Announcement Now"}</span>
            </button>
          </form>
        </div>

        {/* Previous Broadcasts Feed */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ color: "#06B6D4" }}><BellIcon size={20} /></div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Published Announcements ({notices.length})
              </h3>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {notices.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#818CF8" }}>
                      {n.course_code || "GENERAL"}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge type="urgency" value={n.urgency} size="sm" />
                </div>

                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {n.title}
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: "10px" }}>
                  {n.body}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <UsersIcon size={12} /> {n.read_count || 0} Students Read
                  </span>
                  <span>Published by {n.creator_name || "You"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
