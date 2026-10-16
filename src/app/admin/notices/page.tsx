"use client";

import React, { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { noticesApi, adminApi } from "@/lib/api/services";
import { Notice, CourseOffering } from "@/types";
import { BroadcastModalButton } from "@/components/admin/BroadcastModalButton";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      try {
        const [noticesData, offs] = await Promise.all([
          noticesApi.getNotices(),
          adminApi.getAllOfferings(),
        ]);
        setNotices(noticesData);
        setOfferings(offs);
      } catch (err) {
        console.error("Error loading notices:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AdminDashboardLayout
      title="Broadcast & Notices"
      subtitle="Manage university-wide and course-specific announcements."
      actions={<BroadcastModalButton offerings={offerings} />}
    >

      <div className="grid gap-4">
        {loading ? (
          <div className="p-10 text-center text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p>Loading announcements...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="p-10 text-center text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p>No announcements found.</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div 
                className={`absolute top-0 left-0 bottom-0 w-1 ${
                  notice.urgency === "urgent"
                    ? "bg-red-400"
                    : notice.urgency === "high"
                    ? "bg-amber-400"
                    : "bg-cyan-400"
                }`}
              />
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex gap-2.5 items-center mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[0.7rem] font-bold uppercase ${
                        notice.urgency === "urgent"
                          ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          : notice.urgency === "high"
                          ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                          : "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
                      }`}
                    >
                      {notice.urgency} PRIORITY
                    </span>
                    <span className="text-[0.75rem] text-slate-500 font-mono font-medium">
                      Target: {notice.course_code || "ALL UNIVERSITY"}
                    </span>
                  </div>
                  <h4 className="text-[1.1rem] font-bold text-slate-900 dark:text-white">
                    {notice.title}
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-[0.75rem] text-slate-500 font-medium">
                    {new Date(notice.created_at).toLocaleDateString()} at{" "}
                    {new Date(notice.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <p className="text-[0.88rem] text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {notice.body}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[0.75rem] text-slate-500">
                <span>Issued by: <strong className="text-slate-700 dark:text-slate-300">{notice.creator_name || "Office of Administration"}</strong></span>
                <span>{notice.read_count || 0} mobile acknowledgments</span>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminDashboardLayout>
  );
}
