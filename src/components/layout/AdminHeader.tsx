"use client";

import React, { useEffect, useState } from "react";

import { ShieldAlertIcon, ClockIcon } from "@/components/ui/Icons";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toTimeString().split(" ")[0] + " UTC"
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="no-print px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
            {title}
          </h1>
          <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider text-[0.65rem] font-bold">
            <ShieldAlertIcon size={12} /> Admin Mode
          </Badge>
        </div>
        {subtitle && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 shadow-inner">
          <ClockIcon size={14} className="text-cyan-600 dark:text-cyan-400" />
          <span className="font-mono tracking-wider">{timeString}</span>
        </div>

        <ThemeToggle />

        {/* Extra Action Buttons */}
        {actions}
      </div>
    </header>
  );
}
