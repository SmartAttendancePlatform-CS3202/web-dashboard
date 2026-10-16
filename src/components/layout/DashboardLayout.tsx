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
    <div className="flex min-h-screen bg-transparent">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-8 overflow-y-auto z-10">
          {children}
        </main>
      </div>
    </div>
    </RoleGuard>
  );
}
