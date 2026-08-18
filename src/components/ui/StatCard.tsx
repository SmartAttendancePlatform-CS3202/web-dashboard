import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon?: React.ReactNode;
  accentColor?: "indigo" | "emerald" | "amber" | "rose" | "cyan" | "blue";
  className?: string;
  badge?: string;
  progressPercent?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = "indigo",
  className = "",
  badge,
  progressPercent,
}: StatCardProps) {
  let iconBg = "rgba(79, 70, 229, 0.08)";
  let iconColor = "#4F46E5";
  let borderAccent = "rgba(79, 70, 229, 0.2)";
  let progressColor = "#4F46E5";

  if (accentColor === "emerald") {
    iconBg = "rgba(5, 150, 105, 0.08)";
    iconColor = "#059669";
    borderAccent = "rgba(5, 150, 105, 0.2)";
    progressColor = "#059669";
  } else if (accentColor === "amber") {
    iconBg = "rgba(217, 119, 6, 0.08)";
    iconColor = "#D97706";
    borderAccent = "rgba(217, 119, 6, 0.2)";
    progressColor = "#D97706";
  } else if (accentColor === "rose") {
    iconBg = "rgba(225, 29, 72, 0.08)";
    iconColor = "#E11D48";
    borderAccent = "rgba(225, 29, 72, 0.2)";
    progressColor = "#E11D48";
  } else if (accentColor === "cyan" || accentColor === "blue") {
    iconBg = "rgba(8, 145, 178, 0.08)";
    iconColor = "#0891B2";
    borderAccent = "rgba(8, 145, 178, 0.2)";
    progressColor = "#0891B2";
  }

  return (
    <div
      className={`command-card ${className}`}
      style={{
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <p className="micro-label">{title}</p>
              {badge && (
                <span
                  className="font-mono tabular-nums"
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    padding: "1px 5px",
                    borderRadius: "4px",
                    backgroundColor: iconBg,
                    color: iconColor,
                    border: `1px solid ${borderAccent}`,
                  }}
                >
                  {badge}
                </span>
              )}
            </div>

            <h3
              className="font-mono tabular-nums"
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginTop: "6px",
              }}
            >
              {value}
            </h3>
          </div>

          {icon && (
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                backgroundColor: iconBg,
                color: iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: `1px solid ${borderAccent}`,
              }}
            >
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar if supplied */}
      {typeof progressPercent === "number" && (
        <div style={{ marginTop: "12px" }}>
          <div className="capacity-track" style={{ height: "4px" }}>
            <div
              className="capacity-fill"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%`, backgroundColor: progressColor }}
            />
          </div>
        </div>
      )}

      {(subtitle || trend) && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
          {trend && (
            <span
              className="font-mono tabular-nums"
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: trend.positive ? "#059669" : "#E11D48",
                backgroundColor: trend.positive ? "rgba(5, 150, 105, 0.08)" : "rgba(225, 29, 72, 0.08)",
                padding: "2px 7px",
                borderRadius: "var(--radius-full)",
                border: `1px solid ${trend.positive ? "rgba(5, 150, 105, 0.2)" : "rgba(225, 29, 72, 0.2)"}`,
              }}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
          {subtitle && (
            <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 500 }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
