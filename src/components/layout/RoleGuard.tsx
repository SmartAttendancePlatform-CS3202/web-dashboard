"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { UserRole } from "@/types";
import { ShieldAlertIcon, ChevronRightIcon } from "@/components/ui/Icons";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="glass-card" style={{ padding: "40px 60px", textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(99, 102, 241, 0.2)",
              borderTopColor: "var(--accent-primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px auto",
            }}
          />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)" }}>
            Verifying Role Permissions...
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Validating identity token against University RBAC policy
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentRole = user.role;
  const isAuthorized = allowedRoles.includes(currentRole as UserRole);

  if (!isAuthorized) {
    const requiredRoleName = allowedRoles.includes("admin") ? "University Administrator" : allowedRoles.join(" or ");

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div
          className="glass-card"
          style={{
            maxWidth: "540px",
            width: "100%",
            padding: "40px",
            textAlign: "center",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            background: "linear-gradient(180deg, rgba(239, 68, 68, 0.06) 0%, rgba(15, 23, 42, 0.95) 100%)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#F87171",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
            }}
          >
            <ShieldAlertIcon size={32} />
          </div>

          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
            Administrative Privilege Required
          </h2>

          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
            Your current authenticated account (<strong>{user?.email || "Current User"}</strong>) is registered with the{" "}
            <span style={{ color: "var(--accent-secondary)", textTransform: "capitalize", fontWeight: 600 }}>
              {currentRole}
            </span>{" "}
            role. This section is restricted to <strong>{requiredRoleName}</strong> accounts.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>


            <Link
              href="/"
              className="btn-secondary"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            >
              <span>Return to Faculty Dashboard</span>
              <ChevronRightIcon size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
