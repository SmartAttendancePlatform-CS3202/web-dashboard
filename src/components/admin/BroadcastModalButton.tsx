"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { noticesApi } from "@/lib/api/services";
import { CourseOffering } from "@/types";
import { BellIcon, PlusIcon, CheckCircleIcon } from "@/components/ui/Icons";

export function BroadcastModalButton({ offerings }: { offerings: CourseOffering[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [targetScope, setTargetScope] = useState("all_university");
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(offerings.length > 0 ? offerings[0].id : "");
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

      await noticesApi.broadcastNotice({
        title,
        body,
        urgency,
        course_offering_id: targetOffering,
        target_roles: targetRoles,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      setShowModal(false);
      setToastMessage("Broadcast transmitted successfully!");
      setTitle(""); setBody("");
      
      // Refresh the server component!
      router.refresh();
      
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      alert("Failed to send broadcast.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setShowModal(true)}>
        <PlusIcon size={18} />
        New Broadcast
      </button>
      
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", padding: "12px 24px", backgroundColor: "#10B981", color: "white", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)", zIndex: 1000 }}>
          <CheckCircleIcon size={20} />
          <span style={{ fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

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
                X
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
    </>
  );
}
