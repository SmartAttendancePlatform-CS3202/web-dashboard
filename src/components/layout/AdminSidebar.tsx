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
        width: "268px",
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
          padding: "20px 20px 16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(6, 182, 212, 0.4)",
            flexShrink: 0,
          }}
        >
          <ShieldAlertIcon size={22} className="text-white" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              Smart Attendance
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#22D3EE",
                backgroundColor: "rgba(6, 182, 212, 0.15)",
                padding: "1px 6px",
                borderRadius: "4px",
                border: "1px solid rgba(6, 182, 212, 0.3)",
              }}
            >
              Central Admin
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
          gap: "4px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text-muted)",
            padding: "4px 12px 8px 12px",
          }}
        >
          Administration Hub
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
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                backgroundColor: isActive ? "rgba(6, 182, 212, 0.15)" : "transparent",
                border: isActive ? "1px solid rgba(6, 182, 212, 0.35)" : "1px solid transparent",
                transition: "all var(--transition-fast)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color: isActive ? "#22D3EE" : "var(--text-muted)" }}>
                  <Icon size={18} />
                </div>
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "999px",
                    backgroundColor: isActive ? "rgba(6, 182, 212, 0.3)" : "rgba(255, 255, 255, 0.06)",
                    color: isActive ? "#22D3EE" : "var(--text-muted)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Switch to Lecturer Portal Banner */}
        <div style={{ marginTop: "auto", paddingTop: "16px" }}>
          <div
            style={{
              padding: "12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#818CF8", fontSize: "0.75rem", fontWeight: 700 }}>
              <SparklesIcon size={14} />
              <span>FACULTY WORKSPACE</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Preview live class sessions & timetable as a faculty member.
            </p>
            {isDemoMode ? (
              <button
                onClick={() => switchPersona("lecturer")}
                className="btn-secondary"
                style={{
                  fontSize: "0.75rem",
                  padding: "6px 10px",
                  justifyContent: "center",
                  borderColor: "rgba(99, 102, 241, 0.3)",
                  color: "#818CF8",
                }}
              >
                Switch to Lecturer (Dr. Vance)
              </button>
            ) : (
              <Link
                href="/"
                className="btn-secondary"
                style={{
                  fontSize: "0.75rem",
                  padding: "6px 10px",
                  justifyContent: "center",
                  borderColor: "rgba(99, 102, 241, 0.3)",
                  color: "#818CF8",
                  textDecoration: "none",
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
          padding: "14px 16px",
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "rgba(6, 182, 212, 0.2)",
              color: "#22D3EE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.85rem",
              flexShrink: 0,
            }}
          >
            AD
          </div>
          <div style={{ minWidth: 0 }}>
            <h4
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              System Admin
            </h4>
            <p
              style={{
                fontSize: "0.7rem",
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
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#F87171";
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
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
