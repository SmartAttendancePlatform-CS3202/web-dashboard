"use client";

import React from "react";
import Link from "next/link";
import { BellIcon, PlayIcon, ShieldAlertIcon } from "@/components/ui/Icons";
import { useAuth } from "@/lib/context/AuthContext";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Faculty Command Center", subtitle }: HeaderProps) {
  const { isDemoMode, toggleDemoMode, switchPersona, isAdmin } = useAuth();

  return (
    <header
      className="no-print"
      style={{
        height: "70px",
        backgroundColor: "rgba(11, 15, 25, 0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Title & Context */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
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
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              color: "#818CF8",
            }}
          >
            Lecturer Mode
          </span>
        </div>
        {subtitle && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Header Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Switch to Admin Portal (if demo mode or admin) */}
        {isDemoMode ? (
          <button
            onClick={() => switchPersona("admin")}
            className="btn-secondary"
            style={{
              padding: "6px 12px",
              fontSize: "0.75rem",
              borderColor: "rgba(6, 182, 212, 0.4)",
              color: "#22D3EE",
            }}
          >
            <ShieldAlertIcon size={14} />
            <span>Admin Console</span>
          </button>
        ) : isAdmin ? (
          <Link
            href="/admin"
            className="btn-secondary"
            style={{
              padding: "6px 12px",
              fontSize: "0.75rem",
              borderColor: "rgba(6, 182, 212, 0.4)",
              color: "#22D3EE",
              textDecoration: "none",
            }}
          >
            <ShieldAlertIcon size={14} />
            <span>Admin Console</span>
          </Link>
        ) : null}

        {/* Demo / Live Microservices Mode Toggle */}
        <button
          onClick={() => toggleDemoMode()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            borderRadius: "9999px",
            backgroundColor: isDemoMode ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
            border: isDemoMode ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid rgba(16, 185, 129, 0.4)",
            color: isDemoMode ? "#FBBF24" : "#34D399",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          title="Toggle between Live FastAPI microservices and Standalone Mock Evaluation Mode"
        >
          <span className={isDemoMode ? "" : "pulse-dot-emerald"} style={{ width: 8, height: 8 }} />
          <span>{isDemoMode ? "⚡ Demo Mode Active" : "🟢 Live Microservices"}</span>
        </button>

        {/* Quick Launch Session Button */}
        <Link href="/session/start" className="btn-primary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
          <PlayIcon size={14} />
          <span>Launch Session</span>
        </Link>

        {/* Alert Bell */}
        <Link
          href="/alerts"
          style={{
            position: "relative",
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          <BellIcon size={18} />
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#EF4444",
              color: "#FFFFFF",
              fontSize: "0.65rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            2
          </span>
        </Link>
      </div>
    </header>
  );
}
