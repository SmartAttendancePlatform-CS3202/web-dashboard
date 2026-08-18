"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CalendarIcon,
  BookOpenIcon,
  UserCheckIcon,
  BarChartIcon,
  BellIcon,
  ShieldAlertIcon,
  MapPinIcon,
  LogOutIcon,
  SparklesIcon,
} from "@/components/ui/Icons";
import { useAuth } from "@/lib/context/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
  isNew?: boolean;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout, isDemoMode, switchPersona } = useAuth();

  const navItems: NavItem[] = [
    { name: "Executive Overview", href: "/admin", icon: HomeIcon },
    { name: "Users & Role RBAC", href: "/admin/users", icon: UserCheckIcon, badge: "Directory" },
    { name: "Departments & Semesters", href: "/admin/departments", icon: CalendarIcon },
    { name: "Curriculum & Offerings", href: "/admin/courses", icon: BookOpenIcon, badge: "28" },
    { name: "Venues & Geofences", href: "/admin/venues", icon: MapPinIcon },
    { name: "Institutional Analytics", href: "/admin/reports", icon: BarChartIcon },
    { name: "Campus Broadcasts", href: "/admin/notices", icon: BellIcon },
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
          padding: "18px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
            flexShrink: 0,
          }}
        >
          <ShieldAlertIcon size={20} className="text-white" />
        </div>
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.98rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Smart Attendance
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
            <span
              className="font-mono"
              style={{
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent-primary)",
                backgroundColor: "rgba(79, 70, 229, 0.08)",
                padding: "1px 6px",
                borderRadius: "4px",
                border: "1px solid rgba(79, 70, 229, 0.2)",
              }}
            >
              Central Ops
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav
        style={{
          flex: 1,
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          overflowY: "auto",
        }}
      >
        <div
          className="micro-label"
          style={{
            padding: "4px 12px 8px 12px",
          }}
        >
          Operations Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--bg-surface)" : "transparent",
                border: isActive ? "1px solid var(--border-medium)" : "1px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }}>
                  <Icon size={17} />
                </div>
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className="font-mono tabular-nums"
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: isActive ? "rgba(79, 70, 229, 0.12)" : "var(--bg-surface)",
                    color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Switch to Lecturer Portal Banner */}
        <div style={{ marginTop: "auto", paddingTop: "14px" }}>
          <div
            style={{
              padding: "12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-primary)", fontSize: "0.72rem", fontWeight: 700 }}>
              <SparklesIcon size={13} />
              <span className="micro-label" style={{ color: "var(--accent-primary)" }}>FACULTY PORTAL</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.35 }}>
              Preview live class sessions & timetable as Dr. Vance.
            </p>
            {isDemoMode ? (
              <button
                onClick={() => switchPersona("lecturer")}
                className="btn-secondary"
                style={{
                  fontSize: "0.74rem",
                  padding: "5px 8px",
                  justifyContent: "center",
                  borderColor: "rgba(79, 70, 229, 0.25)",
                  color: "var(--accent-primary)",
                  backgroundColor: "#FFFFFF",
                }}
              >
                Switch to Lecturer (Dr. Vance)
              </button>
            ) : (
              <Link
                href="/"
                className="btn-secondary"
                style={{
                  fontSize: "0.74rem",
                  padding: "5px 8px",
                  justifyContent: "center",
                  borderColor: "rgba(79, 70, 229, 0.25)",
                  color: "var(--accent-primary)",
                  textDecoration: "none",
                  backgroundColor: "#FFFFFF",
                }}
              >
                Go to Lecturer Portal →
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* User Profile / Logout Footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div
            className="font-mono"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "rgba(79, 70, 229, 0.12)",
              color: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.75rem",
              border: "1px solid rgba(79, 70, 229, 0.2)",
              flexShrink: 0,
            }}
          >
            AD
          </div>
          <div style={{ minWidth: 0 }}>
            <h4
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              System Admin
            </h4>
            <p
              className="font-mono"
              style={{
                fontSize: "0.68rem",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.email || "admin@university.ac.lk"}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#E11D48";
            e.currentTarget.style.backgroundColor = "rgba(225, 29, 72, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <LogOutIcon size={16} />
        </button>
      </div>
    </aside>
  );
}
