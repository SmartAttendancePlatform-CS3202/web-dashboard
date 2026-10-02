import React from "react";
import { Card, CardContent } from "@/components/ui/card";
// Badge import removed
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon?: React.ReactNode;
  accentColor?: "indigo" | "emerald" | "amber" | "rose" | "cyan" | "blue";
  className?: string;
  badge?: string;
  progressPercent?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = "indigo",
  className = "",
  badge,
  progressPercent,
}: StatCardProps) {
  
  const colors = {
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/30",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-200 dark:border-indigo-800",
      progress: "bg-indigo-600 dark:bg-indigo-500",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      progress: "bg-emerald-600 dark:bg-emerald-500",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      progress: "bg-amber-600 dark:bg-amber-500",
    },
    rose: {
      bg: "bg-rose-50 dark:bg-rose-900/30",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-200 dark:border-rose-800",
      progress: "bg-rose-600 dark:bg-rose-500",
    },
    cyan: {
      bg: "bg-cyan-50 dark:bg-cyan-900/30",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-200 dark:border-cyan-800",
      progress: "bg-cyan-600 dark:bg-cyan-500",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      progress: "bg-blue-600 dark:bg-blue-500",
    }
  };

  const theme = colors[accentColor] || colors.indigo;

  return (
    <Card className={cn("bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1", className)}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[0.7rem] font-bold tracking-widest uppercase text-slate-500">{title}</p>
                {badge && (
                  <span className={cn("font-mono text-[0.62rem] font-bold px-1.5 py-0.5 rounded border", theme.bg, theme.text, theme.border)}>
                    {badge}
                  </span>
                )}
              </div>

              <h3 className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
                {value}
              </h3>
            </div>

            {icon && (
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", theme.bg, theme.text, theme.border)}>
                {icon}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar if supplied */}
        {typeof progressPercent === "number" && (
          <div className="mt-3">
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500 ease-out", theme.progress)}
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          </div>
        )}

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-3">
            {trend && (
              <span className={cn(
                "font-mono text-[0.72rem] font-bold px-2 py-0.5 rounded-full border",
                trend.positive 
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
              )}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-slate-500 text-xs font-medium">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
