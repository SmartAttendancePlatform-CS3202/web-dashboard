"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrendChart } from "@/components/charts/TrendChart";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { reportsApi, schedulingApi } from "@/lib/api/services";
import { CourseOffering, OfferingReport, TrendData } from "@/types";
import {
  BarChartIcon,
  DownloadIcon,
  PrinterIcon,
  AlertTriangleIcon,
  ClockIcon,
  UserCheckIcon,
} from "@/components/ui/Icons";

export default function ReportsPage() {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>("off-001");
  const [report, setReport] = useState<OfferingReport | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const [offs, rep, tr] = await Promise.all([
          schedulingApi.getAllOfferings(),
          reportsApi.getOfferingReport(selectedOfferingId),
          reportsApi.getOfferingTrends(selectedOfferingId),
        ]);
        setOfferings(offs);
        setReport(rep);
        setTrends(tr);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [selectedOfferingId]);

  const handlePrintPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!report) return;
    const headers = ["Student Index", "Student Full Name", "Risk Status", "Consecutive Absences / Details"];
    const rows = report.absentee_list.map((a) => [
      a.student_index || "",
      a.student_name || "",
      "HIGH RISK (Below 80%)",
      `Consecutive Absences: ${a.consecutive_absences || 1} - ${a.flag_reason || ""}`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `faculty_attendance_report_${selectedOfferingId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentOffering = offerings.find((o) => o.id === selectedOfferingId);

  return (
    <DashboardLayout
      title="Attendance Analytics & Faculty Reports"
      subtitle="Course compliance trajectories, at-risk student intervention lists, and official department exports."
    >
      {/* Action Controls & Course Filter */}
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            Select Course Offering:
          </label>
          <select
            className="input-control"
            style={{ width: "300px" }}
            value={selectedOfferingId}
            onChange={(e) => setSelectedOfferingId(e.target.value)}
          >
            {offerings.map((off) => (
              <option key={off.id} value={off.id} style={{ backgroundColor: "#111827" }}>
                {off.course_code}: {off.course_name} ({off.day})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button type="button" className="btn-secondary" onClick={handleExportCSV}>
            <DownloadIcon size={14} /> Export CSV
          </button>
          <button type="button" className="btn-primary" onClick={handlePrintPDF}>
            <PrinterIcon size={14} /> Print Official PDF
          </button>
        </div>
      </div>

      {/* Official Printable Report Container */}
      <div id="printable-report" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          <StatCard
            title="Overall Attendance"
            value={`${report?.attendance_percentage || 87.4}%`}
            subtitle="Semester average"
            accentColor={((report?.attendance_percentage || 0) >= 80) ? "emerald" : "rose"}
            icon={<BarChartIcon size={22} />}
          />
          <StatCard
            title="Total Lectures Held"
            value={report?.total_sessions || 7}
            subtitle="Completed sessions"
            accentColor="indigo"
            icon={<ClockIcon size={22} />}
          />
          <StatCard
            title="Total Registered Students"
            value={report?.total_students || 58}
            subtitle="Enrolled candidates"
            accentColor="cyan"
            icon={<UserCheckIcon size={22} />}
          />
          <StatCard
            title="At-Risk Students"
            value={report?.absentee_list.length || 2}
            subtitle="Below 80% attendance threshold"
            accentColor="rose"
            icon={<AlertTriangleIcon size={22} />}
          />
        </div>

        {/* Visual Trend Chart Card */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Attendance Compliance Trajectory
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                Session-by-session attendance percentage with 80% university requirement benchmark line
              </p>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#818CF8",
                backgroundColor: "rgba(99, 102, 241, 0.15)",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              {currentOffering?.course_code || "CS4012"}
            </span>
          </div>

          <div>
            {trends && <TrendChart data={trends.trends} height={260} />}
          </div>
        </div>

        {/* At-Risk Intervention & Late Arrivals Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
          {/* At-Risk Students List */}
          <div className="glass-card" style={{ padding: "24px", borderColor: "rgba(239, 68, 68, 0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ color: "#EF4444" }}><AlertTriangleIcon size={20} /></div>
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  At-Risk Candidates (Below 80% Threshold)
                </h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Require academic advising and attendance warning notices
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {report?.absentee_list.map((student) => (
                <div
                  key={student.student_id}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(239, 68, 68, 0.05)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {student.student_name}
                      </span>
                      <code style={{ fontSize: "0.75rem", color: "#F87171" }}>
                        {student.student_index}
                      </code>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                      {student.flag_reason}
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                      color: "#F87171",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {student.consecutive_absences} Consecutive Absences
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Late Arrival Summary */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ color: "#F59E0B" }}><ClockIcon size={20} /></div>
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Recent Late Arrivals (Beyond 10m Window)
                </h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Students checked in between 10 to 30 minutes after lecture commencement
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {report?.late_arrival_list.map((student) => (
                <div
                  key={student.student_id}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(245, 158, 11, 0.05)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {student.student_name}
                    </span>
                    <code style={{ fontSize: "0.75rem", color: "#FBBF24", marginLeft: "6px" }}>
                      {student.student_index}
                    </code>
                  </div>

                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    Checked In: {student.first_check_in_at}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
