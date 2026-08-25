"use client";

import React from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { RoleGuard } from "./RoleGuard";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminDashboardLayout({
  children,
  title,
  subtitle,
  actions,
}: AdminDashboardLayoutProps) {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="micro-grid-bg" style={{ display: "flex", minHeight: "100vh" }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <AdminHeader title={title} subtitle={subtitle} actions={actions} />
          <main style={{ flex: 1, padding: "28px 32px 48px 32px", overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
