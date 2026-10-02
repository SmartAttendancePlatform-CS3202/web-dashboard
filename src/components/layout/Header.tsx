"use client";

import React from "react";
import Link from "next/link";
import { BellIcon, PlayIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Dashboard", subtitle }: HeaderProps) {
  return (
    <header className="no-print h-[70px] px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Context */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full uppercase tracking-wider text-[0.65rem] font-bold">
            Lecturer Mode
          </Badge>
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Launch Session Button removed as per request */}

        <ThemeToggle />

        {/* Alert Bell (Commented out per request) */}
        {/* <Button variant="outline" size="icon" asChild className="relative w-9 h-9 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
          <Link href="/alerts">
            <BellIcon size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[0.65rem] font-bold flex items-center justify-center">
              2
            </span>
          </Link>
        </Button> */}
      </div>
    </header>
  );
}
