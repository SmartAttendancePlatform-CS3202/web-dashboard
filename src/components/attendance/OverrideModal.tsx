"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { AttendanceRecord, AttendanceStatus } from "@/types";
import { attendanceApi } from "@/lib/api/services";

interface OverrideModalProps {
  record: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRecord: AttendanceRecord) => void;
}

const PRESET_REASONS = [
  "Verified in person during lecture",
  "Approved Medical Certificate submitted",
  "Official University Duty / Sports representation",
  "Device GPS hardware glitch / Location mismatch verified",
  "Mobile app camera / Face verification glitch",
  "Other / Custom Note",
];

export function OverrideModal({
  record,
  isOpen,
  onClose,
  onSuccess,
}: OverrideModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(record?.status || "present");
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const finalReason =
      selectedPreset === "Other / Custom Note"
        ? customReason.trim()
        : selectedPreset;

    if (!finalReason) {
      setError("Please provide a reason for this manual override.");
      setIsSubmitting(false);
      return;
    }

    try {
      const updated = await attendanceApi.overrideRecord(record.id, {
        status: selectedStatus,
        override_reason: finalReason,
      });

      if (updated) {
        onSuccess(updated);
        onClose();
      } else {
        setError("Failed to submit override. Please check connection.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Attendance Override"
      subtitle={`Student: ${record.student_name} (${record.student_index})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Student Info Card */}
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Current System Status</p>
            <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>
              {record.status.replace("_", " ")}
            </p>
          </div>
          {record.flag_reason && (
            <div style={{ maxWidth: "260px", textAlign: "right" }}>
              <p style={{ fontSize: "0.75rem", color: "#F472B6" }}>Flag Reason:</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{record.flag_reason}</p>
            </div>
          )}
        </div>

        {/* New Status Selection */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
            Select Overridden Status <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {(["present", "late", "absent", "flagged_proxy"] as AttendanceStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                style={{
                  padding: "10px 8px",
                  borderRadius: "var(--radius-md)",
                  border: selectedStatus === st ? "2px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                  backgroundColor: selectedStatus === st ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                  color: selectedStatus === st ? "#FFFFFF" : "var(--text-secondary)",
                  fontWeight: selectedStatus === st ? 700 : 500,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  textAlign: "center",
                  transition: "all 0.15s ease",
                }}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Reason Presets */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
            Audit Reason for Override <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {PRESET_REASONS.map((preset) => (
              <label
                key={preset}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  backgroundColor: selectedPreset === preset ? "rgba(255, 255, 255, 0.06)" : "transparent",
                  border: selectedPreset === preset ? "1px solid var(--border-focus)" : "1px solid transparent",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  color: selectedPreset === preset ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                <input
                  type="radio"
                  name="overrideReason"
                  value={preset}
                  checked={selectedPreset === preset}
                  onChange={() => setSelectedPreset(preset)}
                  style={{ accentColor: "var(--accent-primary)" }}
                />
                {preset}
              </label>
            ))}
          </div>
        </div>

        {/* Custom Reason Textarea */}
        {selectedPreset === "Other / Custom Note" && (
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Custom Note / Details
            </label>
            <textarea
              className="input-control"
              rows={3}
              placeholder="Provide context for academic record audit..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              required
            />
          </div>
        )}

        {/* Academic Integrity Notice */}
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "8px",
            fontSize: "0.75rem",
            color: "#FBBF24",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⚖️</span>
          <span>
            This action is permanently stamped in the backend audit log under your lecturer account with UTC timestamp.
          </span>
        </div>

        {error && (
          <p style={{ color: "#EF4444", fontSize: "0.85rem", fontWeight: 500 }}>
            {error}
          </p>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Updating Audit Log..." : "Confirm & Save Override"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
