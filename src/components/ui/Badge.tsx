import React from "react";
import { AttendanceStatus, SessionStatus, NoticeUrgency } from "@/types";

interface BadgeProps {
  type: "attendance" | "session" | "urgency" | "method" | "custom";
  value: string;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ type, value, className = "", size = "md" }: BadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  let bg = "rgba(255, 255, 255, 0.08)";
  let color = "#CBD5E1";
  let border = "rgba(255, 255, 255, 0.15)";
  let label = value;

  if (type === "attendance") {
    switch (value as AttendanceStatus) {
      case "present":
        bg = "rgba(16, 185, 129, 0.15)";
        color = "#34D399";
        border = "rgba(16, 185, 129, 0.35)";
        label = "Present";
        break;
      case "late":
        bg = "rgba(245, 158, 11, 0.15)";
        color = "#FBBF24";
        border = "rgba(245, 158, 11, 0.35)";
        label = "Late Arrival";
        break;
      case "absent":
        bg = "rgba(239, 68, 68, 0.15)";
        color = "#F87171";
        border = "rgba(239, 68, 68, 0.35)";
        label = "Absent";
        break;
      case "flagged_proxy":
        bg = "rgba(236, 72, 153, 0.18)";
        color = "#F472B6";
        border = "rgba(236, 72, 153, 0.4)";
        label = "Flagged Proxy";
        break;
    }
  } else if (type === "session") {
    switch (value as SessionStatus) {
      case "ongoing":
        bg = "rgba(239, 68, 68, 0.18)";
        color = "#F87171";
        border = "rgba(239, 68, 68, 0.4)";
        label = "LIVE NOW";
        break;
      case "scheduled":
        bg = "rgba(99, 102, 241, 0.15)";
        color = "#A5B4FC";
        border = "rgba(99, 102, 241, 0.35)";
        label = "Scheduled";
        break;
      case "completed":
        bg = "rgba(16, 185, 129, 0.15)";
        color = "#34D399";
        border = "rgba(16, 185, 129, 0.35)";
        label = "Completed";
        break;
      case "cancelled":
        bg = "rgba(148, 163, 184, 0.15)";
        color = "#94A3B8";
        border = "rgba(148, 163, 184, 0.3)";
        label = "Cancelled";
        break;
    }
  } else if (type === "urgency") {
    switch (value as NoticeUrgency) {
      case "urgent":
        bg = "rgba(239, 68, 68, 0.2)";
        color = "#F87171";
        border = "rgba(239, 68, 68, 0.5)";
        label = "URGENT";
        break;
      case "high":
        bg = "rgba(245, 158, 11, 0.2)";
        color = "#FBBF24";
        border = "rgba(245, 158, 11, 0.4)";
        label = "HIGH";
        break;
      case "normal":
        bg = "rgba(59, 130, 246, 0.15)";
        color = "#60A5FA";
        border = "rgba(59, 130, 246, 0.3)";
        label = "NORMAL";
        break;
      case "low":
        bg = "rgba(148, 163, 184, 0.15)";
        color = "#94A3B8";
        border = "rgba(148, 163, 184, 0.3)";
        label = "INFO";
        break;
    }
  } else if (type === "method") {
    if (value === "gps_geofence") {
      bg = "rgba(6, 182, 212, 0.15)";
      color = "#22D3EE";
      border = "rgba(6, 182, 212, 0.35)";
      label = "GPS Geofence";
    } else {
      bg = "rgba(168, 85, 247, 0.15)";
      color = "#C084FC";
      border = "rgba(168, 85, 247, 0.35)";
      label = "WiFi AP Match";
    }
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        borderRadius: "9999px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
      }}
      className={`${sizeClasses} ${className}`}
    >
      {value === "ongoing" && <span className="pulse-dot-live" style={{ width: 6, height: 6 }} />}
      {label}
    </span>
  );
}
