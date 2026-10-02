"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
// Badge import removed
import { cn } from "@/lib/utils";
import { TrendChart } from "@/components/charts/TrendChart";
import {
  BookOpenIcon,
  UserCheckIcon,
  CalendarIcon,
  ShieldAlertIcon,
  RadioIcon,
  PlayIcon,
  ClockIcon,
  MapPinIcon,
  ChevronRightIcon,
  BellIcon,
} from "@/components/ui/Icons";
import { useAuth } from "@/lib/context/AuthContext";
import { schedulingApi, attendanceApi, reportsApi, alertsApi, noticesApi } from "@/lib/api/services";
import { CourseOffering, LectureSession, OfferingReport, TrendData, SystemAlert, Notice } from "@/types";

export default function HomePage() {
  const { lecturerProfile } = useAuth();
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [sessions, setSessions] = useState<LectureSession[]>([]);
  const [report, setReport] = useState<OfferingReport | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const offs = await schedulingApi.getLecturerTimetable();
        const activeOffId = offs.length > 0 ? offs[0].id : null;

        const [sess, rep, tr, al, nots] = await Promise.all([
          attendanceApi.getSessions(),
          activeOffId ? reportsApi.getOfferingReport(activeOffId).catch(() => null) : Promise.resolve(null),
          activeOffId ? reportsApi.getOfferingTrends(activeOffId).catch(() => null) : Promise.resolve(null),
          alertsApi.getAlerts().catch(() => []),
          noticesApi.getNotices().catch(() => []),
        ]);

        setOfferings(offs);
        
        // Filter sessions and notices to only those related to the lecturer's offerings
        const myOfferingIds = new Set(offs.map((o) => o.id));

        
        const mySessions = sess.filter((s) => myOfferingIds.has(s.course_offering_id));
        const myNotices = nots.filter((n) => !n.course_offering_id || myOfferingIds.has(n.course_offering_id));

        setSessions(mySessions);
        setReport(rep as OfferingReport | null);
        setTrends(tr as TrendData | null);
        setAlerts(al);
        setNotices(myNotices);
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const now = new Date();
  const liveSession = sessions.find((s) => {
    if (s.status === "ongoing") return true;
    const start = new Date(s.scheduled_at);
    const end = new Date(start.getTime() + s.duration_mins * 60000);
    const startMinus15 = new Date(start.getTime() - 15 * 60000);
    return now >= startMinus15 && now <= end;
  });
  const totalEnrolledStudents = offerings.reduce((sum, o) => sum + (o.enrolled_count || 0), 0);
  
  let markedCount = 0;
  let enrolledCount = 0;
  sessions.forEach(s => {
    markedCount += s.present_count || 0;
    enrolledCount += s.total_enrolled || 0;
  });
  const averageAttendance = enrolledCount > 0 ? (markedCount / enrolledCount) * 100 : (report?.attendance_percentage ?? 0);

  const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };
  const todaysSessions = sessions.filter(s => isToday(s.scheduled_at)).sort((a,b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  if (loading) {
  return (
      <DashboardLayout
        title="Dashboard"
        subtitle="Loading faculty dashboard..."
      >
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading dashboard metrics and active sessions...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Welcome back, ${lecturerProfile?.display_name || "Doctor"}`}
      subtitle="Overview of your classes and attendance."
    >
      {/* Live Session Alert Banner if active */}
      {liveSession && (
        <div className="mb-6 p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 shadow-sm flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <RadioIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[0.85rem] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
                  Live Session Happening Now
                </span>
              </div>
              <h4 className="text-[1.1rem] font-bold text-slate-900 dark:text-white leading-tight">
                {liveSession.course_code}: {liveSession.course_name} (Session #{liveSession.session_number})
              </h4>
              <p className="text-[0.8rem] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                {liveSession.venue_name} • {liveSession.present_count} / {liveSession.total_enrolled} Checked In
              </p>
            </div>
          </div>

          <Link href="/session/live" className="relative z-10 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-md shadow-red-600/20 transition-all hover:scale-105 active:scale-95">
            <span>Join Live Session</span>
            <ChevronRightIcon size={16} />
          </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-7">
        <StatCard
          title="My Active Courses"
          value={offerings.length}
          subtitle="Courses assigned to you"
          icon={<BookOpenIcon size={22} />}
          accentColor="indigo"
        />
        <StatCard
          title="My Enrolled Students"
          value={totalEnrolledStudents}
          subtitle="Across all your lectures"
          icon={<UserCheckIcon size={22} />}
          accentColor="cyan"
        />
        <StatCard
          title="My Avg. Attendance"
          value={`${averageAttendance.toFixed(1)}%`}
          trend={{ value: "Based on checked-in vs enrolled", positive: true }}
          icon={<UserCheckIcon size={22} />}
          accentColor="emerald"
        />
      </div>

      {/* Main Grid: Schedule & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">
        
        {/* Today's Schedule */}
        <div 
          onClick={() => window.location.href = '/timetable'}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-400/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                <CalendarIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Today&apos;s Classes
              </h3>
            </div>
            <Link href="/timetable" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Full Timetable &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-3 flex-1 relative z-10 overflow-y-auto custom-scrollbar max-h-[350px] pr-1">
            {todaysSessions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <CalendarIcon size={32} className="opacity-20 mb-3" />
                <p className="text-sm font-medium">It looks quiet here! You have no classes scheduled today.</p>
              </div>
            ) : todaysSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between group/item hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all shadow-sm relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl opacity-0 group-hover/item:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded uppercase tracking-wider">{sess.course_code || offerings.find(o => o.id === sess.course_offering_id)?.course_code}</span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">{new Date(sess.scheduled_at).toLocaleDateString('en-US', {weekday: 'short'})}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {sess.course_name || offerings.find(o => o.id === sess.course_offering_id)?.course_name}
                  </h4>
                  <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md">
                      <ClockIcon size={12} className="text-blue-500 dark:text-blue-400" /> 
                      {new Date(sess.scheduled_at).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md">
                      <MapPinIcon size={12} className="text-emerald-500 dark:text-emerald-400" /> {sess.venue_name || offerings.find(o => o.id === sess.course_offering_id)?.venue_name}
                    </span>
                  </div>
                </div>
                
                <div className="ml-3 flex flex-col items-end gap-2">
                  <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md text-xs font-bold whitespace-nowrap shadow-sm border border-blue-200 dark:border-blue-800">
                    Session {sess.session_number}
                  </span>
                  <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider border shadow-sm ${sess.status === 'ongoing' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 animate-pulse' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {sess.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Broadcast Notices */}
        <div 
          onClick={() => window.location.href = '/notices'}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-400/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg"><BellIcon size={20} /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Recent Announcements
              </h3>
            </div>
            <Link href="/notices" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              All Notices &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-3 relative z-10 overflow-y-auto custom-scrollbar max-h-[350px] pr-1">
            {notices.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                 <BellIcon size={32} className="opacity-20 mb-3" />
                 <p className="text-sm font-medium">No recent announcements.</p>
              </div>
            ) : notices.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all relative overflow-hidden group/notice shadow-sm"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-xl opacity-0 group-hover/notice:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.65rem] font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded uppercase tracking-wider">{n.course_code}</span>
                  <span className={cn(
                    "text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider border shadow-sm",
                    n.urgency === "high" 
                      ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" 
                      : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}>
                    {n.urgency}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1.5">{n.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium">
                  {n.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
