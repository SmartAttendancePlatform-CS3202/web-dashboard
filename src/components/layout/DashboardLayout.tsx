"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { RoleGuard } from "./RoleGuard";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <RoleGuard allowedRoles={["lecturer", "admin"]}>
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-main)" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header title={title} subtitle={subtitle} />
        <main style={{ padding: "32px", flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
    </RoleGuard>
  );
}
