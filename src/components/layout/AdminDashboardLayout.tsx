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
      <div className="flex min-h-screen bg-transparent">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader title={title} subtitle={subtitle} actions={actions} />
          <main className="flex-1 p-8 overflow-y-auto z-10">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
