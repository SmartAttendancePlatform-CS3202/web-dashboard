import React from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { noticesApi, adminApi } from "@/lib/api/services";
import { Notice, CourseOffering } from "@/types";
import { BroadcastModalButton } from "@/components/admin/BroadcastModalButton";

export default async function AdminNoticesPage() {
  let notices: Notice[] = [];
  let offerings: CourseOffering[] = [];
  
  try {
    const [noticesData, offs] = await Promise.all([
      noticesApi.getNotices(),
      adminApi.getAllOfferings(),
    ]);
    notices = noticesData;
    offerings = offs;
  } catch (err) {
    console.error("Error loading notices on server:", err);
  }

  return (
    <AdminDashboardLayout
      title="Campus Broadcasts"
      subtitle="Manage and dispatch emergency or standard university notices."
      actions={<BroadcastModalButton offerings={offerings} />}
    >

      <div style={{ display: "grid", gap: "16px" }}>
        {notices.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed var(--border-subtle)" }}>
            <p>No announcements found.</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="glass-card"
              style={{
                padding: "20px",
                borderLeft:
                  notice.urgency === "urgent"
                    ? "4px solid #F87171"
                    : notice.urgency === "high"
                    ? "4px solid #FBBF24"
                    : "4px solid #22D3EE",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
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

              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "12px" }}>
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
    </AdminDashboardLayout>
  );
}
