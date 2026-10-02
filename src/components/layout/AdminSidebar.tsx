"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogInIcon,
} from "@/components/ui/Icons";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
// Badge import removed
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
  isNew?: boolean;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/admin", icon: HomeIcon },
    { name: "Users", href: "/admin/users", icon: UserCheckIcon, badge: "Directory" },
    { name: "Departments", href: "/admin/departments", icon: CalendarIcon },
    { name: "Courses", href: "/admin/courses", icon: BookOpenIcon, badge: "28" },
    { name: "Venues", href: "/admin/venues", icon: MapPinIcon },
    // { name: "Reports", href: "/admin/reports", icon: BarChartIcon },
    { name: "Notices", href: "/admin/notices", icon: BellIcon },
  ];

  return (
    <aside className="no-print w-64 h-screen sticky top-0 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 z-40">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <ShieldAlertIcon size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">
            directX
          </h2>
          <div className="flex items-center mt-0.5">
            <span className="font-mono text-[0.62rem] font-bold tracking-wider uppercase text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-800">
              Admin Mode
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        <div className="text-[0.7rem] font-bold tracking-widest uppercase text-slate-400 px-3 pb-2">
          Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive 
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700 font-bold" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className={isActive ? "text-blue-400" : "text-slate-500"}>
                  <Icon size={18} />
                </div>
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className={cn(
                  "font-mono text-[0.68rem] font-bold px-1.5 py-0.5 rounded-full border",
                  isActive
                    ? "bg-blue-900/30 text-blue-400 border-blue-800"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile / Auth Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="font-mono w-8 h-8 rounded-lg bg-indigo-900/30 text-indigo-400 flex items-center justify-center font-extrabold text-xs border border-indigo-800 shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <h4 className="text-[0.78rem] font-bold text-white truncate">
                  System Admin
                </h4>
                <p className="font-mono text-[0.68rem] text-slate-400 truncate">
                  {user?.email || "admin@university.ac.lk"}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              title="Sign Out"
              className="h-8 px-2 text-slate-400 border-slate-700 bg-slate-800 hover:text-red-400 hover:bg-red-950/30 hover:border-red-900"
            >
              <LogOutIcon size={14} className="mr-1" />
              <span>Sign Out</span>
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20">
            <Link href="/login">
              <LogInIcon size={16} className="mr-2" />
              Sign In
            </Link>
          </Button>
        )}
      </div>
    </aside>
  );
}
