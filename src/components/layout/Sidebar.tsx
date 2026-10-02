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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    { name: "Active Session", href: "/session/live", icon: RadioIcon, isLive: true },
    { name: "Teaching Timetable", href: "/timetable", icon: CalendarIcon },
    { name: "Courses & Rosters", href: "/courses", icon: BookOpenIcon },
    { name: "Attendance Hub", href: "/attendance", icon: UserCheckIcon },
    { name: "Reports & Analytics", href: "/reports", icon: BarChartIcon },
    { name: "Notices Broadcast", href: "/notices", icon: BellIcon },
    // { name: "Security Alerts", href: "/alerts", icon: ShieldAlertIcon, badge: "2" },
  ];

  return (
    <aside className="no-print w-64 h-screen sticky top-0 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 z-40">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <RadioIcon size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight leading-tight">
            Attend<span className="text-indigo-400">X</span>
          </h1>
          <p className="text-[0.68rem] text-slate-400 font-bold tracking-wider mt-0.5 uppercase">
            Faculty Command
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-1">
        <p className="text-[0.7rem] font-bold tracking-widest uppercase text-slate-400 px-3 pb-2">
          Operations
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

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
                <span className={isActive ? "text-indigo-400" : "text-slate-500"}>
                  <Icon size={18} />
                </span>
                <span>{item.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {item.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
                {item.badge && (
                  <span className="font-mono text-[0.68rem] font-bold bg-red-950/30 text-red-500 border border-red-900/50 px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRightIcon size={14} className="text-indigo-400" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Lecturer Profile / Auth Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center font-extrabold text-xs text-white shrink-0">
                {getUserAvatarInitial(user, lecturerProfile)}
              </div>
              <div className="min-w-0">
                <p className="text-[0.78rem] font-bold text-white truncate">
                  {getUserDisplayName(user, lecturerProfile)}
                </p>
                <p className="font-mono text-[0.68rem] text-slate-400 truncate">
                  {getUserSubtitle(user, lecturerProfile)}
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
          <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
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
