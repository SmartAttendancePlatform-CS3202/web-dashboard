"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CalendarIcon,
  BookOpenIcon,
  RadioIcon,
  UserCheckIcon,
  BarChartIcon,
  BellIcon,
  ShieldAlertIcon,
  ChevronRightIcon,
  LogOutIcon,
} from "@/components/ui/Icons";
import { useAuth } from "@/lib/context/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
  isLive?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { lecturerProfile, logout } = useAuth();

  const navItems: NavItem[] = [
    { name: "Overview", href: "/", icon: HomeIcon },
    { name: "Live Session", href: "/session/live", icon: RadioIcon, isLive: true },
    { name: "Teaching Timetable", href: "/timetable", icon: CalendarIcon },
    { name: "Courses & Rosters", href: "/courses", icon: BookOpenIcon },
    { name: "Attendance Hub", href: "/attendance", icon: UserCheckIcon },
    { name: "Reports & Analytics", href: "/reports", icon: BarChartIcon },
    { name: "Notices Broadcast", href: "/notices", icon: BellIcon },
    { name: "Security Alerts", href: "/alerts", icon: ShieldAlertIcon, badge: "2" },
  ];

  return (
    <aside
      className="no-print"
      style={{
        width: "260px",
        height: "100vh",
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(99, 102, 241, 0.4)",
          }}
        >
          <RadioIcon size={20} className="text-white" />
        </div>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            SMART<span style={{ color: "#818CF8" }}>ATTEND</span>
          </h1>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.04em" }}>
            FACULTY COMMAND CENTER
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: "16px 12px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            padding: "8px 12px 4px 12px",
          }}
        >
          Operations
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                backgroundColor: isActive ? "rgba(99, 102, 241, 0.15)" : "transparent",
                border: isActive ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: isActive ? "#818CF8" : "var(--text-muted)" }}>
                  <Icon size={18} />
                </span>
                <span>{item.name}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {item.isLive && <span className="pulse-dot-live" />}
                {item.badge && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                      color: "#F87171",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      padding: "1px 6px",
                      borderRadius: "9999px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRightIcon size={14} className="text-indigo-400" />}
              </div>
            </Link>
          );
        })}
      </nav>

        {/* Admin Console Switcher Card */}
        <div style={{ marginTop: "auto", padding: "12px 12px 16px 12px" }}>
          <div
            style={{
              padding: "12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(6, 182, 212, 0.08)",
              border: "1px solid rgba(6, 182, 212, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#22D3EE", fontSize: "0.75rem", fontWeight: 700 }}>
              <ShieldAlertIcon size={14} />
              <span>CENTRAL ADMIN CONSOLE</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Manage users, RBAC roles, geofenced venues, and institution analytics.
            </p>
            <Link
              href="/admin"
              className="btn-secondary"
              style={{
                fontSize: "0.75rem",
                padding: "6px 10px",
                justifyContent: "center",
                borderColor: "rgba(6, 182, 212, 0.4)",
                color: "#22D3EE",
                textDecoration: "none",
              }}
            >
              Go to Admin Portal →
            </Link>
          </div>
        </div>

      {/* Lecturer Profile Footer */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "#FFFFFF",
              }}
            >
              {lecturerProfile?.full_name ? lecturerProfile.full_name.charAt(0) : "L"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {lecturerProfile?.display_name || "Dr. Arthur Vance"}
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {lecturerProfile?.employee_id || "LEC-ENG-4092"}
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            title="Sign Out"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
