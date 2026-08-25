"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogInIcon,
} from "@/components/ui/Icons";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserDisplayName, getUserSubtitle, getUserAvatarInitial } from "@/lib/userUtils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
  isLive?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, lecturerProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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
            background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
            flexShrink: 0,
          }}
        >
          <RadioIcon size={20} className="text-white" />
        </div>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.98rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            SMART<span style={{ color: "var(--accent-primary)" }}>ATTEND</span>
          </h1>
          <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", marginTop: "2px" }}>
            FACULTY COMMAND
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: "16px 12px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "3px" }}>
        <p
          className="micro-label"
          style={{
            padding: "4px 12px 8px 12px",
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
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--bg-surface)" : "transparent",
                border: isActive ? "1px solid var(--border-medium)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }}>
                  <Icon size={17} />
                </span>
                <span>{item.name}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {item.isLive && <span className="pulse-dot-live" />}
                {item.badge && (
                  <span
                    className="font-mono tabular-nums"
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      backgroundColor: "rgba(225, 29, 72, 0.08)",
                      color: "#E11D48",
                      border: "1px solid rgba(225, 29, 72, 0.25)",
                      padding: "2px 6px",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRightIcon size={14} className="text-indigo-600" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Lecturer Profile / Auth Footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        {user ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  color: "#FFFFFF",
                  flexShrink: 0,
                }}
              >
                {getUserAvatarInitial(user, lecturerProfile)}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {getUserDisplayName(user, lecturerProfile)}
                </p>
                <p className="font-mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {getUserSubtitle(user, lecturerProfile)}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "6px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.75rem",
                fontWeight: 600,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#E11D48";
                e.currentTarget.style.backgroundColor = "rgba(225, 29, 72, 0.1)";
                e.currentTarget.style.borderColor = "rgba(225, 29, 72, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            >
              <LogOutIcon size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "9px 12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--accent-primary)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.82rem",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
            }}
          >
            <LogInIcon size={16} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
}

