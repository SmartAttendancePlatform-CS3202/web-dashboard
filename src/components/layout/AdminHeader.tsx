"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { adminApi } from "@/lib/api/services";
import { MicroserviceStatus } from "@/types";
import { ShieldAlertIcon, RefreshIcon } from "@/components/ui/Icons";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const { isDemoMode, toggleDemoMode } = useAuth();
  const [services, setServices] = useState<MicroserviceStatus[]>([]);

  useEffect(() => {
    adminApi.getMicroservicesHealth().then((res) => setServices(res));
  }, []);

  const healthyCount = services.filter((s) => s.status === "healthy").length;

  return (
    <header
      className="no-print"
      style={{
        padding: "20px 32px",
        backgroundColor: "var(--bg-header)",
        backdropFilter: "blur(12px)",
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
              fontSize: "1.45rem",
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
              borderRadius: "999px",
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              backgroundColor: "rgba(6, 182, 212, 0.15)",
              border: "1px solid rgba(6, 182, 212, 0.35)",
              color: "#22D3EE",
            }}
          >
            <ShieldAlertIcon size={11} /> Admin Mode
          </span>
        </div>
        {subtitle && (
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "3px" }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Backend Microservices Cluster Status */}
        <div
          className="glass-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
          }}
          title="FastAPI Microservices Cluster Status (:8001, :8002, :8003)"
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: healthyCount === 3 ? "#10B981" : "#F59E0B",
              boxShadow: healthyCount === 3 ? "0 0 8px #10B981" : "none",
            }}
          />
          <span>
            Microservices: <strong style={{ color: "#FFFFFF" }}>{healthyCount}/3 Live</strong>
          </span>
        </div>

        {/* Demo Mode Switcher */}
        <button
          onClick={() => toggleDemoMode()}
          className="btn-secondary"
          style={{
            fontSize: "0.78rem",
            padding: "6px 12px",
            borderColor: isDemoMode ? "rgba(6, 182, 212, 0.4)" : "var(--border-subtle)",
            color: isDemoMode ? "#22D3EE" : "var(--text-secondary)",
          }}
        >
          <RefreshIcon size={13} />
          <span>{isDemoMode ? "Demo Mode" : "Live Backend"}</span>
        </button>

        {/* Extra Action Buttons */}
        {actions}
      </div>
    </header>
  );
}
