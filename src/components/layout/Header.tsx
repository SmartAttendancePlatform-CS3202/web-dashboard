"use client";

import React from "react";
import Link from "next/link";
import { BellIcon, PlayIcon } from "@/components/ui/Icons";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Faculty Command Center", subtitle }: HeaderProps) {

  return (
    <header
      className="no-print"
      style={{
        height: "70px",
        backgroundColor: "var(--bg-header)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
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
        {/* Quick Launch Session Button */}
        <Link href="/session/start" className="btn-primary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
          <PlayIcon size={14} />
          <span>Launch Session</span>
        </Link>

        {/* Alert Bell */}
        <Link
          href="/alerts"
          className="btn-secondary"
          style={{
            position: "relative",
            width: "38px",
            height: "38px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
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
              backgroundColor: "#E11D48",
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
