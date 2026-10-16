"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { adminApi, sessionsApi, noticesApi } from "@/lib/api/services";
import { AdminDashboardStats, SystemAuditLog, LectureSession, Notice } from "@/types";
import {
  UserCheckIcon,
  MapPinIcon,
  ShieldAlertIcon,
  BellIcon,
  ServerIcon,
  DownloadIcon,
  ClockIcon,
} from "@/components/ui/Icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [activeSessions, setActiveSessions] = useState<LectureSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, noticesData, auditData, activeSessionsData] = await Promise.all([
          adminApi.getStats(),
          noticesApi.getNotices(),
          adminApi.getAuditLogs(),
          sessionsApi.getActiveSessions(),
        ]);
        setStats(statsData);
        setNotices(noticesData);
        setAuditLogs(auditData);
        
        // Filter active sessions to those happening now (from 15 mins before start to end time)
        const now = new Date();
        const filteredSessions = activeSessionsData.filter(session => {
           if (session.status === "ongoing") return true;
           if (!session.scheduled_at || !session.duration_mins) return false;
           
           const start = new Date(session.scheduled_at);
           const end = new Date(start.getTime() + session.duration_mins * 60000);
           const startMinus15 = new Date(start.getTime() - 15 * 60000);
           
           return now >= startMinus15 && now <= end;
        });
        
        setActiveSessions(filteredSessions);
      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportLedger = async () => {
    try {
      const records = await sessionsApi.getAttendanceRecords();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const headers = "SessionID,StudentRegNo,TimestampUTC,Status\n";
      
      const rows = records.map(r => {
        return `${r.lecture_session_id},${r.student_index || r.student_id},${r.first_check_in_at || 'N/A'},${r.status}\n`;
      });
  
      const blob = new Blob([headers + rows.join("")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_export_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to export ledger", e);
    }
  };

  return (
    <AdminDashboardLayout
      title="Dashboard"
      subtitle="Overview of system metrics."
      actions={
        <div className="flex items-center gap-3">
          
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <Link href="/admin/notices">
              <BellIcon size={16} className="mr-2" />
              Broadcast Notice
            </Link>
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* 1. Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shrink-0">
                  <UserCheckIcon size={24} />
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">Total Students</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats?.total_students || 0}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 shrink-0">
                  <MapPinIcon size={24} />
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">Active Lecturers</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats?.total_lecturers || 0}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 shrink-0">
                  <ServerIcon size={24} />
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">Total Courses</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats?.total_courses || 0}
                  </h3>
                </div>
              </CardContent>
            </Card>


            
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 2. Live Sessions List */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 py-4">
                <CardTitle className="text-lg">Live Sessions Happening Now</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {activeSessions.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    No classes are currently active.
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                    {activeSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex justify-between items-center p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{session.course_code}: {session.course_name}</p>
                          <p className="text-xs text-slate-500 mt-1">{session.venue_name} • {session.lecturer_name}</p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                          <span className="relative flex h-1.5 w-1.5 mr-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. Latest Notices */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 py-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Recent Notices</CardTitle>
                <Link href="/admin/notices" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                  View All &rarr;
                </Link>
              </CardHeader>
              <CardContent className="p-5 flex-1 overflow-y-auto max-h-[400px]">
                {notices.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    No notices available.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {notices.slice(0, 5).map((notice, i) => (
                      <div key={i} className={cn(
                        "flex flex-col gap-1.5 p-4 rounded-xl border bg-white dark:bg-slate-800/50",
                        notice.urgency === 'urgent' ? 'border-l-4 border-l-red-500 border-slate-200 dark:border-slate-700' :
                        notice.urgency === 'high' ? 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-700' :
                        'border-l-4 border-l-cyan-500 border-slate-200 dark:border-slate-700'
                      )}>
                        <div className="flex justify-between items-start">
                           <p className="font-bold text-sm text-slate-900 dark:text-white">{notice.title}</p>
                           <span className="text-[0.65rem] text-slate-500 whitespace-nowrap ml-2 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{new Date(notice.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{notice.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
          </div>

          
          
        </div>
      )}
    </AdminDashboardLayout>
  );
}
