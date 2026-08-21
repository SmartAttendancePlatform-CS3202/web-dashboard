"use client";

import React, { useEffect, useState } from "react";

import { adminApi } from "@/lib/api/services";
import { MicroserviceStatus } from "@/types";
import { ShieldAlertIcon, ClockIcon } from "@/components/ui/Icons";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const [services, setServices] = useState<MicroserviceStatus[]>([]);
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    adminApi.getMicroservicesHealth().then((res) => setServices(res));

    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toTimeString().split(" ")[0] + " UTC"
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const healthyCount = services.filter((s) => s.status === "healthy").length;

  return (
    <header
      className="no-print"
      style={{
        padding: "16px 32px",
        backgroundColor: "var(--bg-header)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              backgroundColor: "rgba(79, 70, 229, 0.08)",
              border: "1px solid rgba(79, 70, 229, 0.2)",
              color: "var(--accent-primary)",
            }}
          >
            <ShieldAlertIcon size={11} /> Admin Mode
          </span>
        </div>
        {subtitle && (
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Real-Time UTC System Clock */}
        <div
          className="font-mono tabular-nums"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            fontWeight: 600,
          }}
          title="System Node Master Telemetry Clock"
        >
          <ClockIcon size={13} className="text-slate-400" />
          <span>{timeString || "00:00:00 UTC"}</span>
        </div>

        {/* Backend Microservices Cluster Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            fontSize: "0.76rem",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-secondary)",
            boxShadow: "var(--shadow-xs)",
          }}
          title="FastAPI Microservices Cluster Status (:8001, :8002, :8003)"
        >
          <span className="pulse-dot-emerald" />
          <span className="font-mono" style={{ fontSize: "0.72rem" }}>
            MESH: <strong style={{ color: "var(--text-primary)" }}>{healthyCount}/3 NODES</strong>
          </span>
        </div>


        {/* Extra Action Buttons */}
        {actions}
      </div>
    </header>
  );
}
