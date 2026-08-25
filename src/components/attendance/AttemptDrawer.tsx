"use client";

import React, { useEffect, useState } from "react";
import { AttendanceRecord, AttendanceVerificationAttempt } from "@/types";
import { attendanceApi } from "@/lib/api/services";
import { Badge } from "@/components/ui/Badge";
import { XIcon, MapPinIcon, WifiIcon, ScanFaceIcon, AlertTriangleIcon, CheckCircleIcon } from "@/components/ui/Icons";

interface AttemptDrawerProps {
  record: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenOverride: (record: AttendanceRecord) => void;
}

export function AttemptDrawer({
  record,
  isOpen,
  onClose,
  onOpenOverride,
}: AttemptDrawerProps) {
  const [attempts, setAttempts] = useState<AttendanceVerificationAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAttempts() {
      if (!record) return;
      setLoading(true);
      try {
        const data = await attendanceApi.getAttempts(record.id);
        setAttempts(data);
      } catch (err) {
        console.error("Failed to fetch attempts:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen && record) {
      loadAttempts();
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          backgroundColor: "#FFFFFF",
          borderLeft: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-command)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#FFFFFF",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Verification Diagnostics
              </h3>
              <Badge type="attendance" value={record.status} size="sm" />
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              {record.student_name} • {record.student_index}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              padding: "6px",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quick Summary Pill */}
          {record.is_manually_overridden && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(79, 70, 229, 0.08)",
                border: "1px solid rgba(79, 70, 229, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-primary)", fontSize: "0.8rem", fontWeight: 600 }}>
                <span>🛡️</span>
                <span>Manually Overridden by {record.override_by_name || "Lecturer"}</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                Reason: {record.override_reason}
              </p>
            </div>
          )}

          <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Attempt Timeline ({attempts.length})
          </h4>

          {loading ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading verification records...</p>
          ) : attempts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)" }}>
              <p>No verification attempts recorded yet for this session.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {attempts.map((attempt) => {
                const isSuccess = attempt.status === "success";
                return (
                  <div
                    key={attempt.id}
                    className="glass-card"
                    style={{
                      padding: "16px",
                      borderColor: isSuccess ? "rgba(5, 150, 105, 0.25)" : "rgba(225, 29, 72, 0.3)",
                      background: isSuccess ? "rgba(5, 150, 105, 0.03)" : "rgba(225, 29, 72, 0.03)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {isSuccess ? (
                          <span style={{ color: "#059669" }}><CheckCircleIcon size={16} /></span>
                        ) : (
                          <span style={{ color: "#E11D48" }}><AlertTriangleIcon size={16} /></span>
                        )}
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          Attempt #{attempt.attempt_number}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {new Date(attempt.attempted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>

                    {/* Geofence Check Metric */}
                    {attempt.used_location_check && (
                      <div style={{ marginBottom: "10px", fontSize: "0.8rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                          <MapPinIcon size={14} style={{ color: "var(--accent-cyan)" }} />
                          <span>GPS Distance:</span>
                          <strong style={{ color: (attempt.distance_from_venue_meters || 0) > 35 ? "#E11D48" : "#059669" }}>
                            {attempt.distance_from_venue_meters?.toFixed(1)}m from Venue
                          </strong>
                        </div>
                        {attempt.wifi_ssid_detected && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", marginTop: "4px" }}>
                            <WifiIcon size={14} />
                            <span>WiFi SSID: <code>{attempt.wifi_ssid_detected}</code></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI Face Match Metric */}
                    {attempt.used_face_verification && (
                      <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "var(--bg-surface)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            <ScanFaceIcon size={14} style={{ color: "var(--accent-primary)" }} />
                            <span>AI Face Match Confidence</span>
                          </div>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: (attempt.face_match_confidence || 0) >= 85 ? "#059669" : "#E11D48",
                            }}
                          >
                            {attempt.face_match_confidence ? `${attempt.face_match_confidence}%` : "N/A"}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${attempt.face_match_confidence || 0}%`,
                              height: "100%",
                              backgroundColor: (attempt.face_match_confidence || 0) >= 85 ? "#059669" : "#E11D48",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          Required AI Confidence Threshold: 85.0%
                        </p>
                      </div>
                    )}

                    {/* Failure diagnostic */}
                    {attempt.failure_reason && (
                      <div style={{ marginTop: "10px", padding: "8px 10px", backgroundColor: "rgba(225, 29, 72, 0.08)", borderRadius: "6px", border: "1px solid rgba(225, 29, 72, 0.25)" }}>
                        <p style={{ fontSize: "0.75rem", color: "#E11D48", lineHeight: 1.4 }}>
                          ⚠️ {attempt.failure_reason}
                        </p>
                      </div>
                    )}

                    {/* Device Diagnostic */}
                    {attempt.device_info && (
                      <div style={{ marginTop: "8px", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        Device: {attempt.device_info.platform} • {attempt.device_info.model}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            gap: "10px",
            background: "#FFFFFF",
          }}
        >
          <button
            type="button"
            className="btn-primary"
            style={{ width: "100%" }}
            onClick={() => {
              onClose();
              onOpenOverride(record);
            }}
          >
            Open Manual Override Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
