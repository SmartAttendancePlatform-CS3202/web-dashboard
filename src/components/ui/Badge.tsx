import React from "react";
import { AttendanceStatus, SessionStatus, NoticeUrgency } from "@/types";

interface BadgeProps {
  type: "attendance" | "session" | "urgency" | "method" | "severity" | "custom";
  value: string;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ type, value, className = "", size = "md" }: BadgeProps) {
  const sizeStyles =
    size === "sm"
      ? { padding: "2px 7px", fontSize: "0.68rem" }
      : { padding: "3px 9px", fontSize: "0.74rem" };

  let bg = "#F1F5F9";
  let color = "#475569";
  let border = "#CBD5E1";
  let label = value;

  if (type === "attendance") {
    switch (value as AttendanceStatus) {
      case "present":
        bg = "rgba(5, 150, 105, 0.08)";
        color = "#059669";
        border = "rgba(5, 150, 105, 0.25)";
        label = "Present";
        break;
      case "late":
        bg = "rgba(217, 119, 6, 0.08)";
        color = "#D97706";
        border = "rgba(217, 119, 6, 0.25)";
        label = "Late Arrival";
        break;
      case "absent":
        bg = "rgba(225, 29, 72, 0.08)";
        color = "#E11D48";
        border = "rgba(225, 29, 72, 0.25)";
        label = "Absent";
        break;
      case "flagged_proxy":
        bg = "rgba(190, 24, 93, 0.08)";
        color = "#BE185D";
        border = "rgba(190, 24, 93, 0.25)";
        label = "Flagged Proxy";
        break;
    }
  } else if (type === "session") {
    switch (value as SessionStatus) {
      case "ongoing":
        bg = "rgba(225, 29, 72, 0.08)";
        color = "#E11D48";
        border = "rgba(225, 29, 72, 0.25)";
        label = "LIVE SESSION";
        break;
      case "scheduled":
        bg = "rgba(79, 70, 229, 0.08)";
        color = "#4F46E5";
        border = "rgba(79, 70, 229, 0.25)";
        label = "Scheduled";
        break;
      case "completed":
        bg = "rgba(5, 150, 105, 0.08)";
        color = "#059669";
        border = "rgba(5, 150, 105, 0.25)";
        label = "Completed";
        break;
      case "cancelled":
        bg = "#F1F5F9";
        color = "#64748B";
        border = "#CBD5E1";
        label = "Cancelled";
        break;
    }
  } else if (type === "urgency") {
    switch (value as NoticeUrgency) {
      case "urgent":
        bg = "rgba(225, 29, 72, 0.08)";
        color = "#E11D48";
        border = "rgba(225, 29, 72, 0.25)";
        label = "URGENT";
        break;
      case "high":
        bg = "rgba(217, 119, 6, 0.08)";
        color = "#D97706";
        border = "rgba(217, 119, 6, 0.25)";
        label = "HIGH";
        break;
      case "normal":
        bg = "rgba(37, 99, 235, 0.08)";
        color = "#2563EB";
        border = "rgba(37, 99, 235, 0.25)";
        label = "NORMAL";
        break;
      case "low":
        bg = "#F1F5F9";
        color = "#64748B";
        border = "#CBD5E1";
        label = "INFO";
        break;
    }
  } else if (type === "severity") {
    switch (value) {
      case "critical":
        bg = "rgba(225, 29, 72, 0.12)";
        color = "#E11D48";
        border = "rgba(225, 29, 72, 0.3)";
        label = "[CRITICAL]";
        break;
      case "warning":
        bg = "rgba(217, 119, 6, 0.12)";
        color = "#D97706";
        border = "rgba(217, 119, 6, 0.3)";
        label = "[WARN]";
        break;
      case "info":
        bg = "rgba(79, 70, 229, 0.12)";
        color = "#4F46E5";
        border = "rgba(79, 70, 229, 0.3)";
        label = "[INFO]";
        break;
    }
  } else if (type === "method") {
    if (value === "gps_geofence") {
      bg = "rgba(8, 145, 178, 0.08)";
      color = "#0891B2";
      border = "rgba(8, 145, 178, 0.25)";
      label = "GPS Geofence";
    } else {
      bg = "rgba(147, 51, 234, 0.08)";
      color = "#9333EA";
      border = "rgba(147, 51, 234, 0.25)";
      label = "WiFi AP Match";
    }
  }

  return (
    <span
      className={`font-mono tabular-nums ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-full)",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        ...sizeStyles,
      }}
    >
      {value === "ongoing" && <span className="pulse-dot-live" style={{ width: 6, height: 6 }} />}
      {label}
    </span>
  );
}
