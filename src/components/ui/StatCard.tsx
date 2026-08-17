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
  accentColor?: "indigo" | "emerald" | "amber" | "rose" | "cyan";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = "indigo",
  className = "",
}: StatCardProps) {
  let glowColor = "rgba(99, 102, 241, 0.15)";
  let iconBg = "rgba(99, 102, 241, 0.15)";
  let iconColor = "#818CF8";

  if (accentColor === "emerald") {
    glowColor = "rgba(16, 185, 129, 0.15)";
    iconBg = "rgba(16, 185, 129, 0.15)";
    iconColor = "#34D399";
  } else if (accentColor === "amber") {
    glowColor = "rgba(245, 158, 11, 0.15)";
    iconBg = "rgba(245, 158, 11, 0.15)";
    iconColor = "#FBBF24";
  } else if (accentColor === "rose") {
    glowColor = "rgba(239, 68, 68, 0.15)";
    iconBg = "rgba(239, 68, 68, 0.15)";
    iconColor = "#F87171";
  } else if (accentColor === "cyan") {
    glowColor = "rgba(6, 182, 212, 0.15)";
    iconBg = "rgba(6, 182, 212, 0.15)";
    iconColor = "#22D3EE";
  }

  return (
    <div
      className={`glass-card ${className}`}
      style={{
        padding: "20px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Accent Glow */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "100px",
          height: "100px",
          background: glowColor,
          borderRadius: "50%",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, marginBottom: "8px" }}>
            {title}
          </p>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.85rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.1,
            }}
          >
            {value}
          </h3>
        </div>

        {icon && (
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: iconBg,
              color: iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px" }}>
          {trend && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: trend.positive ? "#34D399" : "#F87171",
                backgroundColor: trend.positive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                padding: "2px 8px",
                borderRadius: "9999px",
              }}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
          {subtitle && (
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
